// Every fixed phrase the game speaks. `npm run voice` pre-records all of these (plus every
// word, keyword and picture name) so speech sounds the same on every device.
// No imports: the voice script loads this file directly in Node.

export const LINES = {
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
    pvz: 'Plants and zombies!',
    pokemon: 'Pokémon! Gotta read them all!',
    paw: 'Paw Patrol, ready for action!',
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
    zombies: 'Zombies are coming! Listen for the sound, and tap the zombie with that letter!',
    suns: 'Sunflower needs sunshine! Catch the sun with the word you hear.',
    garden: 'Help the plants grow! Read the word, then plant it in the pot with the same vowel.',
    pikablend: 'Help Pikachu catch them all! Read the word on the sign, then tap the matching picture.',
    pikaspell: "Let's spell! Listen to the word, then tap the letters in order to fill the boxes.",
    evolve: "Let's evolve! Change one letter to make a new word.",
    pupmessage: 'Ryder sent a message! Read it, then tap the picture that matches.',
    pupmemory: 'Find the matching pairs! Tap two badges to flip them over.',
    bones: 'Rubble is hungry! Give him one bone for each sound in the word.',
    monster: "I'm the Letter Monster, and I'm hungry! Feed me things that start with my sound.",
    frog: 'Froggy wants to hop! Tap the picture that rhymes.',
    bubbles: 'Bubbles! Pop every bubble with the sound you hear.',
    wordtruck: 'Marshall needs help! Listen to the sentence, then tap the words in order to load the truck.',
    truesilly: 'Read the sentence. Does the picture match? Thumbs up for yes. Thumbs down if it is silly!',
    missingword: 'Oh no! A zombie ate a word! Read the sentence and find the missing word.',
    boss: 'Here comes the Zombie Boss! Listen for the sound, and tap the seed with that letter to power up the peashooter!',
    river: 'Help Pikachu cross the river to see Squirtle! Read the stones, and tap the one that matches the picture.',
    ladder: 'A kitten is stuck in the tree! Listen to the sounds and find the picture, to build a ladder for Chase.',
    rocket: "Let's build a rocket to the moon! Tap the letter that each picture starts with.",
    ispy: "Let's play I Spy with Chase! Find everything that starts with the sound.",
    drum: "Let's play the drum! Tap the drum once for each part of the word.",
    dash: 'Help Pikachu run! Listen for the word, then tap a lane to run through the right sign.',
    sort: 'Plant the seeds! Drag each picture to the pot with the letter it starts with.',
    bowling: 'Tap a lane to roll a Wall-nut and knock down the zombies!',
    whack: 'Pokémon are popping out of the grass! Tap them to catch them!',
    treats: 'Move the pup to catch the yummy treats!',
    balloons: 'Pop the balloons! Find the golden star balloons!',
  },

  // Bonus games (just for fun)
  bonus: 'Bonus game!',
  timesUp: "Time's up! Great playing!",

  // In-game prompts
  zapZombie: 'Zap the zombie with', find: 'Find', zap: 'Zap', whereIs: 'Where is',
  groans: ['Braaains?', 'Uhhh?', 'Grrr?'],
  catchSun: 'Catch the sun that says',
  readWordTapLetters: 'Read the word. Tap the letters to hear their sounds.',
  readIt: ['What does it say?', 'Read it!', 'Which one is it?'],
  startsWithSound: 'What starts with this sound?', whichOne: 'Which one?',
  pika: ['Pika pika!', 'Pika!', 'Pikachu!'],
  spell: 'Spell',
  readMessage: 'Read the message. Which picture matches?', readMessageShort: ['Read the message!', 'What does it say?'],
  pawRoll: 'Paw Patrol is on a roll!',
  findPairs: 'Find the pairs!', foundAll: ['Ruff ruff! You found them all!', 'Great job, pup!'],
  feedMe: 'Feed me things that start with', feedMeShort: ['I want something that starts with', 'Yum! Find', 'Feed me'],
  yuck: ['Yuck!', 'Blech!', 'No thank you!'],
  rhymesWith: 'What rhymes with', ribbit: ['Ribbit!', 'Ribbit ribbit!'],
  popBubbles: 'Pop all the bubbles with',
  thisSays: 'This says', nowMake: 'Now make it say', evolved: ['It evolved!', 'Wow, it evolved!'],
  howManySounds: 'How many sounds in', ruff: 'Ruff!',
  buildSentence: 'Build the sentence!', tapNext: 'What comes next?',
  doesItMatch: ['Does it match?', 'Is it true?', 'Thumbs up or thumbs down?'],
  silly: ["That's silly!", 'So silly!'], itMatches: 'It matches!', itSays: 'It says',
  whichWord: 'Which word is missing?', zombieAte: 'The zombie ate a word!',
  bossDown: 'You beat the Zombie Boss!', madeIt: 'We made it across!', savedKitten: 'You saved the kitten!',
  blastOff: 'Three, two, one, blast off!', listenSounds: 'Listen to the sounds.', whatIsIt: 'What is it?',
  firstLetter: 'What letter does it start with?', meow: 'Meow!',
  iSpy: 'I spy something that starts with', findAnother: 'Find another one!', foundAll2: 'You found them all!',
  tapDrum: 'Tap the drum for each part.', listenDrum: 'Listen, and tap along!', tryAgain: "Let's try again!",
  runTo: 'Run to', whichPotPic: 'Which pot does it go in?',

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
  testVoice: "Hi! Let's read together.",
};

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
