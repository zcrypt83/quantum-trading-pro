// backend/security/AuthManager.js
const jose = require('jose');

class InstitutionalAuth {
  constructor() {
    this.keystore = new jose.JWKS.KeyStore();
    this.keystore.generate('RSA', 4096, {alg: 'RS512', use: 'sig'});
  }

  async createToken(user) {
    return new jose.SignJWT({ 
      'https://quantumtrading.pro/roles': user.roles 
    })
    .setProtectedHeader({ alg: 'RS512' })
    .setIssuedAt()
    .setIssuer('quantum-auth')
    .setAudience('quantum-trading')
    .setExpirationTime('2h')
    .sign(await this.keystore.getPrivateKey('RSA'));
  }

  async verifyToken(token) {
    const { payload } = await jose.jwtVerify(token, this.keystore, {
      issuer: 'quantum-auth',
      audience: 'quantum-trading'
    });
    return payload;
  }
}