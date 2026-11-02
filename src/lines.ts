// Every fixed phrase the game speaks. `npm run voice` pre-records all of these (plus every
// word, keyword and picture name) so speech sounds the same on every device.
// No imports: the voice script loads this file directly in Node.
//
// These are the original edition's lines; FAMILY_LINES below has the family edition's versions of
// the ones that name its characters (see src/edition.ts).

declare const __FAMILY__: boolean | undefined;

const ORIGINAL = {
  // Power meter full (three right in a row).
  streak: ['Three in a row!', "You're on fire!", 'Super power!', 'Unstoppable!'],
  praise: ['Great job!', 'Awesome!', 'You did it!', 'Wow!', 'Super!', 'Yes!', 'Amazing!', 'Nice!',
    'Fantastic!', 'Way to go!', 'High five!', 'Woo-hoo!', "You're a star!", 'Brilliant!'],
  like: 'like',

  // Profiles & home
  whoIsPlaying: 'Who is playing?',
  pickPicture: 'Pick your picture!',
  hiNew: "Hi there! Let's play!",
  welcomeBack: 'Welcome back!',
  worldHello: {
    garden: 'Flowers and munchers!',
    critters: "Critter friends! Let's read!",
    pups: 'Rescue pups, ready to help!',
    friends: 'Letter Monster and friends!',
  },
  musicOn: 'Music on!', musicOff: 'Music off!', soundsOn: 'Sounds on!', soundsOff: 'Sounds off!',

  // Rewards
  stars: ['Good try!', 'Great job!', 'Super star!'],
  newSound: 'You unlocked a new sound!',
  levelUp: 'Level up! New words to read!',
  tapPresent: 'You finished! Tap the present!',
  gotSticker: 'You got a sticker!',
  stickerHint: 'Drag your stickers onto the picture!',

  // Game intros
  intro: {
    zombies: 'Munchers are coming! Listen for the sound, and tap the muncher with that letter!',
    suns: 'Sunflower needs sunshine! Catch the sun with the word you hear.',
    garden: 'Help the plants grow! Read the word, then plant it in the pot with the same vowel.',
    pikablend: 'Help Zippy find new friends! Read the word on the sign, then tap the matching picture.',
    pikaspell: "Let's spell! Listen to the word, then tap the letters in order to fill the boxes.",
    evolve: "Let's do some magic! Change one letter to make a new word.",
    pupmessage: 'Captain Kai sent a message! Read it, then tap the picture that matches.',
    pupmemory: 'Find the matching pairs! Tap two badges to flip them over.',
    monster: "I'm the Letter Monster, and I'm hungry! Feed me things that start with my sound.",
    frog: 'Froggy wants to hop! Tap the picture that rhymes.',
    bubbles: 'Bubbles! Pop every bubble with the sound you hear.',
    wordtruck: 'Biscuit needs help! Listen to the sentence, then tap the words in order to load the truck.',
    truesilly: 'Read the sentence. Does the picture match? Thumbs up for yes. Thumbs down if it is silly!',
    missingword: 'Oh no! A muncher ate a word! Read the sentence and find the missing word.',
    boss: 'Here comes the Big Muncher! Listen for the sound, and tap the seed with that letter to power up the flowers!',
    river: 'Help Zippy cross the river to see Lolo! Read the stones, and tap the one that matches the picture.',
    ladder: 'A kitten is stuck in the tree! Listen to the sounds and find the picture, to build a ladder for Scout.',
    rocket: "Let's build a rocket to the moon! Tap the letter that each picture starts with.",
    ispy: "Let's play I Spy with Scout! Find everything that starts with the sound.",
    drum: "Let's play the drum! Tap the drum once for each part of the word.",
    dash: 'Help Zippy run! Listen for the word, then tap a lane to run through the right sign.',
    sort: 'Plant the seeds! Drag each picture to the pot with the letter it starts with.',
    rainbow: "Let's paint rainbow letters! Watch me, then trace the letter with your finger.",
    road: 'Help Scout drive on the letter road! Start at the green light and follow the road.',
    stars: 'Connect the stars to make a letter! Touch the glowing stars in order.',
    biglittle: 'Big letters and little letters! The mama has a big letter. Tap the baby with the little letter that matches.',
    bowling: 'Tap a lane to roll a pumpkin and knock down the munchers!',
    whack: 'Critters are popping out of the grass! Tap them to say hi!',
    treats: 'Move the pup to catch the yummy treats!',
    balloons: 'Pop the balloons! Find the golden star balloons!',
  },

  // Bonus games (just for fun)
  bonus: 'Bonus game!',
  timesUp: "Time's up! Great playing!",

  // In-game prompts
  zapPest: 'Zap the muncher with', find: 'Find', zap: 'Zap', whereIs: 'Where is',
  groans: ['Munch munch?', 'Nom nom?', 'Hungry!'],
  catchSun: 'Catch the sun that says',
  readWordTapLetters: 'Read the word. Tap the letters to hear their sounds.',
  readIt: ['What does it say?', 'Read it!', 'Which one is it?'],
  startsWithSound: 'What starts with this sound?', whichOne: 'Which one?',
  heroCall: ['Zip zip!', 'Zip zap!', 'Zippy zip!'],
  spell: 'Spell',
  readMessage: 'Read the message. Which picture matches?', readMessageShort: ['Read the message!', 'What does it say?'],
  teamRoll: 'The rescue pups are on a roll!',
  findPairs: 'Find the pairs!', foundAll: ['Ruff ruff! You found them all!', 'Great job, pup!'],
  feedMe: 'Feed me things that start with', feedMeShort: ['I want something that starts with', 'Yum! Find', 'Feed me'],
  yuck: ['Yuck!', 'Blech!', 'No thank you!'],
  rhymesWith: 'What rhymes with', ribbit: ['Ribbit!', 'Ribbit ribbit!'],
  popBubbles: 'Pop all the bubbles with',
  thisSays: 'This says', nowMake: 'Now make it say', evolved: ['Magic!', 'Wow, it changed!'],
  howManySounds: 'How many sounds in', ruff: 'Ruff!',
  buildSentence: 'Build the sentence!', tapNext: 'What comes next?',
  doesItMatch: ['Does it match?', 'Is it true?', 'Thumbs up or thumbs down?'],
  silly: ["That's silly!", 'So silly!'], itMatches: 'It matches!', itSays: 'It says',
  whichWord: 'Which word is missing?', pestAte: 'The muncher ate a word!',
  bossDown: 'You beat the Big Muncher!', madeIt: 'We made it across!', savedKitten: 'You saved the kitten!',
  blastOff: 'Three, two, one, blast off!', listenSounds: 'Listen to the sounds.', whatIsIt: 'What is it?',
  firstLetter: 'What letter does it start with?', meow: 'Meow!',
  iSpy: 'I spy something that starts with', findAnother: 'Find another one!', foundAll2: 'You found them all!',
  tapDrum: 'Tap the drum for each part.', listenDrum: 'Listen, and tap along!', tryAgain: "Let's try again!",
  runTo: 'Run to', whichPotPic: 'Which pot does it go in?',
  pickBook: 'Pick a book to read!', yourTurnRead: 'Your turn to read! Tap a word if you need help.',
  readBook: 'You read a whole book!', theEnd: 'The end!', whichInBook: 'Which one was in the book?',
  whichBaby: ['Which baby goes with this mama?', 'Find the little letter!', 'Where is the baby?'], foundMama: 'You found the mama!',
  // Adventure map.
  mapHello: ['Where to next, explorer?', "Let's go on an adventure!", 'Ready to explore?'],
  tapGlow: 'Tap the glowing spot to play!', notYet: 'Not yet! Keep playing to get there.',
  newFriend: 'A new friend is joining your adventure!', newLand: 'A new land to explore!',
  treasure: 'Treasure!', needStars: 'Collect more stars to open this treasure!',
  mapDone: "You explored the whole island! You're a super reader!",
  gates: {
    rocket: 'Build a rocket to fly to the next land!',
    boss: 'A Big Muncher is blocking the gate! Beat it to open the way!',
    ladder: 'Rescue the kitten to climb on to the next land!',
    river: 'Help Zippy cross the river to the next land!',
  },
  lands: {
    meadow: 'Welcome to Sunny Meadow!', backyard: 'Welcome to the Veggie Patch!', bay: 'Welcome to Puppy Harbor!',
    forest: 'Welcome to Critter Forest!', peaks: 'Welcome to Snowy Peaks!', volcano: 'Welcome to Magic-E Volcano!',
    castle: 'Welcome to Star Castle!', moon: 'Welcome to the Moon Islands!',
  },
  watchMe: 'Watch me!', yourTurn: 'Your turn! Start at the green dot.', touchStars: 'Touch the stars in order!',
  // Letter names, each spelled the way it sounds so the voice says "ay", not the word "a". They're
  // recorded once and said after a lead-in ("This is the letter" + "bee"). Z is "zee", or "zed" by
  // the grown-ups' English setting.
  letterName: {
    a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'ef', g: 'gee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay',
    l: 'el', m: 'em', n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'ar', s: 'ess', t: 'tee', u: 'you', v: 'vee',
    w: 'double-you', x: 'ex', y: 'why', z: 'zee',
  } as Record<string, string>,
  zed: 'zed', thisIsLetter: 'This is the letter', youMadeLetter: 'You made the letter',
  bigLetter: 'Here’s big', littleLetter: 'and little',

  // Words said in parts, for the drum game. One-part words aren't listed (they're just the word).
  syllables: {
    rabbit: 'rab... bit', pizza: 'piz... za', monkey: 'mon... key', robot: 'ro... bot', rocket: 'rock... et',
    turtle: 'tur... tle', zebra: 'ze... bra', apple: 'ap... ple', tiger: 'ti... ger', lemon: 'lem... on',
    carrot: 'car... rot', rainbow: 'rain... bow', donut: 'do... nut', panda: 'pan... da', popcorn: 'pop... corn',
    pumpkin: 'pump... kin', dragon: 'drag... on', dolphin: 'dol... phin', hippo: 'hip... po', taco: 'ta... co',
    ladder: 'lad... der', mitten: 'mit... ten', penguin: 'pen... guin', otter: 'ot... ter', 'yo-yo': 'yo... yo',
    banana: 'ba... na... na', elephant: 'el... e... phant', dinosaur: 'di... no... saur', octopus: 'oc... to... pus',
    kangaroo: 'kan... ga... roo', tomato: 'to... ma... to', gorilla: 'go... ril... la', umbrella: 'um... brel... la',
    volcano: 'vol... ca... no', unicorn: 'u... ni... corn', hamburger: 'ham... bur... ger', astronaut: 'as... tro... naut',
    alligator: 'al... li... ga... tor', watermelon: 'wa... ter... mel... on', helicopter: 'hel... i... cop... ter',
  } as Record<string, string>,
  whichPot: 'Which pot does it go in?', readAndPlant: 'Read the word. Which vowel do you hear?',
  missingVowel: 'Listen. Which vowel is missing?',
  testVoice: "Hi! Let's read together.",
};

type Lines = typeof ORIGINAL;
/** Some of the lines: any phrase or list of phrases can be swapped, at any depth. */
type Some<T> = { [K in keyof T]?: T[K] extends string | readonly string[] ? T[K] : Some<T[K]> };

/** The family edition's lines, where they differ. */
export const FAMILY_LINES: Some<Lines> = {
  worldHello: { garden: 'Plants and zombies!', critters: 'Pokémon! Gotta read them all!', pups: 'Paw Patrol, ready for action!' },
  intro: {
    zombies: 'Zombies are coming! Listen for the sound, and tap the zombie with that letter!',
    pikablend: 'Help Pikachu catch them all! Read the word on the sign, then tap the matching picture.',
    evolve: "Let's evolve! Change one letter to make a new word.",
    pupmessage: 'Ryder sent a message! Read it, then tap the picture that matches.',
    wordtruck: 'Marshall needs help! Listen to the sentence, then tap the words in order to load the truck.',
    missingword: 'Oh no! A zombie ate a word! Read the sentence and find the missing word.',
    boss: 'Here comes the Zombie Boss! Listen for the sound, and tap the seed with that letter to power up the peashooter!',
    river: 'Help Pikachu cross the river to see Squirtle! Read the stones, and tap the one that matches the picture.',
    ladder: 'A kitten is stuck in the tree! Listen to the sounds and find the picture, to build a ladder for Chase.',
    ispy: "Let's play I Spy with Chase! Find everything that starts with the sound.",
    dash: 'Help Pikachu run! Listen for the word, then tap a lane to run through the right sign.',
    road: 'Help Chase drive on the letter road! Start at the green light and follow the road.',
    bowling: 'Tap a lane to roll a Wall-nut and knock down the zombies!',
    whack: 'Pokémon are popping out of the grass! Tap them to catch them!',
  },
  zapPest: 'Zap the zombie with',
  groans: ['Braaains?', 'Uhhh?', 'Grrr?'],
  heroCall: ['Pika pika!', 'Pika!', 'Pikachu!'],
  teamRoll: 'Paw Patrol is on a roll!',
  evolved: ['It evolved!', 'Wow, it evolved!'],
  pestAte: 'The zombie ate a word!',
  bossDown: 'You beat the Zombie Boss!',
  gates: {
    boss: 'A Zombie Boss is blocking the gate! Beat it to open the way!',
    river: 'Help Pikachu cross the river to the next land!',
  },
  lands: {
    backyard: 'Welcome to the Zombie Backyard!', bay: 'Welcome to Adventure Bay!',
    forest: 'Welcome to the Pokémon Forest!', peaks: 'Welcome to Lookout Peaks!',
  },
};

function over<T>(base: T, some: Some<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(some)) {
    out[k] = typeof v === 'string' || Array.isArray(v) ? v : over(out[k], v as Some<unknown>);
  }
  return out as T;
}

/** Every line for one edition. */
export const linesFor = (family: boolean): Lines => (family ? over(ORIGINAL, FAMILY_LINES) : ORIGINAL);

// The check is written out here (not a call to linesFor) so a build of the original edition can
// see the family lines are never used, and leave them out.
export const LINES: Lines = typeof __FAMILY__ !== 'undefined' && __FAMILY__ ? over(ORIGINAL, FAMILY_LINES) : ORIGINAL;

/** All phrases, flattened. */
export function allLines(o: unknown = LINES): string[] {
  if (typeof o === 'string') return [o];
  if (Array.isArray(o)) return o.flatMap(x => allLines(x));
  if (o && typeof o === 'object') return Object.values(o).flatMap(x => allLines(x));
  return [];
}

/** File-name key for a spoken phrase. */
export const slug = (text: string) =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
