// Every fixed phrase the game speaks. `npm run voice` pre-records all of these (plus every
// word, keyword and picture name) so speech sounds the same on every device.
// No imports: the voice script loads this file directly in Node.

export const LINES = {
  praise: ['Great job!', 'Awesome!', 'You did it!', 'Wow!', 'Super!', 'Yes!', 'Amazing!', 'Nice!'],
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
  },

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
