import Peer from 'peerjs';
import { MediaStreamManager } from './MediaStreamManager';

export class CollabEngine {
  private peer: Peer;
  private connections: Map<string, Peer.MediaConnection> = new Map();
  private streamManager = new MediaStreamManager();

  constructor() {
    this.peer = new Peer({
      host: 'quantum-signaling-server',
      port: 9000,
      secure: true,
      config: { iceServers: [...] }
    });

    this.peer.on('call', (call) => {
      call.answer(this.streamManager.localStream);
      this.setupCallHandlers(call);
    });
  }

  async startSharing() {
    await this.streamManager.initialize();
    return this.streamManager.localStream;
  }

  joinRoom(roomId: string) {
    this.peer.on('open', () => {
      const conn = this.peer.connect(roomId);
      conn.on('data', this.handleDataMessage);
    });
  }

  private setupCallHandlers(call: Peer.MediaConnection) {
    call.on('stream', (stream) => {
      this.streamManager.addRemoteStream(call.peer, stream);
    });
    
    call.on('error', (error) => {
      console.error('WebRTC Error:', error);
    });
  }
}