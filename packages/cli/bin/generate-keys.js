const fs = require('fs');
const crypto = require('crypto');
const assert = require('assert');

module.exports.command = 'generate-keys <dir>';
module.exports.describe = 'generate a new key pair';

module.exports.builder = yargs => {
  yargs.boolean('verbose');
};

module.exports.handler = argv => {
  const dirForNewKeys = argv.dir;
  const verbose = argv.verbose;

  function encrypt(pub, str) {
    return crypto.publicEncrypt(pub, Buffer.from(str)).toString('base64');
  }

  function decrypt(priv, str) {
    return crypto.privateDecrypt(priv, Buffer.from(str, 'base64')).toString();
  }

  function testKeys(pub, priv) {
    let testSecret = 'This is just a simple test phrase';
    if (verbose) console.log(`testSecret: ${testSecret}`);

    let encrypted = encrypt(pub, testSecret);
    if (verbose) console.log(`encrypted: ${encrypted}`);

    let decrypted = decrypt(priv, encrypted);
    if (verbose) console.log(`decrypted: ${decrypted}`);

    assert.equal(decrypted, testSecret, 'Decrypt does not work');
  }

  function writeKeysToFiles(publicKey, privateKey) {
    if (!fs.existsSync(dirForNewKeys)){
      fs.mkdirSync(dirForNewKeys, { recursive: true });
    }
    fs.writeFileSync(dirForNewKeys + '/alice.pub', publicKey);
    fs.writeFileSync(dirForNewKeys + '/alice.pem', privateKey);
  }

  const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: ''
    }
  });
  console.log('Keys generated');
  writeKeysToFiles(publicKey, privateKey);
  testKeys(publicKey, privateKey);
}
