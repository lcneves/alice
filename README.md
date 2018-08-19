# Alice
Cryptografic message exchanging protocol based on RSA and AES.

## Installation

```
$ npm install alice-crypto --save
```

## Usage

```
const Alice = require('alice-crypto');

const alice = new Alice();
const bob = new Alice();

const secretMessage = 'Cats are cool, but dogs are better!';

// Only Bob can decipher the contents of this message.
// May be sent over insecure channels.
const cipheredMessage = alice.write(secretMessage, bob.pubkey);

const decipheredMessage = bob.read(cipheredMessage);

assert(decipheredMessage === secretMessage);
```

## API

### new Alice(options)
Returns a new instance of Alice.
**Note:** It may take a few seconds to generate the RSA keypair, which is a **blocking** operation. It is recommended to create the new instance as a singleton during your app's initialization routine.

#### options _[Object]_
`rsaKeyBits` _[Integer]_: Length of the RSA keypair. Default: `2048`.

`aesAlgorithm` _[String]_: AES algorithm to pass to node's `crypto.createCipheriv` and `crypto.createDecipheriv` functions. Default: `aes256`.

`aesKeyBytes` _[Integer]_: Length of the AES key to be randomly generated with each encryption. Default: `32`.

`aesIvBytes` _[Integer]_: Length of the AES initialization vector to be randomly generated with each encryption. Default: `16`.

### instance.pubkey
The public key string to be shared between instances of Alice over insecure channels.

### instance.write(message _[String]_, pubkey _[String]_)
Returns an object that can be sent over insecure channels to the owner of _pubkey_.

### instance.read(ciphered _[Object]_)
Returns a string containing the original message.

## Example server usage
This sample would allow two servers running instances of Alice to communicate securely over open channels.

```
const Alice = require('alice-crypto');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const alice = new Alice();

const app = express();
app.use(bodyParser());

const thisHostname = 'alice.example.com';
const bobHostname = 'bob.example.com';

const importantMessage =
  'Bob, my bank account password is 123456. Nobody else must know!';

function sendMessage (message, hostname) {
  request(`http://${hostname}/pubkey`, (err, response, body) => 
    const pubkey = body;
    const ciphered = alice.write(message, pubkey);

    request.post(`http://${hostname}/secret-message`,
      { form: { message: JSON.stringify(ciphered) } });
  );
}

app.get('/pubkey', (req, res, next) => {
  res.send(alice.pubkey);
}

app.post('/secret-message', (req, res, next) => {
  const ciphered = JSON.parse(req.body.message);
  const message = alice.read(ciphered);

  console.log(message);
}

app.listen(80);

sendMessage(importantMessage, bobHostname);
```

## License: MIT
