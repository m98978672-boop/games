"""Public reachability test; never follows Google or prints state/code/credentials."""
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def probe_callback(opener):
    # Missing credentials deliberately exercise a fixed error response, without
    # consuming a real OAuth state or exposing a code.
    url = 'https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-comments/oauth/callback'
    try:
        response = opener.open(urllib.request.Request(url), timeout=30)
    except urllib.error.HTTPError as error:
        response = error
    content_type = response.headers.get('Content-Type', '')
    body = response.read(4096)
    valid = response.code == 400 and content_type.lower().startswith('text/html') and 'Ответ Google неполный.'.encode('utf-8') in body
    print(f'::notice title=OAuth callback rendering::status={response.code}; content_type={content_type}; expected_utf8={valid}')
    return valid


def main():
    url = 'https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-comments/auth/start'
    opener = urllib.request.build_opener(NoRedirect())
    try:
        opener.open(urllib.request.Request(url), timeout=30)
    except urllib.error.HTTPError as response:
        if response.code != 302:
            body = response.read(4096).decode('utf-8', errors='replace')
            if 'Подключение не завершено' in body:
                kind = 'function reported setup error'
            elif 'BOOT_ERROR' in body or 'WORKER_ERROR' in body:
                kind = 'edge runtime boot error'
            else:
                kind = 'gateway or unknown error'
            print(f'::error::Comment OAuth start returned HTTP {response.code} ({kind}); no Google consent requested.')
            return 1
        target = urllib.parse.urlsplit(response.headers.get('Location', ''))
        query = urllib.parse.parse_qs(target.query)
        required = 'https://www.googleapis.com/auth/youtube.force-ssl'
        callback = 'https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/youtube-comments/oauth/callback'
        if (target.scheme != 'https' or target.hostname != 'accounts.google.com' or
            target.path != '/o/oauth2/v2/auth' or query.get('scope') != [required] or
            query.get('redirect_uri') != [callback] or query.get('code_challenge_method') != ['S256'] or
            query.get('access_type') != ['offline'] or not query.get('state')):
            print('::error::Unexpected OAuth redirect; no Google consent requested.')
            return 1
        print('Comment OAuth start returned a correctly scoped Google redirect; consent was not performed.')
        return 0 if probe_callback(opener) else 1
    except Exception:
        print('::error::Cannot reach comment OAuth service; no Google consent requested.')
        return 1
    print('::error::OAuth start did not return a redirect; no Google consent requested.')
    return 1


if __name__ == '__main__':
    sys.exit(main())
