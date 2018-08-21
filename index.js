'use strict';

const assert = require('assert');
const crypto = require('crypto');
const NodeRSA = require('node-rsa');

const rsaKeyBits = 2048;
const aesKeyBytes = 32;
const aesIvBytes = 16;

const algorithm = 'aes256';
const UTF8 = 'utf8';
const BASE64 = 'base64';

let keyPair;

function makeBytes (length) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

async function cipher (message, algo, keyLen, ivLen) {
  const [ key, iv ] = await Promise.all([
    makeBytes(keyLen),
    makeBytes(ivLen)
  ]);
  const cipher = crypto.createCipheriv(algo, key, iv);
  let ciphered = cipher.update(message, UTF8, BASE64);
  ciphered += cipher.final(BASE64);

  return [
    ciphered,
    key,
    iv.toString(BASE64)
  ];
}

async function decipher (ciphered, algo, key, iv) {
  const decipher = crypto.createDecipheriv(
    algo,
    key,
    Buffer.from(iv, BASE64)
  );
  let deciphered = decipher.update(ciphered, BASE64, UTF8);
  deciphered += decipher.final(UTF8);

  return deciphered;
}

function makePubkey (pubkeyStr) {
  const bobKey = new NodeRSA();
  bobKey.importKey(pubkeyStr, 'public');
  assert(bobKey.isPublic(), 'Key is not public key!');

  return bobKey;
}

function encryptKey (aesKey, bobPubkey) {
  const bobKey = makePubkey(bobPubkey);
  return bobKey.encrypt(aesKey, BASE64);
}

function decryptKey (crypt, privkey) {
  return privkey.decrypt(crypt, 'buffer');
}

function signMessage (message, privkey) {
  return privkey.sign(message, BASE64, BASE64);
}

function verifyMessage (message, signature, bobPubkey) {
  const bobKey = makePubkey(bobPubkey);
  const verified = bobKey.verify(message, signature, BASE64, BASE64);

  assert(verified, 'Signature cannot verify message!');
}

async function writeMessage (payload, bobPubkey, algo, keyLen, ivLen, privkey) {
  const [ ciphered, key, iv ] = await cipher(payload, algo, keyLen, ivLen);
  const encryptedKey = encryptKey(key, bobPubkey);
  const signature = privkey ? signMessage(ciphered, privkey) : null;

  return {
    payload: ciphered,
    signature: signature,
    algorithm: algo,
    key: encryptedKey,
    iv: iv
  };
}

async function readMessage (message, privkey, bobPubkey) {
  if (bobPubkey)
    verifyMessage(message.payload, message.signature, bobPubkey);

  const key = decryptKey(message.key, privkey);
  const contents = await decipher(
    message.payload, message.algorithm, key, message.iv);

  return contents;
}

class Alice {
  constructor (params) {
    params = params || {};
    this._options = {
      rsaKeyBits: rsaKeyBits,
      aesAlgorithm: algorithm,
      aesKeyBytes: aesKeyBytes,
      aesIvBytes: aesIvBytes,
      ...params
    };

    this._keyPair = new NodeRSA().generateKeyPair(this._options.rsaKeyBits);
    this._pubkey = this._keyPair.exportKey('public');
  }

  get pubkey () {
    return this._pubkey;
  }

  write (payload, bobPubkey, sign=false) {
    const privkey = sign ? this._keyPair : null;

    return writeMessage(
      payload, bobPubkey, this._options.aesAlgorithm,
      this._options.aesKeyBytes, this._options.aesIvBytes, privkey);
  }

  read (message, bobPubkey=null) {
    return readMessage(message, this._keyPair, bobPubkey);
  }
}

module.exports = Alice;
