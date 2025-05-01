// src/webrtc/services/CollabService.ts
import io from 'socket.io-client';
import { MediaConnection } from 'peerjs';

class CollabService {
  private socket = io('https://signaling.quantumtrading.pro');
  private peers = new Map<string, MediaConnection>();
  private localStream: MediaStream | null = null;

  async initLocalStream() {
    this.localStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 3840, height: 2160 },
      audio: true
    });
  }

  joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
    
    this.socket.on('user-connected', (userId) => {
      this.connectToNewUser(userId);
    });
  }

  private connectToNewUser(userId: string) {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
        { 
          urls: 'turn:global.turn.twilio.com:3478?transport=udp',
          username: 'quantum',
          credential: 'trading2023'
        }
      ]
    });

    this.localStream?.getTracks().forEach(track => {
      peer.addTrack(track, this.localStream!);
    });

    peer.onicecandidate = ({ candidate }) => {
      this.socket.emit('ice-candidate', userId, candidate);
    };

    this.peers.set(userId, peer);
  }
}