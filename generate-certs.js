const fs = require('fs');
const { generateKeyPairSync } = require('crypto');
const forge = require('node-forge'); // For generating X.509 certificates

// Check if node-forge is installed, if not, inform the user.
try {
  require.resolve('node-forge');
} catch (e) {
  console.error('Error: node-forge is not installed.');
  console.error('Please install it by running: npm install node-forge');
  process.exit(1);
}

// Generate a key pair
const keys = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create a certificate
const pki = forge.pki;
const cert = pki.createCertificate();
cert.publicKey = pki.publicKeyFromPem(keys.publicKey);
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1); // Valid for 1 year

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'US'
}, {
  shortName: 'ST',
  value: 'Virginia'
}, {
  name: 'localityName',
  value: 'Blacksburg'
}, {
  name: 'organizationName',
  value: 'Test Org'
}, {
  shortName: 'OU',
  value: 'Test Unit'
}];
cert.setSubject(attrs);
cert.setIssuer(attrs); // Self-signed
cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'extKeyUsage',
  serverAuth: true,
  clientAuth: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 2, // DNS
    value: 'localhost'
  }, {
    type: 7, // IP
    ip: '127.0.0.1'
  }, {
    type: 7, // IP
    ip: '192.168.11.1' // Your local IP address
  }]
}]);

// Self-sign certificate
cert.sign(pki.privateKeyFromPem(keys.privateKey), forge.md.sha256.create());

// Convert to PEM format
const pemKey = pki.privateKeyToPem(pki.privateKeyFromPem(keys.privateKey));
const pemCert = pki.certificateToPem(cert);

// Save to files
fs.writeFileSync('key.pem', pemKey);
fs.writeFileSync('cert.pem', pemCert);

console.log('Certificates (key.pem and cert.pem) generated successfully!');
console.log('IMPORTANT: You will need to add these certificates to your browser/OS trust store to avoid warnings for local HTTPS development.');




