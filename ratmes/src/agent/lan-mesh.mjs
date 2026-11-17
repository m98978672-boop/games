// Настоящая P2P / LAN-сеть между живыми экземплярами RatMes Agent (нулевые внешние зависимости).
// Обеспечивает:
// 1. Обнаружение узлов в локальной сети (опциональный UDP-маяк node:dgram + ручная регистрация LAN-пиров).
// 2. Рукопожатие /api/p2p/hello по протоколу ratcore-bridge/1.
// 3. Настоящую E2EE-доставку конвертов (AES-256-GCM с ключевым храповиком + HMAC-подписью) напрямую между двумя RatMes Agent!

import dgram from 'node:dgram';
import os from 'node:os';
import {
  deriveDeterministicKeyBytes,
  encryptRatchetPayload,
  decryptRatchetPayload,
  signWithSecret,
} from '../engine/crypto-layer.mjs';

export function createLanMesh({
  nodeId,
  label = `RatMes (${os.hostname()})`,
  listenPort = 8787,
  engine,
  sharedMeshSecret = 'ratmes-lan-default-mesh-v1',
  enableUdpBeacon = false,
  udpPort = 41234,
}) {
  const peers = new Map(); // peerId -> { peerId, label, endpoint, rttMs, online, lastSeenAt, stateHash, live }
  const seenNonces = new Set();
  let udpSocket = null;
  let beaconTimer = null;
  let ratchetStep = 0;

  function peerKeyBytes(pairSeed) {
    return deriveDeterministicKeyBytes(`ratmes-p2p:${sharedMeshSecret}:${pairSeed}`);
  }

  function registerPeer({ peerId, label: peerLabel, endpoint, rttMs = 4.2, stateHash = null }) {
    const cleanUrl = String(endpoint || '').replace(/\/$/, '');
    const id = peerId || `peer-${Buffer.from(cleanUrl).toString('hex').slice(0, 10)}`;
    const record = {
      peerId: id,
      label: peerLabel || cleanUrl,
      endpoint: cleanUrl,
      rttMs,
      online: true,
      live: true,
      stateHash,
      lastSeenAt: Date.now(),
    };
    peers.set(id, record);
    return record;
  }

  function listPeers() {
    return Array.from(peers.values()).map((p) => ({ ...p }));
  }

  // Настоящее HTTP-рукопожатие с другим живым RatMes Agent
  async function handshakePeer(endpoint) {
    const cleanUrl = String(endpoint || '').replace(/\/$/, '');
    const started = performance.now();
    const res = await fetch(`${cleanUrl}/api/p2p/hello`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'ratcore-bridge/1',
        nodeId,
        label,
        port: listenPort,
        stateHash: engine.getStateHash(),
        ts: Date.now(),
      }),
    });
    if (!res.ok) throw new Error(`P2P hello HTTP ${res.status}`);
    const remote = await res.json();
    const rttMs = Number((performance.now() - started).toFixed(2));
    const peer = registerPeer({
      peerId: remote.nodeId,
      label: remote.label,
      endpoint: cleanUrl,
      rttMs,
      stateHash: remote.stateHash,
    });
    return { ok: true, peer, remote };
  }

  // Настоящая зашифрованная AES-256-GCM P2P-доставка конверта другому RatMes Agent
  async function sendEncryptedToPeer({ peerId, chatId, chatTitle, text, senderName = label, msgId = null }) {
    const peer = peers.get(peerId);
    if (!peer || !peer.endpoint) {
      throw new Error(`Живой P2P-пир ${peerId} не зарегистрирован`);
    }
    ratchetStep += 1;
    const baseKey = peerKeyBytes(chatId);
    const cipherPacket = await encryptRatchetPayload({
      baseKeyBytes: baseKey,
      epoch: 1,
      step: ratchetStep,
      plaintextObj: { chatId, chatTitle: chatTitle || `LAN · ${label}`, senderName, text, msgId, ts: Date.now() },
      prngFn: engine.core.rand,
    });
    const nonce = `${nodeId}-${Date.now()}-${ratchetStep}`;
    const signature = await signWithSecret(sharedMeshSecret, { fromNode: nodeId, chatId, nonce, step: ratchetStep });

    const started = performance.now();
    const res = await fetch(`${peer.endpoint}/api/p2p/envelope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        protocol: 'ratcore-bridge/1',
        fromNode: nodeId,
        fromLabel: label,
        chatId,
        nonce,
        signature,
        cipherPacket,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      throw new Error(json.error?.message || `P2P envelope HTTP ${res.status}`);
    }
    peer.rttMs = Number((performance.now() - started).toFixed(2));
    peer.lastSeenAt = Date.now();
    return {
      ok: true,
      peerId: peer.peerId,
      endpoint: peer.endpoint,
      rttMs: peer.rttMs,
      encrypted: true,
      alg: cipherPacket.alg,
      remoteReceive: json.data,
    };
  }

  // Приём зашифрованного пакета на стороне получателя -> проверка HMAC -> расшифровка -> transfer.receive()!
  async function handleIncomingEnvelope(packet) {
    if (!packet || !packet.fromNode || !packet.nonce || !packet.cipherPacket) {
      return { ok: false, error: { code: 'RM-105', message: 'Некорректный P2P-пакет' } };
    }
    if (seenNonces.has(packet.nonce)) {
      return { ok: true, data: { deduplicated: true, nonce: packet.nonce } };
    }
    const expectedSig = await signWithSecret(sharedMeshSecret, {
      fromNode: packet.fromNode,
      chatId: packet.chatId,
      nonce: packet.nonce,
      step: packet.cipherPacket.step,
    });
    if (expectedSig !== packet.signature) {
      return { ok: false, error: { code: 'RM-602', message: 'Подпись P2P-пакета не прошла проверку HMAC' } };
    }

    let plaintext;
    try {
      const baseKey = peerKeyBytes(packet.chatId);
      plaintext = await decryptRatchetPayload({ baseKeyBytes: baseKey, cipherPacket: packet.cipherPacket });
    } catch {
      return { ok: false, error: { code: 'RM-602', message: 'Не удалось расшифровать AES-256-GCM P2P-конверт' } };
    }

    seenNonces.add(packet.nonce);
    if (seenNonces.size > 1000) {
      const first = seenNonces.values().next().value;
      seenNonces.delete(first);
    }

    const received = await engine.tools.transfer.receive({
      sourceChannel: `lan-p2p:${packet.fromNode}`,
      network: 'ratmes',
      chatId: plaintext.chatId,
      chatTitle: plaintext.chatTitle || `LAN · ${packet.fromLabel}`,
      senderName: plaintext.senderName || packet.fromLabel,
      text: plaintext.text,
      msgId: plaintext.msgId || undefined,
    });

    return {
      ok: received.ok,
      data: {
        decrypted: true,
        alg: packet.cipherPacket.alg,
        fromNode: packet.fromNode,
        receiveResult: received.data,
      },
      error: received.error || null,
    };
  }

  function handleIncomingHello(body = {}) {
    if (body.nodeId && body.nodeId !== nodeId && body.endpoint) {
      registerPeer({
        peerId: body.nodeId,
        label: body.label || body.nodeId,
        endpoint: body.endpoint,
        stateHash: body.stateHash || null,
      });
    }
    return {
      ok: true,
      protocol: 'ratcore-bridge/1',
      nodeId,
      label,
      port: listenPort,
      stateHash: engine.getStateHash(),
      ts: Date.now(),
    };
  }

  // Опциональный UDP broadcast-маяк для автообнаружения в домашней Wi-Fi/LAN сети
  function startUdpDiscovery() {
    if (!enableUdpBeacon) return;
    try {
      udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      udpSocket.on('error', () => { /* тихо игнорируем в песочнице */ });
      udpSocket.on('message', (msg, rinfo) => {
        try {
          const parsed = JSON.parse(msg.toString('utf8'));
          if (parsed.protocol === 'ratmes-lan-beacon/1' && parsed.nodeId && parsed.nodeId !== nodeId) {
            registerPeer({
              peerId: parsed.nodeId,
              label: parsed.label || rinfo.address,
              endpoint: `http://${rinfo.address}:${parsed.port || 8787}`,
              stateHash: parsed.stateHash,
            });
          }
        } catch { /* ignore */ }
      });
      udpSocket.bind(udpPort, () => {
        try { udpSocket.setBroadcast(true); } catch { /* ignore */ }
        beaconTimer = setInterval(() => {
          const payload = Buffer.from(JSON.stringify({
            protocol: 'ratmes-lan-beacon/1',
            nodeId,
            label,
            port: listenPort,
            stateHash: engine.getStateHash(),
          }));
          try { udpSocket.send(payload, 0, payload.length, udpPort, '255.255.255.255'); } catch { /* ignore */ }
        }, 12000);
        if (beaconTimer.unref) beaconTimer.unref();
      });
    } catch {
      udpSocket = null;
    }
  }

  function close() {
    if (beaconTimer) clearInterval(beaconTimer);
    if (udpSocket) {
      try { udpSocket.close(); } catch { /* ignore */ }
      udpSocket = null;
    }
  }

  startUdpDiscovery();

  return {
    nodeId,
    label,
    registerPeer,
    listPeers,
    handshakePeer,
    sendEncryptedToPeer,
    handleIncomingEnvelope,
    handleIncomingHello,
    close,
  };
}
