'use strict';

const assert = require('assert');
const Alice = require('.');

async function send (from, to, message, sign=false) {
  const encrypted = await from.write(message, to.pubkey, sign);

  const decrypted = sign
  ? await to.read(encrypted, from.pubkey)
  : await to.read(encrypted);

  assert(decrypted === message, 'Decripted is different from message');
}

async function test (params) {
  try {
    const opts = params ? params : {};
    const alice = new Alice(opts.alice ? opts.alice : null);
    const bob = new Alice(opts.bob ? opts.bob : null);

    const payload = "É: Hiss and stare at nothing then run suddenly away ask to be pet then attack owners hand. Fall over dead (not really but gets sypathy) pose purrfectly to show my beauty i'm bored inside, let me out i'm lonely outside, let me in i can't make up my mind whether to go in or out, guess i'll just stand partway in and partway out, contemplating the universe for half an hour how dare you nudge me with your foot?!?! leap into the air in greatest offense! munch on tasty moths but purr or mice or human clearly uses close to one life a night no one naps that long so i revive by standing on chestawaken!. Ask for petting hiss at vacuum cleaner give me attention or face the wrath of my claws ooh, are those your $250 dollar sandals? lemme use that as my litter box. Spend six hours per day washing, but still have a crusty butthole stare at ceiling, yet lick arm hair or spit up on light gray carpet instead of adjacent linoleum. Then cats take over the world have a lot of grump in yourself because you can't forget to be grumpy and not be like king grumpy cat i'm bored inside, let me out i'm lonely outside, let me in i can't make up my mind whether to go in or out, guess i'll just stand partway in and partway out, contemplating the universe for half an hour how dare you nudge me with your foot?!?! leap into the air in greatest offense!. Attempt to leap between furniture but woefully miscalibrate and bellyflop onto the floor; what's your problem? i meant to do that now i shall wash myself intently ears back wide eyed so sit on human they not getting up ever so howl on top of tall thing chase laser. Warm up laptop with butt lick butt fart rainbows until owner yells pee in litter box hiss at cats leave fur on owners clothes. Attack feet small kitty warm kitty little balls of fur knock dish off table head butt cant eat out of my own dish. Meowzer.";

    await send(alice, bob, payload);
    await send(bob, alice, payload);
    await send(alice, bob, payload, true);
    await send(bob, alice, payload, true);
  } catch (err) {
    throw new Error(`Test failed!
      Parameters: ${JSON.stringify(params)}
      Message: ${err}`
    );
  }
}

const tests = [
  { alice: { rsaKeyBits: 512 }, bob: { rsaKeyBits: 512 } },
  {},
  { alice: { rsaKeyBits: 512 }, bob: { rsaKeyBits: 4096 } },
  {
    alice: {
      rsaKeyBits: 1024,
      aesAlgorithm: 'aes-128-cbc',
      aesKeyBytes: 16,
      aesIvBytes: 16
    },
    bob: {
      rsaKeyBits: 2048,
      aesAlgorithm: 'aes256',
      aesKeyBytes: 32,
      aesIvBytes: 16
    }
  }
];

async function runTests (testArr) {
  let errorStatus = 0;

  for (let t of testArr) {
    try {
      await test(t);
    } catch (err) {
      errorStatus = 1;
      console.error(err);
    }
  }

  return errorStatus;
}

runTests(tests).then(errorStatus => {
  if (!errorStatus) console.log('All tests passed!');

  process.exit(errorStatus);
});
