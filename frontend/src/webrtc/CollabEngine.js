// src/webrtc/CollabEngine.js
export class TradingCollab {
    constructor() {
      this.peers = new Map();
      this.socket = io('https://signaling.quantumtrading.pro');
    }
  
    async init() {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {width: 3840, height: 2160},
        audio: true
      });
  
      this.socket.on('participant-joined', async participantId => {
        const peer = this.createPeer(participantId);
        this.peers.set(participantId, peer);
      });
    }
  
    createPeer(participantId) {
      const peer = new RTCPeerConnection({
        iceServers: [
          {urls: 'stun:global.stun.twilio.com:3478?transport=udp'},
          {urls: 'turn:global.turn.twilio.com:3478?transport=udp',
           username: 'quantum',
           credential: 'trading2023'}
        ]
      });
  
      this.stream.getTracks().forEach(track => peer.addTrack(track, this.stream));
      
      peer.onicecandidate = ({candidate}) => {
        this.socket.emit('ice-candidate', {participantId, candidate});
      };
  
      return peer;
    }
  }