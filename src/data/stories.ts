// Decodable storybooks: short picture books made only of words the child has been taught
// (decodable words and heart words). A book unlocks at the lesson where its last word is taught.
// Pictures are emoji laid out in a 640 x 300 box centered on (0, 0): [emoji, x, y, size], in front
// of the book's backdrop scene.
import { WORD_LESSON, HEART } from './curriculum';

export type Art = [string, number, number, number];
export interface Page { text: string; art: Art[] }
export type Backdrop = 'park' | 'home' | 'pond' | 'farm' | 'town' | 'night';
export interface Story { id: string; title: string; cover: string; bg: Backdrop; pages: Page[] }

export const STORIES: Story[] = [
  {
    id: 'sit', title: 'I Sit', cover: '🧒', bg: 'home', pages: [
      { text: 'I sit.', art: [['🪑', 0, 50, 150], ['🧒', 0, -40, 120]] },
      { text: 'I sip.', art: [['🧒', -60, 0, 140], ['🥤', 90, 20, 100]] },
      { text: 'I tap.', art: [['🧒', -70, 0, 140], ['🥁', 90, 40, 110], ['🎵', 130, -80, 60]] },
      { text: 'I nap.', art: [['🛏️', 0, 50, 200], ['😴', 0, -30, 100], ['💤', 110, -100, 60]] },
    ],
  },
  {
    id: 'man', title: 'The Man', cover: '👨', bg: 'home', pages: [
      { text: 'It is a man.', art: [['👨', 0, 0, 160]] },
      { text: 'It is a pan.', art: [['🍳', 0, 0, 170]] },
      { text: 'The man sat in a pan!', art: [['🍳', 0, 50, 220], ['👨', 0, -40, 100]] },
      { text: 'It is a map.', art: [['🗺️', 0, 0, 170]] },
      { text: 'The map is in the pan.', art: [['🍳', 0, 40, 210], ['🗺️', 0, -20, 90], ['👨', -200, 0, 90]] },
    ],
  },
  {
    id: 'mom', title: 'Mom and Dad', cover: '👩', bg: 'home', pages: [
      { text: 'Mom is sad.', art: [['👩', 0, 0, 150], ['💧', 70, -40, 40]] },
      { text: 'Dad is sad.', art: [['👨', 0, 0, 150], ['💧', 70, -40, 40]] },
      { text: 'Pop! Pop! Pop!', art: [['🍿', 0, 30, 160], ['💥', -120, -80, 70], ['💥', 120, -90, 60]] },
      { text: 'Mom and Dad nod.', art: [['👩', -90, 0, 140], ['👨', 90, 0, 140], ['😊', 0, -110, 60]] },
      { text: 'Mom and Dad nap.', art: [['👩', -90, 20, 120], ['👨', 90, 20, 120], ['💤', 0, -90, 70]] },
    ],
  },
  {
    id: 'cat', title: 'The Cat', cover: '🐱', bg: 'home', pages: [
      { text: 'It is a cat.', art: [['🐱', 0, 0, 150]] },
      { text: 'The cat sat in a pan.', art: [['🍳', 0, 40, 170], ['🐱', 0, -30, 90]] },
      { text: 'Dad can tap the pan.', art: [['👨', -170, 0, 140], ['🍳', 60, 40, 150], ['🐱', 60, -20, 80], ['💥', 140, -70, 60]] },
      { text: 'The cat is mad!', art: [['😾', 0, 0, 150], ['💢', 90, -80, 60]] },
      { text: 'Dad and the cat nap.', art: [['👨', -110, 10, 130], ['🐱', 90, 40, 100], ['💤', 10, -90, 70]] },
    ],
  },
  {
    id: 'pig', title: 'The Pig', cover: '🐷', bg: 'farm', pages: [
      { text: 'It is a pig.', art: [['🐷', 0, 0, 150]] },
      { text: 'The pig is in the mud.', art: [['🟤', 0, 70, 170], ['🐷', 0, -10, 120]] },
      { text: 'The pig dug and dug.', art: [['🐷', -80, 0, 120], ['🕳️', 90, 60, 110], ['💨', 150, -20, 60]] },
      { text: 'A dog got in the mud.', art: [['🟤', 0, 70, 200], ['🐷', -70, -10, 100], ['🐕', 80, -10, 110]] },
      { text: 'The pig and the dog nap.', art: [['🐷', -90, 20, 110], ['🐕', 90, 20, 110], ['💤', 0, -90, 70]] },
    ],
  },
  {
    id: 'bus', title: 'The Big Bus', cover: '🚌', bg: 'town', pages: [
      { text: 'It is a big bus.', art: [['🚌', 0, 0, 190]] },
      { text: 'Mom and Dad get on the bus.', art: [['👩', -200, 20, 110], ['👨', -90, 20, 110], ['🚌', 120, 0, 170]] },
      { text: 'A pup is on the bus!', art: [['🚌', 0, 30, 200], ['🐶', 0, -100, 80]] },
      { text: 'The pup sat on Dad.', art: [['👨', 0, 40, 160], ['🐶', 0, -70, 80]] },
      { text: 'The bus is fun!', art: [['🚌', 0, 20, 170], ['🎉', -150, -80, 70], ['🎈', 150, -80, 70]] },
    ],
  },
  {
    id: 'hen', title: 'The Hen and the Hat', cover: '🐔', bg: 'farm', pages: [
      { text: 'A hen had a hat.', art: [['🐔', -80, 10, 140], ['🎩', 100, 20, 110]] },
      { text: 'The hat is big.', art: [['🎩', 0, 0, 200]] },
      { text: 'The hen hid in the hat.', art: [['🎩', 0, 30, 200], ['🐔', 0, -70, 70]] },
      { text: 'The hen got hot!', art: [['🐔', -50, 10, 140], ['🥵', 90, -60, 80], ['☀️', 200, -100, 70]] },
      { text: 'The hen sat on top of the hat.', art: [['🎩', 0, 50, 170], ['🐔', 0, -80, 100]] },
    ],
  },
  {
    id: 'dog', title: 'The Wet Dog', cover: '🐕', bg: 'park', pages: [
      { text: 'It is a dog.', art: [['🐕', 0, 0, 150]] },
      { text: 'The dog ran to the log.', art: [['🐕', -140, 10, 120], ['💨', -230, 10, 60], ['🪵', 130, 40, 130]] },
      { text: 'The dog got wet.', art: [['🐕', 0, 20, 150], ['💦', -80, -80, 70], ['💧', 90, -70, 60], ['🌧️', 0, -110, 70]] },
      { text: 'The dog had a nap on the log.', art: [['🪵', 0, 60, 190], ['🐕', 0, -10, 110], ['💤', 100, -90, 60]] },
      { text: 'We hug the wet dog.', art: [['🤗', -90, 0, 130], ['🐕', 90, 10, 130], ['💖', 0, -100, 60]] },
    ],
  },
  {
    id: 'fox', title: 'The Fox and the Box', cover: '🦊', bg: 'park', pages: [
      { text: 'A fox is in a box.', art: [['📦', 0, 40, 190], ['🦊', 0, -60, 90]] },
      { text: 'The fox can not get up!', art: [['📦', 0, 40, 190], ['🦊', 0, -40, 90], ['❓', 100, -100, 60]] },
      { text: 'A kid can fix the box.', art: [['🧒', -150, 10, 130], ['🔧', -40, 0, 70], ['📦', 120, 30, 150]] },
      { text: 'The fox is not in the box!', art: [['📦', -100, 40, 140], ['🦊', 130, 10, 120], ['💨', 30, 10, 60]] },
      { text: 'The fox ran to a den.', art: [['🦊', -150, 20, 110], ['🕳️', 120, 50, 150], ['🌲', 220, -40, 110]] },
    ],
  },
  {
    id: 'frog', title: 'The Frog and the Crab', cover: '🐸', bg: 'pond', pages: [
      { text: 'A frog sat on a log.', art: [['🪵', 0, 60, 180], ['🐸', 0, -20, 110]] },
      { text: 'A crab ran to the pond.', art: [['🦀', -130, 20, 110], ['🌊', 110, 50, 160]] },
      { text: 'The frog can jump!', art: [['🐸', 0, -40, 130], ['✨', -100, 60, 50], ['✨', 100, 60, 50]] },
      { text: 'Plop! The frog is in the pond.', art: [['🌊', 0, 60, 200], ['🐸', 0, -30, 100], ['💦', 90, -80, 60]] },
      { text: 'The frog and the crab swim.', art: [['🌊', 0, 70, 220], ['🐸', -80, 0, 100], ['🦀', 90, 10, 100]] },
    ],
  },
  {
    id: 'duck', title: 'The Duck and the Truck', cover: '🦆', bg: 'town', pages: [
      { text: 'A duck is in a truck.', art: [['🚚', 0, 30, 220], ['🦆', 40, -70, 80]] },
      { text: 'The truck hit a rock!', art: [['🚚', -90, 20, 170], ['🪨', 140, 50, 100], ['💥', 70, -40, 70]] },
      { text: 'Quack! said the duck.', art: [['🦆', 0, 10, 150], ['💬', 110, -90, 80]] },
      { text: 'The duck got back in the truck.', art: [['🚚', 20, 30, 200], ['🦆', 60, -70, 80]] },
      { text: 'The duck had luck!', art: [['🦆', 0, 10, 150], ['🍀', -130, -60, 70], ['⭐', 130, -70, 60]] },
    ],
  },
  {
    id: 'fish', title: 'The Fish', cover: '🐟', bg: 'pond', pages: [
      { text: 'A fish is in a dish.', art: [['🍽️', 0, 40, 200], ['🐟', 0, -10, 100]] },
      { text: 'The fish has a wish.', art: [['🐟', -60, 20, 130], ['💭', 110, -60, 110], ['🌊', 110, -60, 60]] },
      { text: 'Splash! The fish is in the pond.', art: [['🌊', 0, 60, 220], ['🐟', 0, -20, 110], ['💦', -110, -80, 70]] },
      { text: 'The fish can swim and swim.', art: [['🌊', 0, 70, 220], ['🐟', -100, -10, 90], ['🐟', 90, 10, 70]] },
      { text: 'The fish is glad.', art: [['🐟', 0, 0, 150], ['😊', 110, -80, 70], ['💖', -110, -80, 60]] },
    ],
  },
  {
    id: 'lunch', title: 'Lunch', cover: '🐤', bg: 'farm', pages: [
      { text: 'A chick had lunch.', art: [['🐤', -90, 20, 130], ['🍱', 110, 40, 120]] },
      { text: 'The chick had a chip.', art: [['🐤', -60, 20, 130], ['🍟', 100, 20, 100]] },
      { text: 'Crunch! Crunch!', art: [['🐤', 0, 20, 140], ['🍟', -130, 40, 70], ['✨', 120, -70, 60]] },
      { text: 'The chick had a bun and jam.', art: [['🐤', -130, 20, 110], ['🍞', 50, 30, 100], ['🍓', 170, 30, 70]] },
      { text: 'The chick is full.', art: [['🐤', 0, 20, 150], ['😋', 110, -80, 60]] },
    ],
  },
  {
    id: 'king', title: 'The King', cover: '👑', bg: 'night', pages: [
      { text: 'A king had a ring.', art: [['🤴', -80, 10, 150], ['💍', 110, 20, 90]] },
      { text: 'The king can sing.', art: [['🤴', -40, 10, 150], ['🎤', 90, 20, 70], ['🎵', 120, -80, 60]] },
      { text: 'The ring is in the sink!', art: [['🚰', 0, -20, 120], ['💍', 0, 80, 60], ['😮', -170, 0, 70]] },
      { text: 'Think, king, think!', art: [['🤴', 0, 10, 150], ['🤔', 110, -80, 70]] },
      { text: 'The king got the ring.', art: [['🤴', -60, 10, 150], ['💍', 90, -40, 80], ['🎉', 150, 60, 60]] },
    ],
  },
  {
    id: 'snake', title: 'The Snake and the Cake', cover: '🐍', bg: 'home', pages: [
      { text: 'A snake made a cake.', art: [['🐍', -110, 20, 140], ['🎂', 110, 20, 140]] },
      { text: 'The cake is on a plate.', art: [['🍽️', 0, 50, 200], ['🎂', 0, -20, 120]] },
      { text: 'A whale got to the cake.', art: [['🐳', -110, 10, 150], ['🎂', 140, 30, 110]] },
      { text: 'Yum! The cake is the best.', art: [['🎂', 0, 10, 150], ['😋', -150, -60, 80], ['⭐', 150, -70, 70]] },
      { text: 'The snake and the whale had cake.', art: [['🐍', -150, 20, 120], ['🎂', 0, 40, 110], ['🐳', 160, 10, 130]] },
    ],
  },
  {
    id: 'bone', title: 'The Bone', cover: '🦴', bg: 'park', pages: [
      { text: 'A dog had a bone.', art: [['🐕', -80, 10, 150], ['🦴', 110, 40, 90]] },
      { text: 'The dog hid the bone in a hole.', art: [['🐕', -110, 0, 130], ['🕳️', 90, 60, 140], ['🦴', 90, 10, 60]] },
      { text: 'A cat got the bone!', art: [['🐱', 60, 10, 130], ['🦴', -60, 40, 80], ['😮', -170, -60, 60]] },
      { text: 'The dog and the cat had a nap.', art: [['🐕', -90, 20, 120], ['🐱', 90, 20, 110], ['💤', 0, -90, 60]] },
      { text: 'The bone is home.', art: [['🏠', 0, 0, 170], ['🦴', 130, 70, 70]] },
    ],
  },
];

/** A word of a story, as the curriculum lists it ("The" → "the", but "I" stays "I"). */
export const wordKey = (w: string) => (HEART[w] || WORD_LESSON[w] ? w : w.toLowerCase());

/** The words of a page's text, without punctuation. */
export const wordsOf = (text: string) => text.split(/\s+/).map(t => t.replace(/[^A-Za-z']/g, '')).filter(Boolean);

const lessonOfWord = (w: string) => { const k = wordKey(w); return HEART[k]?.lesson ?? WORD_LESSON[k] ?? Infinity; };

/** The lesson a story unlocks at: when its last word is taught. */
export const storyLesson = (s: Story) =>
  Math.max(...[s.title, ...s.pages.map(p => p.text)].flatMap(wordsOf).map(lessonOfWord));
