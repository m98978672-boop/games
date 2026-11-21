from __future__ import annotations

import asyncio
import base64
import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import threading
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from dotenv import load_dotenv
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
DATA_DIR = Path(os.getenv("DATA_DIR", str(BASE_DIR / "data"))).resolve()
MEDIA_DIR = DATA_DIR / "media"
QUEUE_FILE = DATA_DIR / "queue.json"
TOKEN_FILE = DATA_DIR / "token.json"
CLIENT_SECRETS = Path(os.getenv("GOOGLE_CLIENT_SECRETS_FILE", str(BASE_DIR / "client_secret.json"))).resolve()
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://localhost:8765").rstrip("/")
REDIRECT_URI = f"{PUBLIC_BASE_URL}/oauth2callback"
APP_ACCESS_PASSWORD = os.getenv("APP_ACCESS_PASSWORD")
SESSION_SIGNING_KEY = os.getenv("APP_SESSION_SECRET", "") or secrets.token_urlsafe(32)
if PUBLIC_BASE_URL.startswith("https://") and not APP_ACCESS_PASSWORD:
    raise RuntimeError("APP_ACCESS_PASSWORD is required when exposing the app over HTTPS.")
SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]
MAX_VIDEO_BYTES = 10 * 1024 * 1024 * 1024
ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mpeg", ".mpg", ".avi", ".wmv", ".flv", ".webm", ".3gpp"}

queue_lock = threading.Lock()
uploading_ids: set[str] = set()
oauth_states: dict[str, tuple[Flow, float]] = {}
channel_cache: dict[str, Any] = {"at": 0.0, "value": None}


def make_session_cookie() -> str:
    payload = f"{int(time.time())}:{secrets.token_urlsafe(18)}".encode()
    signature = hmac.new(SESSION_SIGNING_KEY.encode(), payload, hashlib.sha256).digest()
    encode = lambda value: base64.urlsafe_b64encode(value).decode().rstrip("=")
    return f"{encode(payload)}.{encode(signature)}"


def valid_session_cookie(value: str | None) -> bool:
    if not value:
        return False
    try:
        payload_part, signature_part = value.split(".", 1)
        decode = lambda part: base64.urlsafe_b64decode(part + "=" * (-len(part) % 4))
        payload, signature = decode(payload_part), decode(signature_part)
        timestamp = int(payload.split(b":", 1)[0])
    except (ValueError, TypeError):
        return False
    expected = hmac.new(SESSION_SIGNING_KEY.encode(), payload, hashlib.sha256).digest()
    return hmac.compare_digest(signature, expected) and 0 <= time.time() - timestamp < 12 * 60 * 60


def load_queue() -> list[dict[str, Any]]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not QUEUE_FILE.exists():
        return []
    try:
        payload = json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
        return payload if isinstance(payload, list) else []
    except (OSError, json.JSONDecodeError):
        return []


def save_queue(jobs: list[dict[str, Any]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    temp_path = QUEUE_FILE.with_suffix(".tmp")
    temp_path.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temp_path, QUEUE_FILE)
    try:
        os.chmod(QUEUE_FILE, 0o600)
    except OSError:
        pass


def load_credentials() -> Credentials | None:
    if not TOKEN_FILE.exists():
        return None
    try:
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    except (ValueError, OSError):
        return None
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())
            store_credentials(creds)
        except Exception:
            return None
    return creds if creds.valid else None


def store_credentials(creds: Credentials) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    TOKEN_FILE.write_text(creds.to_json(), encoding="utf-8")
    try:
        os.chmod(TOKEN_FILE, 0o600)
    except OSError:
        pass


def youtube_service():
    creds = load_credentials()
    if not creds:
        raise HTTPException(status_code=401, detail="Сначала подключите YouTube через Google OAuth.")
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def get_channel_summary() -> dict[str, Any] | None:
    creds = load_credentials()
    if not creds:
        return None
    if time.time() - channel_cache["at"] < 300:
        return channel_cache["value"]
    try:
        yt = build("youtube", "v3", credentials=creds, cache_discovery=False)
        response = yt.channels().list(part="snippet,statistics", mine=True, maxResults=1).execute()
        items = response.get("items", [])
        if not items:
            value = {"error": "К этому Google-аккаунту не привязан YouTube-канал."}
        else:
            channel = items[0]
            value = {
                "title": channel.get("snippet", {}).get("title", "YouTube канал"),
                "id": channel.get("id"),
                "subscribers": channel.get("statistics", {}).get("subscriberCount"),
                "videos": channel.get("statistics", {}).get("videoCount"),
                "url": f"https://www.youtube.com/channel/{channel.get('id')}",
            }
    except Exception as exc:
        value = {"error": f"Не удалось получить данные канала: {str(exc)[:350]}"}
    channel_cache["value"] = value
    channel_cache["at"] = time.time()
    return value


def parse_publish_at(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Укажите корректное время публикации.") from exc
    if parsed.tzinfo is None:
        raise HTTPException(status_code=400, detail="Время должно содержать часовой пояс.")
    parsed = parsed.astimezone(timezone.utc)
    if parsed < datetime.now(timezone.utc) + timedelta(minutes=15):
        raise HTTPException(status_code=400, detail="Для публикации по расписанию выберите время минимум через 15 минут.")
    return parsed


def upload_job(job: dict[str, Any]) -> str:
    yt = youtube_service()
    video_path = MEDIA_DIR / job["filename"]
    if not video_path.is_file():
        raise RuntimeError("Исходный видеофайл не найден на сервере.")
    body = {
        "snippet": {
            "title": job["title"],
            "description": job["description"],
            "tags": job["tags"],
            "categoryId": job["category_id"],
        },
        "status": {
            "privacyStatus": "private",
            "publishAt": job["publish_at"],
            "selfDeclaredMadeForKids": job["made_for_kids"],
        },
    }
    mime_type = mimetypes.guess_type(video_path.name)[0] or "video/mp4"
    media = MediaFileUpload(str(video_path), mimetype=mime_type, chunksize=8 * 1024 * 1024, resumable=True)
    request = yt.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        _, response = request.next_chunk()
    return response["id"]


def update_job(job_id: str, **updates: Any) -> None:
    with queue_lock:
        jobs = load_queue()
        for job in jobs:
            if job["id"] == job_id:
                job.update(updates)
                break
        save_queue(jobs)


async def queue_worker() -> None:
    while True:
        await asyncio.sleep(4)
        if not load_credentials():
            continue
        with queue_lock:
            jobs = load_queue()
            pending = next((j for j in jobs if j.get("status") == "queued" and j["id"] not in uploading_ids), None)
            if not pending:
                continue
            uploading_ids.add(pending["id"])
            pending["status"] = "uploading"
            pending["updated_at"] = datetime.now(timezone.utc).isoformat()
            save_queue(jobs)
        try:
            video_id = await asyncio.to_thread(upload_job, pending)
            update_job(
                pending["id"],
                status="scheduled",
                video_id=video_id,
                watch_url=f"https://youtu.be/{video_id}",
                updated_at=datetime.now(timezone.utc).isoformat(),
                error=None,
            )
        except Exception as exc:
            update_job(
                pending["id"],
                status="failed",
                error=str(exc)[:800],
                updated_at=datetime.now(timezone.utc).isoformat(),
            )
        finally:
            uploading_ids.discard(pending["id"])


@asynccontextmanager
async def lifespan(_: FastAPI):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    task = asyncio.create_task(queue_worker())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="YouTube Channel Bot", lifespan=lifespan)


@app.middleware("http")
async def protect_public_preview(request: Request, call_next):
    if APP_ACCESS_PASSWORD:
        if request.url.path not in {"/login", "/auth/start", "/oauth2callback", "/health"} and not valid_session_cookie(request.cookies.get("ytbot_session")):
            if request.url.path.startswith("/api/"):
                return JSONResponse({"detail": "Сначала войдите в панель."}, status_code=401)
            return RedirectResponse("/login", status_code=303)
        if request.method in {"POST", "DELETE"} and request.url.path != "/login":
            origin = request.headers.get("origin", "").rstrip("/")
            if origin != PUBLIC_BASE_URL:
                return JSONResponse({"detail": "Запрос отклонён: неверный источник."}, status_code=403)
    return await call_next(request)


LOGIN_HTML = '''<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Вход — YouTube Bot</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#f3f5fa;font:16px system-ui}main{width:min(380px,calc(100vw - 36px));padding:26px;background:#141821;border:1px solid #303847;border-radius:16px}h1{font-size:21px;margin:0 0 8px}p{color:#aab4c2;font-size:14px}input,button{width:100%;box-sizing:border-box;padding:12px;border-radius:9px;font:inherit}input{background:#0d1118;border:1px solid #3a4352;color:white;margin:10px 0}button{border:0;background:#ff3854;color:white;font-weight:700;cursor:pointer}.err{color:#ff8292}</style><main><h1>Вход в YouTube Bot</h1><p>Введите временный пароль доступа к этой панели.</p>{error}<form method="post" action="/login"><input type="password" name="password" autocomplete="current-password" placeholder="Пароль доступа" required autofocus><button type="submit">Войти</button></form></main></html>'''


@app.get("/login", response_class=HTMLResponse)
def login_page():
    return LOGIN_HTML.replace("{error}", "")


@app.post("/login")
def login(request: Request, password: str = Form(...)):
    origin = request.headers.get("origin", "").rstrip("/")
    if APP_ACCESS_PASSWORD and origin != PUBLIC_BASE_URL:
        return HTMLResponse(LOGIN_HTML.replace("{error}", '<p class="err">Запрос отклонён. Обновите страницу и попробуйте снова.</p>'), status_code=403)
    if not APP_ACCESS_PASSWORD or not hmac.compare_digest(password, APP_ACCESS_PASSWORD):
        return HTMLResponse(LOGIN_HTML.replace("{error}", '<p class="err">Пароль не подошёл. Попробуйте ещё раз.</p>'), status_code=401)
    response = RedirectResponse("/", status_code=303)
    response.set_cookie(
        "ytbot_session", make_session_cookie(), max_age=12 * 60 * 60,
        httponly=True, secure=PUBLIC_BASE_URL.startswith("https://"), samesite="lax", path="/",
    )
    return response


@app.get("/", response_class=HTMLResponse)
def home():
    return HTML


@app.get("/health")
def health():
    return {"ok": True, "connected": load_credentials() is not None}


@app.get("/api/status")
def status():
    jobs = sorted(load_queue(), key=lambda item: item.get("created_at", ""), reverse=True)
    return {
        "connected": load_credentials() is not None,
        "client_configured": CLIENT_SECRETS.is_file(),
        "channel": get_channel_summary(),
        "jobs": jobs,
        "redirect_uri": REDIRECT_URI,
    }


@app.get("/auth/start")
def auth_start():
    if not CLIENT_SECRETS.is_file():
        raise HTTPException(
            status_code=400,
            detail=f"Не найден OAuth-файл: {CLIENT_SECRETS.name}. Сначала настройте OAuth-клиент в Google Cloud.",
        )
    try:
        flow = Flow.from_client_secrets_file(str(CLIENT_SECRETS), scopes=SCOPES, redirect_uri=REDIRECT_URI)
        url, state = flow.authorization_url(access_type="offline", include_granted_scopes="true", prompt="consent")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Не удалось подготовить Google OAuth: {exc}") from exc
    now = time.time()
    # Keep the Flow itself: Google auth-code flow may use PKCE, whose verifier
    # must survive the redirect and be reused during token exchange.
    oauth_states[state] = (flow, now + 600)
    for old_state, (_, expiry) in list(oauth_states.items()):
        if expiry < now:
            oauth_states.pop(old_state, None)
    return RedirectResponse(url)


@app.get("/oauth2callback")
def oauth_callback(request: Request, code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        return RedirectResponse("/?oauth_error=" + error)
    saved_flow = oauth_states.pop(state or "", None)
    if not code or not state or saved_flow is None or saved_flow[1] < time.time():
        raise HTTPException(status_code=400, detail="OAuth-состояние не найдено или истекло. Начните подключение заново.")
    flow = saved_flow[0]
    try:
        flow.fetch_token(code=code)
        store_credentials(flow.credentials)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Не удалось завершить подключение Google: {str(exc)[:400]}") from exc
    return HTMLResponse(
        "<!doctype html><html lang='ru'><meta charset='utf-8'><title>YouTube подключён</title>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        "<body style='font:18px system-ui;max-width:640px;margin:12vh auto;padding:24px;color:#172033'>"
        "<h1>YouTube подключён</h1><p>Разрешение сохранено в защищённом хранилище этого бота. "
        "Можно закрыть эту вкладку.</p></body></html>"
    )


@app.post("/api/jobs")
async def create_job(
    title: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    category_id: str = Form("22"),
    publish_at: str = Form(...),
    made_for_kids: str = Form(...),
    video: UploadFile = File(...),
):
    if not load_credentials():
        raise HTTPException(status_code=401, detail="Сначала подключите YouTube.")
    title = title.strip()
    if not title or len(title) > 100:
        raise HTTPException(status_code=400, detail="Название обязательно и должно быть не длиннее 100 символов.")
    if len(description) > 5000:
        raise HTTPException(status_code=400, detail="Описание слишком длинное (максимум 5000 символов в этой версии).")
    if made_for_kids not in {"true", "false"}:
        raise HTTPException(status_code=400, detail="Выберите, предназначено ли видео для детей.")
    publish_time = parse_publish_at(publish_at)
    original_name = Path(video.filename or "video.mp4")
    if original_name.suffix.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Формат файла не распознан как видео. Выберите MP4, MOV, WebM или другой поддерживаемый формат YouTube.")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)
    job_id = uuid.uuid4().hex[:12]
    filename = f"{job_id}{original_name.suffix.lower()}"
    destination = MEDIA_DIR / filename
    size = 0
    try:
        with destination.open("wb") as out:
            while chunk := await video.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_VIDEO_BYTES:
                    raise HTTPException(status_code=413, detail="Файл превышает лимит этой версии приложения — 10 ГБ.")
                out.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await video.close()

    tag_list = list(dict.fromkeys(tag.strip() for tag in tags.split(",") if tag.strip()))[:30]
    job = {
        "id": job_id,
        "title": title,
        "description": description,
        "tags": tag_list,
        "category_id": category_id if category_id.isdigit() else "22",
        "publish_at": publish_time.isoformat().replace("+00:00", "Z"),
        "made_for_kids": made_for_kids == "true",
        "filename": filename,
        "original_filename": original_name.name,
        "size_bytes": size,
        "status": "queued",
        "video_id": None,
        "watch_url": None,
        "error": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    with queue_lock:
        jobs = load_queue()
        jobs.append(job)
        save_queue(jobs)
    return {"ok": True, "job": job}


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str):
    with queue_lock:
        jobs = load_queue()
        job = next((item for item in jobs if item["id"] == job_id), None)
        if not job:
            raise HTTPException(status_code=404, detail="Задача не найдена.")
        if job.get("status") in {"uploading", "scheduled"}:
            raise HTTPException(status_code=409, detail="Удалите/измените запланированную публикацию в YouTube Studio. Эта версия не отменяет публикацию на стороне YouTube.")
        jobs = [item for item in jobs if item["id"] != job_id]
        save_queue(jobs)
    (MEDIA_DIR / job.get("filename", "")).unlink(missing_ok=True)
    return {"ok": True}


HTML = r'''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>YouTube Bot — панель канала</title>
<style>
:root{color-scheme:dark;--bg:#0b0d12;--panel:#141821;--line:#242b38;--muted:#9aa6b8;--text:#f3f5fa;--accent:#ff3854;--green:#48d597;--yellow:#ffd166}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 10% -10%,#2a1420 0,transparent 38%),var(--bg);color:var(--text);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}main{max-width:1050px;margin:auto;padding:34px 20px 70px}.top{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:28px}.brand{display:flex;align-items:center;gap:13px}.mark{width:45px;height:32px;background:var(--accent);border-radius:11px;display:grid;place-items:center;font-size:17px}.brand h1{font-size:21px;margin:0}.brand p{margin:1px 0;color:var(--muted);font-size:13px}.button,button{border:0;border-radius:10px;padding:11px 16px;background:var(--accent);color:white;text-decoration:none;font-weight:700;cursor:pointer}.button.secondary{background:#272e3a}.grid{display:grid;grid-template-columns:1fr 1.1fr;gap:18px}.card{background:linear-gradient(160deg,#171c26,#11151c);border:1px solid var(--line);border-radius:17px;padding:22px;box-shadow:0 16px 44px #0002}.card h2{font-size:17px;margin:0 0 15px}.wide{grid-column:1/-1}.muted{color:var(--muted)}.notice{padding:12px 14px;background:#211c14;border:1px solid #463923;color:#f5d58a;border-radius:10px;margin:14px 0}.success{color:var(--green)}.error{color:#ff8292}.channel{display:flex;gap:14px;align-items:center}.avatar{width:48px;height:48px;border-radius:50%;background:#272e3a;display:grid;place-items:center;font-size:22px}.stats{display:flex;gap:20px;color:var(--muted);font-size:13px;margin-top:7px}.stats b{color:var(--text)}form{display:grid;gap:12px}label{display:grid;gap:6px;color:#c7d0dc;font-size:13px}input,textarea,select{width:100%;background:#0e1219;border:1px solid #303847;border-radius:9px;padding:11px 12px;color:var(--text);font:inherit}textarea{min-height:90px;resize:vertical}input[type=file]{padding:9px}input[type=checkbox]{width:auto}.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}.help{font-size:12px;color:var(--muted)}.job{display:grid;grid-template-columns:1fr auto;gap:14px;align-items:center;border-top:1px solid var(--line);padding:14px 0}.job:first-child{border-top:0}.job-title{font-weight:650}.job-meta{font-size:12px;color:var(--muted);overflow-wrap:anywhere}.badge{font-size:11px;border:1px solid #454d5b;padding:4px 8px;border-radius:99px;color:#d7dce6;white-space:nowrap}.badge.scheduled{border-color:#277d59;color:var(--green)}.badge.failed{border-color:#86414a;color:#ff9aa6}.footer{margin-top:20px;color:var(--muted);font-size:12px}.hidden{display:none!important}@media(max-width:750px){.grid{grid-template-columns:1fr}.wide{grid-column:auto}.top{align-items:flex-start;flex-direction:column}.two{grid-template-columns:1fr}}
</style>
</head>
<body><main>
<header class="top"><div class="brand"><div class="mark">▶</div><div><h1>YouTube Bot</h1><p>Подключение канала и публикации по расписанию</p></div></div><a class="button secondary" href="https://studio.youtube.com/" target="_blank" rel="noreferrer">Открыть YouTube Studio ↗</a></header>
<div id="notice" class="notice hidden"></div>
<div class="grid">
<section class="card"><h2>Подключение канала</h2><div id="channel" class="muted">Проверяем подключение…</div><div id="connectWrap" style="margin-top:16px"><a class="button" href="/auth/start">Подключить Google / YouTube</a></div><p class="help">Разрешение выдаётся на странице Google. Пароль приложению не передаётся.</p></section>
<section class="card"><h2>Как работает эта версия</h2><p class="muted">Вы загружаете готовый видеофайл и задаёте название, описание и время. Бот загружает ролик как приватный и просит YouTube опубликовать его в указанное время.</p><p class="help">Генерация сценариев/видео и автоматическое управление комментариями пока не подключены. До планирования проверьте права на все материалы.</p></section>
<section class="card wide"><h2>Запланировать видео</h2><form id="uploadForm">
<label>Видео-файл <input name="video" type="file" accept="video/*" required></label>
<label>Название <input name="title" maxlength="100" placeholder="Название ролика" required></label>
<label>Описание <textarea name="description" maxlength="5000" placeholder="Описание, ссылки, главы…"></textarea></label>
<div class="two"><label>Теги через запятую <input name="tags" placeholder="например: путешествия, игры"></label><label>Категория<select name="category_id"><option value="22">Люди и блоги</option><option value="20">Игры</option><option value="24">Развлечения</option><option value="27">Образование</option><option value="28">Наука и технологии</option><option value="10">Музыка</option><option value="19">Путешествия и события</option></select></label></div>
<div class="two"><label>Дата и время публикации <input id="publishInput" type="datetime-local" required><span class="help">Укажите время в своём часовом поясе; минимум через 15 минут.</span></label><label>Для детей?<select name="made_for_kids" required><option value="" selected disabled>Выберите точно</option><option value="false">Нет, не предназначено специально для детей</option><option value="true">Да, предназначено для детей</option></select></label></div>
<button id="submitBtn" type="submit">Загрузить и запланировать</button><div class="help">После загрузки время публикации можно проверить/изменить в YouTube Studio. Не закрывайте сервер во время передачи файла.</div>
</form></section>
<section class="card wide"><h2>Задачи публикации</h2><div id="jobs" class="muted">Загрузка…</div></section>
</div><p class="footer">Первая версия работает, пока сервер запущен. Токены и видео хранятся локально в папке data/ — не включайте её в Git и обеспечьте резервное копирование/защиту сервера.</p>
</main>
<script>
const notice=document.getElementById('notice');
function showNotice(text,kind=''){notice.textContent=text;notice.className='notice '+kind;notice.classList.remove('hidden')}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function refresh(){try{const r=await fetch('/api/status');const d=await r.json();if(!r.ok)throw Error(d.detail||'Ошибка');
 const channel=document.getElementById('channel');const connectedWrap=document.getElementById('connectWrap');
 if(d.connected){connectedWrap.classList.add('hidden');if(d.channel?.error){channel.innerHTML='<span class="error">'+esc(d.channel.error)+'</span>'}else if(d.channel){channel.innerHTML='<div class="channel"><div class="avatar">▶</div><div><strong>'+esc(d.channel.title)+'</strong><div class="stats"><span><b>'+esc(d.channel.videos??'—')+'</b> видео</span><span><b>'+esc(d.channel.subscribers??'скрыто')+'</b> подписчиков</span></div><a class="help" href="'+esc(d.channel.url)+'" target="_blank" rel="noreferrer">Открыть канал ↗</a></div></div>'}}else{connectedWrap.classList.remove('hidden');channel.innerHTML=d.client_configured?'<span class="muted">OAuth-клиент готов — подключите аккаунт кнопкой ниже.</span>':'<span class="muted">Сначала настройте OAuth-клиент Google Cloud. Точный redirect URI: <code>'+esc(d.redirect_uri)+'</code></span>'}
 const jobs=document.getElementById('jobs');if(!d.jobs.length){jobs.innerHTML='<p class="muted">Пока нет задач.</p>'}else{jobs.innerHTML=d.jobs.map(j=>'<div class="job"><div><div class="job-title">'+esc(j.title)+'</div><div class="job-meta">'+esc(j.status==='scheduled'?'Опубликовано по расписанию':j.status==='queued'?'В очереди загрузки':j.status==='uploading'?'Загружается':j.status==='failed'?'Ошибка загрузки':'Черновик')+' · публикация '+esc(new Date(j.publish_at).toLocaleString())+(j.watch_url?' · <a href="'+esc(j.watch_url)+'" target="_blank" rel="noreferrer">видео ↗</a>':'')+(j.error?'<br><span class="error">'+esc(j.error)+'</span>':'')+'</div></div><span class="badge '+esc(j.status)+'">'+esc(j.status)+'</span></div>').join('')}}catch(e){showNotice(e.message,'error')}}
const params=new URLSearchParams(location.search);if(params.has('connected'))showNotice('Google подключён. Проверьте, что показан нужный канал.','success');if(params.has('oauth_error'))showNotice('Google не завершил авторизацию: '+params.get('oauth_error'),'error');
const form=document.getElementById('uploadForm');form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;const input=document.getElementById('publishInput');if(!input.value){showNotice('Укажите дату и время публикации.','error');return}const when=new Date(input.value);if(Number.isNaN(when.getTime())){showNotice('Не удалось прочитать время.','error');return}const fd=new FormData(form);fd.set('publish_at',when.toISOString());const btn=document.getElementById('submitBtn');btn.disabled=true;btn.textContent='Загружаю… не закрывайте страницу';try{const r=await fetch('/api/jobs',{method:'POST',body:fd});const data=await r.json();if(!r.ok)throw Error(data.detail||'Не удалось создать задачу');showNotice('Видео принято. Бот загрузит его и создаст публикацию по расписанию.','success');form.reset();await refresh()}catch(err){showNotice(err.message,'error')}finally{btn.disabled=false;btn.textContent='Загрузить и запланировать'}});
refresh();setInterval(refresh,8000);
</script></body></html>'''
