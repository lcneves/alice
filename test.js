'use strict';

const assert = require('assert');
const Alice = require('.');

async function test (params) {
  try {
    const alice = new Alice(params);
    const bob = new Alice(params);

    const payload = "É: Hiss and stare at nothing then run suddenly away ask to be pet then attack owners hand. Fall over dead (not really but gets sypathy) pose purrfectly to show my beauty i'm bored inside, let me out i'm lonely outside, let me in i can't make up my mind whether to go in or out, guess i'll just stand partway in and partway out, contemplating the universe for half an hour how dare you nudge me with your foot?!?! leap into the air in greatest offense! munch on tasty moths but purr or mice or human clearly uses close to one life a night no one naps that long so i revive by standing on chestawaken!. Ask for petting hiss at vacuum cleaner give me attention or face the wrath of my claws ooh, are those your $250 dollar sandals? lemme use that as my litter box. Spend six hours per day washing, but still have a crusty butthole stare at ceiling, yet lick arm hair or spit up on light gray carpet instead of adjacent linoleum. Then cats take over the world have a lot of grump in yourself because you can't forget to be grumpy and not be like king grumpy cat i'm bored inside, let me out i'm lonely outside, let me in i can't make up my mind whether to go in or out, guess i'll just stand partway in and partway out, contemplating the universe for half an hour how dare you nudge me with your foot?!?! leap into the air in greatest offense!. Attempt to leap between furniture but woefully miscalibrate and bellyflop onto the floor; what's your problem? i meant to do that now i shall wash myself intently ears back wide eyed so sit on human they not getting up ever so howl on top of tall thing chase laser. Warm up laptop with butt lick butt fart rainbows until owner yells pee in litter box hiss at cats leave fur on owners clothes. Attack feet small kitty warm kitty little balls of fur knock dish off table head butt cant eat out of my own dish. Meowzer.";

    const encrypted = await alice.write(payload, bob.pubkey);
    const decrypted = await bob.read(encrypted);

    assert(decrypted === payload);
  } catch (err) {
    throw new Error(`Test failed!
      Parameters: ${JSON.stringify(params)}
      Message: ${err}`
    );
  }
}

Promise.all([
  test({ rsaKeyBits: 512 }),
  test({ rsaKeyBits: 4096 }),
  test({
    rsaKeyBits: 1024,
    aesAlgorithm: 'aes-128-cbc',
    aesKeyBytes: 16,
    aesIvBytes: 16
  }),
  test()
])
  .then(() => console.log('Tests passed!'))
  .catch(err => console.error(err));
