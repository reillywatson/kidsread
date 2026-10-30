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
    id: 'pot', title: 'The Pot', cover: '🪴', bg: 'home', pages: [
      { text: 'It is a pot.', art: [['🪴', 0, 0, 170]] },
      { text: 'A pin is in the pot.', art: [['🪴', 0, 30, 190], ['📌', 50, -60, 60]] },
      { text: 'A map is in the pot.', art: [['🪴', 0, 30, 190], ['🗺️', -40, -60, 70]] },
      { text: 'A man is on the pot!', art: [['🪴', 0, 60, 170], ['🧔', 0, -60, 110]] },
      { text: 'Mom is in the pot!', art: [['🪴', 0, 50, 200], ['👩', 0, -50, 100], ['😮', 130, -100, 60]] },
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
    id: 'pup', title: 'The Pup', cover: '🐶', bg: 'park', pages: [
      { text: 'It is a pup.', art: [['🐶', 0, 0, 160]] },
      { text: 'The pup is in a cup.', art: [['☕', 0, 40, 200], ['🐶', 0, -60, 90]] },
      { text: 'Up, pup, up!', art: [['🐶', 0, -60, 130], ['⬆️', -150, 30, 70], ['⬆️', 150, 30, 70]] },
      { text: 'The pup is on top of a pot.', art: [['🪴', 0, 50, 180], ['🐶', 0, -80, 90]] },
      { text: 'The pup can nap in the sun.', art: [['🐶', -40, 40, 140], ['☀️', 150, -90, 90], ['💤', 60, -50, 60]] },
    ],
  },
  {
    id: 'mud', title: 'Mud', cover: '🟤', bg: 'farm', pages: [
      { text: 'A dog dug in the mud.', art: [['🟤', 0, 70, 190], ['🐕', 0, -20, 120], ['💨', 120, 0, 60]] },
      { text: 'The dog got mud on a cat.', art: [['🐕', -110, 10, 120], ['🐱', 100, 10, 120], ['🟤', 120, -50, 40]] },
      { text: 'The cat is mad!', art: [['😾', 0, 0, 150], ['💢', 90, -80, 60]] },
      { text: 'The dog and the cat tug.', art: [['🐕', -120, 10, 120], ['🪢', 0, 20, 90], ['🐱', 120, 10, 120]] },
      { text: 'Mom got the dog and the cat.', art: [['👩', 0, -10, 140], ['🐕', -150, 60, 90], ['🐱', 150, 60, 90]] },
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
    id: 'van', title: 'The Vet and the Van', cover: '🚐', bg: 'town', pages: [
      { text: 'The vet has a van.', art: [['🚐', 40, 30, 190], ['🧑‍⚕️', -170, 10, 130]] },
      { text: 'A sad pup is in the van.', art: [['🚐', 0, 30, 200], ['🐶', 30, -40, 80], ['💧', 80, -80, 34]] },
      { text: 'The vet can fix the pup.', art: [['🧑‍⚕️', -90, 0, 140], ['🐶', 90, 30, 110], ['🩹', 90, -50, 50]] },
      { text: 'Zip, zap! The pup is not sad.', art: [['🐶', 0, 10, 150], ['✨', -110, -80, 60], ['✨', 110, -70, 50]] },
      { text: 'The pup and the vet hug.', art: [['🧑‍⚕️', -60, 0, 140], ['🐶', 60, 20, 110], ['💖', 0, -110, 60]] },
    ],
  },
  {
    id: 'crab', title: 'The Crab and the Flag', cover: '🦀', bg: 'pond', pages: [
      { text: 'A crab is on the sand.', art: [['🏖️', -70, 20, 190], ['🦀', 130, 70, 100]] },
      { text: 'The crab has a flag.', art: [['🦀', -40, 30, 140], ['🚩', 80, -40, 100]] },
      { text: 'Snap! Snap! The crab can clap.', art: [['🦀', 0, 20, 160], ['👏', -130, -80, 60], ['👏', 130, -80, 60]] },
      { text: 'An ant is on the flag.', art: [['🚩', 0, 0, 180], ['🐜', 20, -60, 60]] },
      { text: 'The crab and the ant are glad.', art: [['🦀', -80, 30, 130], ['🐜', 90, 40, 80], ['😊', 0, -100, 60]] },
    ],
  },
  {
    id: 'kit', title: 'Kit Can Swim', cover: '🏊', bg: 'pond', pages: [
      { text: 'Kit can skip.', art: [['🧒', 0, 0, 160], ['💨', -110, 40, 60]] },
      { text: 'Kit can spin.', art: [['🧒', 0, 0, 150], ['🌀', 0, -110, 60], ['🌀', 120, 0, 50]] },
      { text: 'Kit can swim!', art: [['🏊', 0, 20, 170], ['💦', 120, -50, 60]] },
      { text: 'Dad has a gift for Kit.', art: [['👨', -100, 0, 140], ['🎁', 70, 40, 100], ['🧒', 190, 10, 100]] },
      { text: 'It is milk! Kit and Dad grin.', art: [['🥛', 0, 30, 120], ['🧒', -150, 10, 110], ['👨', 150, 0, 120], ['😁', 0, -100, 56]] },
    ],
  },
  {
    id: 'blob', title: 'The Blob', cover: '🔴', bg: 'home', pages: [
      { text: 'A red blob is on the bed.', art: [['🛏️', 0, 50, 220], ['🔴', 0, -40, 90], ['👀', 0, -50, 44]] },
      { text: 'The blob can hop.', art: [['🔴', 0, -30, 110], ['👀', 0, -40, 50], ['💨', 0, 80, 60]] },
      { text: 'The blob can trot.', art: [['🔴', 20, 0, 110], ['👀', 20, -10, 50], ['💨', -120, 20, 60]] },
      { text: 'Stop, blob! Stop!', art: [['🔴', 0, 0, 130], ['👀', 0, -10, 56], ['🛑', 170, -60, 70]] },
      { text: 'Plop! The blob is in a pot.', art: [['🪴', 0, 40, 190], ['🔴', 0, -50, 70], ['💥', 120, -90, 50]] },
      { text: 'The blob is soft and fun.', art: [['🔴', 0, 0, 130], ['👀', 0, -10, 56], ['💖', 120, -80, 50]] },
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
    id: 'elf', title: 'The Elf and the Bell', cover: '🧝', bg: 'park', pages: [
      { text: 'An elf has a bell.', art: [['🧝', -60, 0, 150], ['🔔', 90, -20, 90]] },
      { text: 'The bell is on his belt.', art: [['🧝', 0, 0, 170], ['🔔', 50, 50, 66]] },
      { text: 'The elf went up the hill.', art: [['⛰️', 0, 30, 240], ['🧝', -80, -20, 80]] },
      { text: 'Puff! Puff! The elf is at the top.', art: [['⛰️', 0, 40, 240], ['🧝', 0, -100, 70], ['💨', 90, -100, 44]] },
      { text: 'The elf sat on the grass.', art: [['🌿', -60, 70, 90], ['🌿', 60, 70, 90], ['🧝', 0, -10, 130]] },
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
  {
    id: 'shark', title: 'The Shark and the Star', cover: '🦈', bg: 'pond', pages: [
      { text: 'A shark can swim far.', art: [['🌊', 0, 70, 220], ['🦈', 0, -10, 150]] },
      { text: 'The shark had a star.', art: [['🦈', -90, 10, 150], ['⭐', 120, -40, 90]] },
      { text: 'The star is in a jar.', art: [['🫙', 0, 30, 190], ['⭐', 0, 20, 70]] },
      { text: 'The jar is in a car.', art: [['🚗', 0, 30, 220], ['🫙', 30, -60, 70]] },
      { text: 'The shark and the star are in the park.', art: [['🌳', -170, 0, 130], ['🦈', 10, 30, 130], ['⭐', 150, -70, 80]] },
    ],
  },
  {
    id: 'storm', title: 'The Storm', cover: '⛈️', bg: 'farm', pages: [
      { text: 'A storm is on the farm.', art: [['⛈️', 0, -40, 180], ['🌾', -150, 90, 70], ['🌾', 150, 90, 70]] },
      { text: 'The hen ran to the barn.', art: [['🏠', 90, 10, 170], ['🐔', -130, 40, 100]] },
      { text: 'The pig ran to the barn.', art: [['🏠', 90, 10, 170], ['🐷', -130, 40, 100]] },
      { text: 'The storm is short.', art: [['⛈️', -80, -40, 120], ['🌤️', 100, -20, 120]] },
      { text: 'Then the sun is up!', art: [['☀️', 0, -20, 170], ['🌈', 0, 90, 90]] },
      { text: 'The hen has corn in the yard.', art: [['🐔', -60, 10, 140], ['🌽', 80, 40, 90]] },
    ],
  },
  {
    id: 'bird', title: 'The Girl and the Bird', cover: '🐦', bg: 'park', pages: [
      { text: 'A girl has a pink shirt.', art: [['👧', -60, 0, 150], ['👚', 100, 20, 100]] },
      { text: 'A bird sat on her arm.', art: [['👧', 0, 20, 170], ['🐦', 70, -40, 70]] },
      { text: 'The bird can swirl and turn.', art: [['🐦', 0, -10, 120], ['🌀', -130, 40, 70], ['🌀', 130, -60, 60]] },
      { text: 'The girl had a nut for the bird.', art: [['👧', -80, 10, 150], ['🥜', 40, 20, 60], ['🐦', 150, -30, 90]] },
      { text: 'The girl and the bird are glad.', art: [['👧', -70, 10, 150], ['🐦', 90, -30, 90], ['💖', 10, -110, 56]] },
    ],
  },
  {
    id: 'snail', title: 'The Snail and the Rain', cover: '🐌', bg: 'park', pages: [
      { text: 'It is a gray day.', art: [['☁️', -80, -40, 150], ['☁️', 100, -20, 120]] },
      { text: 'Here is the rain!', art: [['🌧️', 0, -30, 180], ['💧', -120, 90, 40], ['💧', 120, 80, 40]] },
      { text: 'A snail is on a pail.', art: [['🪣', 0, 40, 170], ['🐌', 0, -60, 80]] },
      { text: 'The snail can wait in the rain.', art: [['🌧️', 0, -80, 130], ['🐌', 0, 60, 110]] },
      { text: 'The snail can play in the mud.', art: [['🐌', -40, 20, 130], ['🟤', 60, 80, 70], ['🎉', 150, -60, 56]] },
    ],
  },
  {
    id: 'sheep', title: 'The Sheep and the Bee', cover: '🐑', bg: 'park', pages: [
      { text: 'A sheep is in a green tree.', art: [['🌳', 0, 10, 240], ['🐑', 10, -40, 90]] },
      { text: 'A bee is on the sheep.', art: [['🐑', 0, 30, 170], ['🐝', 10, -70, 70]] },
      { text: 'The bee and the sheep sleep.', art: [['🐑', -40, 40, 150], ['🐝', 110, -30, 70], ['💤', 30, -100, 60]] },
      { text: 'The sheep had a dream.', art: [['🐑', -80, 50, 140], ['💭', 90, -60, 140], ['🌳', 90, -70, 60]] },
      { text: 'It is a dream of a big green tree.', art: [['🌳', 0, 0, 230], ['✨', -150, -90, 60], ['✨', 150, -90, 60]] },
    ],
  },
  {
    id: 'goat', title: 'The Goat and the Boat', cover: '🐐', bg: 'pond', pages: [
      { text: 'A goat has a boat.', art: [['🐐', -90, 0, 140], ['⛵', 100, 20, 140]] },
      { text: 'The goat can row the boat.', art: [['🚣', 0, 30, 180], ['🐐', 0, -60, 70]] },
      { text: 'Slow, slow, the boat can float.', art: [['⛵', 0, 0, 180], ['🌊', -140, 90, 60], ['🌊', 140, 90, 60]] },
      { text: 'A toad is on the boat!', art: [['⛵', 0, 20, 190], ['🐸', 40, -40, 70], ['😮', -150, -90, 50]] },
      { text: 'The goat and the toad eat toast.', art: [['🐐', -110, 10, 130], ['🐸', 110, 40, 90], ['🍞', 0, 60, 80]] },
    ],
  },
  {
    id: 'night', title: 'Night Light', cover: '💡', bg: 'night', pages: [
      { text: 'It is night.', art: [['🌙', 0, -20, 170], ['⭐', -150, -90, 40], ['⭐', 160, 40, 34]] },
      { text: 'A light is on.', art: [['💡', 0, 0, 170]] },
      { text: 'Mom has a pie for me.', art: [['👩', -90, 0, 140], ['🥧', 90, 40, 100]] },
      { text: 'The light is bright and high.', art: [['💡', 0, -50, 120], ['✨', -110, -90, 50], ['✨', 110, -80, 44], ['🧒', 0, 90, 70]] },
      { text: 'Sleep tight!', art: [['🛏️', 0, 50, 200], ['😴', 0, -30, 90], ['💤', 110, -100, 56]] },
    ],
  },
  {
    id: 'moon', title: 'The Moon', cover: '🌕', bg: 'night', pages: [
      { text: 'It is the moon.', art: [['🌕', 0, -10, 170]] },
      { text: 'A spoon is on the moon!', art: [['🌕', 0, 30, 190], ['🥄', 10, -90, 80]] },
      { text: 'A goat in a boat can see the moon.', art: [['🌕', 140, -80, 90], ['⛵', -60, 50, 170], ['🐐', -60, -20, 80]] },
      { text: 'Look at the moon, goat!', art: [['🐐', -90, 30, 140], ['👀', -60, -80, 60], ['🌕', 140, -70, 100]] },
      { text: 'The goat and the moon say good night.', art: [['🐐', -100, 40, 130], ['🌕', 110, -60, 110], ['💤', 0, -100, 60]] },
    ],
  },
  {
    id: 'cow', title: 'The Cow and the Owl', cover: '🦉', bg: 'farm', pages: [
      { text: 'A cow is on the ground.', art: [['🐄', 0, 30, 190]] },
      { text: 'An owl sat on the cow.', art: [['🐄', 0, 50, 180], ['🦉', 10, -70, 80]] },
      { text: 'Moo! said the cow.', art: [['🐄', 0, 30, 180], ['💬', 120, -80, 60]] },
      { text: 'Who? said the owl.', art: [['🦉', 0, 0, 160], ['❓', 110, -80, 60]] },
      { text: 'The cow and the owl found a crown.', art: [['🐄', -100, 40, 150], ['🦉', 100, 20, 100], ['👑', 0, -90, 70]] },
      { text: 'Now the cow is proud!', art: [['🐄', 0, 40, 180], ['👑', 0, -80, 70], ['✨', 130, -60, 50]] },
    ],
  },
  {
    id: 'boy', title: 'The Boy and the Toy', cover: '👦', bg: 'home', pages: [
      { text: 'A boy had a toy.', art: [['👦', -80, 10, 150], ['🧸', 110, 30, 110]] },
      { text: 'The boy had a coin.', art: [['👦', -60, 10, 150], ['🪙', 110, 0, 80]] },
      { text: 'The boy got a toy cow.', art: [['👦', -90, 10, 140], ['🐮', 110, 30, 100], ['🎁', 160, -70, 50]] },
      { text: 'The toy cow can say moo.', art: [['🐮', 0, 20, 160], ['💬', 120, -90, 80]] },
      { text: 'The boy is full of joy.', art: [['👦', 0, 10, 150], ['😄', 120, -80, 60], ['💖', -120, -80, 60]] },
    ],
  },
  {
    id: 'draw', title: 'I Can Draw', cover: '🖍️', bg: 'home', pages: [
      { text: 'I can draw.', art: [['🖍️', -60, 0, 140], ['📄', 80, 10, 150]] },
      { text: 'I draw a hawk. It has a big claw.', art: [['📄', 0, 10, 220], ['🦅', 0, 0, 120]] },
      { text: 'I draw a cat. It has a paw.', art: [['📄', 0, 10, 220], ['🐱', -20, -10, 100], ['🐾', 70, 60, 50]] },
      { text: 'I draw the dawn.', art: [['📄', 0, 10, 220], ['🌅', 0, 0, 120]] },
      { text: 'I yawn. Good night!', art: [['🥱', 0, 0, 160], ['🌙', 140, -90, 60]] },
    ],
  },
  {
    id: 'stew', title: 'The Stew', cover: '🍲', bg: 'home', pages: [
      { text: 'Dad made a stew.', art: [['👨', -100, 0, 140], ['🍲', 90, 40, 110]] },
      { text: 'The stew is hot. I blew on it.', art: [['🍲', 30, 40, 150], ['🧒', -150, 0, 110], ['💨', -50, -10, 56], ['🔥', 120, -70, 44]] },
      { text: 'I chew and chew.', art: [['😋', 0, 0, 150], ['🍲', 130, 70, 70]] },
      { text: 'Yum! The stew is good.', art: [['🍲', 0, 40, 140], ['👍', -140, -60, 60], ['😋', 140, -60, 60]] },
      { text: 'Then Dad drew a blue car for me.', art: [['👨', -140, 0, 130], ['📄', 70, 10, 190], ['🚙', 70, 10, 100]] },
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
