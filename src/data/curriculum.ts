// UFLI Foundations–style scope & sequence.
// Lesson numbers follow the UFLI order (alphabet, then short-vowel blends, FLSZ,
// digraphs, VCe). Practice/review lessons are folded into the surrounding lessons.
// Every word is checked by tests/curriculum.test.ts to only use graphemes taught
// by its lesson.

export interface Grapheme {
  id: string;
  lesson: number;
  /** Keyword, e.g. "apple" for a. */
  key: string;
  /** Keyword picture (emoji). */
  pic: string;
  /** What is shown on screen. */
  label: string;
}

export interface HeartWord {
  w: string;
  lesson: number;
  /** Indices of the irregular ("heart") letters. */
  hp: number[];
}

export interface Lesson {
  n: number;
  title: string;
  g: string[];
  w: string[];
  h?: HeartWord[];
}

export type ItemKind = 'g' | 'w' | 'h';

const G = (id: string, lesson: number, key: string, pic: string, label = id): Grapheme =>
  ({ id, lesson, key, pic, label });

export const GRAPHEMES: Record<string, Grapheme> = Object.fromEntries([
  G('a', 1, 'apple', '🍎'),
  G('m', 2, 'monkey', '🐵'),
  G('s', 3, 'sun', '☀️'),
  G('t', 4, 'tiger', '🐯'),
  G('p', 6, 'pig', '🐷'),
  G('f', 7, 'fish', '🐟'),
  G('i', 8, 'inchworm', '🐛'),
  G('n', 9, 'nose', '👃'),
  G('o', 12, 'octopus', '🐙'),
  G('d', 13, 'dog', '🐶'),
  G('c', 14, 'cat', '🐱'),
  G('u', 15, 'umbrella', '☂️'),
  G('g', 16, 'goat', '🐐'),
  G('b', 17, 'ball', '⚽'),
  G('e', 18, 'egg', '🥚'),
  G('k', 20, 'kite', '🪁'),
  G('h', 21, 'hat', '🎩'),
  G('r', 22, 'robot', '🤖'),
  G('l', 23, 'lion', '🦁'),
  G('w', 24, 'worm', '🪱'),
  G('j', 25, 'juice', '🧃'),
  G('y', 26, 'yo-yo', '🪀'),
  G('x', 27, 'fox', '🦊'),
  G('qu', 28, 'queen', '👸'),
  G('v', 29, 'van', '🚐'),
  G('z', 30, 'zebra', '🦓'),
  G('ff', 42, 'puff', '💨'),
  G('ll', 42, 'bell', '🔔'),
  G('ss', 42, 'kiss', '💋'),
  G('zz', 42, 'buzz', '🐝'),
  G('all', 43, 'ball', '⚽'),
  G('oll', 43, 'roll', '🧻'),
  G('ull', 43, 'bull', '🐂'),
  G('ck', 44, 'duck', '🦆'),
  G('sh', 45, 'ship', '🚢'),
  G('th_v', 46, 'this', '👉', 'th'),
  G('th', 47, 'thumb', '👍'),
  G('ch', 48, 'chick', '🐤'),
  G('wh', 50, 'whale', '🐳'),
  G('ph', 50, 'phone', '📱'),
  G('ng', 51, 'ring', '💍'),
  G('nk', 52, 'skunk', '🦨'),
  G('a_e', 54, 'cake', '🎂', 'a_e'),
  G('i_e', 55, 'bike', '🚲', 'i_e'),
  G('o_e', 56, 'bone', '🦴', 'o_e'),
  G('u_e', 57, 'cube', '🧊', 'u_e'),
  G('e_e', 58, 'these', '👇', 'e_e'),
].map(g => [g.id, g]));

// Graphemes that make the same sound — never offered as distractors for each other.
const SAME_SOUND = [['c', 'k', 'ck'], ['f', 'ff', 'ph'], ['l', 'll'], ['s', 'ss'], ['z', 'zz'], ['w', 'wh']];
// Visually or aurally confusable — used as distractors only at the hardest tier.
const CONFUSABLE = [['b', 'd'], ['b', 'p'], ['d', 'p'], ['m', 'n'], ['n', 'u'], ['n', 'h'], ['f', 't'],
  ['e', 'i'], ['a', 'o'], ['o', 'u'], ['a', 'u'], ['sh', 'ch'], ['th', 'f'], ['v', 'f'], ['i', 'l'], ['ng', 'nk']];

export const soundClass = (g: string) => (SAME_SOUND.find(s => s.includes(g)) || [g])[0];
export const confusable = (a: string, b: string) =>
  CONFUSABLE.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

const H = (w: string, lesson: number, hp: number[]): HeartWord => ({ w, lesson, hp });

export const LESSONS: Lesson[] = [
  { n: 1, title: 'a', g: ['a'], w: [] },
  { n: 2, title: 'm', g: ['m'], w: ['am'] },
  { n: 3, title: 's', g: ['s'], w: [] },
  { n: 4, title: 't', g: ['t'], w: ['at', 'sat', 'mat'], h: [H('the', 4, [2]), H('a', 4, [0])] },
  { n: 6, title: 'p', g: ['p'], w: ['map', 'tap', 'pat', 'sap'] },
  { n: 7, title: 'f', g: ['f'], w: ['fat'] },
  { n: 8, title: 'i', g: ['i'], w: ['it', 'sit', 'pit', 'fit', 'tip', 'sip', 'if'], h: [H('I', 8, [0]), H('is', 8, [1])] },
  { n: 9, title: 'n', g: ['n'], w: ['an', 'in', 'nap', 'pan', 'tan', 'fan', 'man', 'pin', 'tin', 'fin', 'nip'] },
  { n: 12, title: 'o', g: ['o'], w: ['on', 'not', 'pot', 'top', 'mop', 'pop', 'mom'], h: [H('to', 12, [1])] },
  { n: 13, title: 'd', g: ['d'], w: ['dad', 'sad', 'mad', 'pad', 'did', 'dip', 'dot', 'nod', 'pod', 'and'], h: [H('do', 13, [1])] },
  { n: 14, title: 'c', g: ['c'], w: ['cat', 'cap', 'can', 'cot', 'cop'] },
  { n: 15, title: 'u', g: ['u'], w: ['up', 'us', 'sun', 'cup', 'nut', 'mud', 'cut', 'pup', 'fun', 'sum'], h: [H('of', 15, [0, 1])] },
  { n: 16, title: 'g', g: ['g'], w: ['dog', 'pig', 'dig', 'gum', 'tag', 'fog', 'mug', 'gas', 'got', 'dug', 'tug', 'fig', 'pug'] },
  { n: 17, title: 'b', g: ['b'], w: ['bat', 'bag', 'big', 'bus', 'cab', 'tub', 'bug', 'bun', 'bin', 'cub', 'bib', 'bad', 'bit', 'but'], h: [H('was', 17, [1, 2])] },
  { n: 18, title: 'e', g: ['e'], w: ['bed', 'net', 'pen', 'ten', 'men', 'pet', 'get', 'set', 'beg', 'den', 'fed', 'peg'], h: [H('said', 18, [1, 2]), H('me', 18, [1]), H('be', 18, [1])] },
  { n: 20, title: 'k', g: ['k'], w: ['kid', 'kit', 'kin', 'keg'], h: [H('you', 20, [1, 2])] },
  { n: 21, title: 'h', g: ['h'], w: ['hat', 'hen', 'hot', 'hop', 'hug', 'hut', 'hit', 'hip', 'ham', 'hum', 'had', 'hid', 'hog'], h: [H('he', 21, [1])] },
  { n: 22, title: 'r', g: ['r'], w: ['rat', 'red', 'run', 'rug', 'rip', 'rag', 'ram', 'rib', 'rub', 'rot', 'ran'], h: [H('are', 22, [0, 1, 2])] },
  { n: 23, title: 'l', g: ['l'], w: ['log', 'leg', 'lip', 'lid', 'lap', 'lot', 'let', 'lab'] },
  { n: 24, title: 'w', g: ['w'], w: ['web', 'wet', 'wig', 'win', 'wag'], h: [H('we', 24, [1])] },
  { n: 25, title: 'j', g: ['j'], w: ['jam', 'jet', 'jog', 'jug', 'job', 'jig'] },
  { n: 26, title: 'y', g: ['y'], w: ['yes', 'yet', 'yam', 'yum', 'yap', 'yak'], h: [H('my', 26, [1]), H('by', 26, [1])] },
  { n: 27, title: 'x', g: ['x'], w: ['box', 'fox', 'six', 'mix', 'wax', 'fix', 'ox'] },
  { n: 28, title: 'qu', g: ['qu'], w: ['quit'] },
  { n: 29, title: 'v', g: ['v'], w: ['van', 'vet'] },
  { n: 30, title: 'z', g: ['z'], w: ['zip', 'zap', 'quiz', 'zag'], h: [H('has', 30, [2]), H('his', 30, [2]), H('as', 30, [1])] },
  { n: 35, title: 'blends with a', g: [], w: ['flag', 'crab', 'clap', 'hand', 'lamp', 'ant', 'camp', 'glad', 'plan', 'sand', 'snap', 'trap', 'raft', 'grab', 'fast'], h: [H('for', 35, [1, 2]), H('or', 35, [0, 1])] },
  { n: 36, title: 'blends with i', g: [], w: ['milk', 'gift', 'swim', 'skip', 'spin', 'twin', 'list', 'drip', 'grin', 'crib', 'trip', 'lift', 'mist'] },
  { n: 37, title: 'blends with o', g: [], w: ['frog', 'stop', 'drop', 'pond', 'spot', 'plop', 'soft', 'crop', 'trot', 'blob'] },
  { n: 38, title: 'blends with u', g: [], w: ['drum', 'plum', 'jump', 'bump', 'dust', 'hunt', 'snug', 'slug', 'plug', 'crust', 'stump'] },
  { n: 39, title: 'blends with e', g: [], w: ['nest', 'tent', 'desk', 'belt', 'sled', 'step', 'vest', 'help', 'left', 'went', 'spend', 'best'] },
  { n: 42, title: 'ff ll ss zz', g: ['ff', 'll', 'ss', 'zz'], w: ['bell', 'hill', 'kiss', 'buzz', 'puff', 'cliff', 'dress', 'grass', 'doll', 'well', 'spill', 'cuff', 'stuff', 'off', 'glass', 'fizz'] },
  { n: 43, title: 'all oll ull', g: ['all', 'oll', 'ull'], w: ['ball', 'wall', 'tall', 'call', 'fall', 'small', 'mall', 'roll', 'troll', 'bull', 'full', 'pull'] },
  { n: 44, title: 'ck', g: ['ck'], w: ['duck', 'sock', 'rock', 'lock', 'clock', 'truck', 'sick', 'kick', 'back', 'neck', 'black', 'stick', 'snack', 'quack', 'luck', 'pack'] },
  { n: 45, title: 'sh', g: ['sh'], w: ['ship', 'fish', 'shell', 'dish', 'shop', 'cash', 'shut', 'wish', 'shed', 'brush', 'trash', 'splash', 'shelf', 'shock'], h: [H('she', 45, [2])] },
  { n: 46, title: 'th (this)', g: ['th_v'], w: ['this', 'that', 'them', 'then', 'with', 'than'], h: [H('they', 46, [2, 3])] },
  { n: 47, title: 'th (thin)', g: ['th'], w: ['bath', 'math', 'moth', 'thin', 'thick', 'cloth', 'path', 'thud', 'broth'], h: [H('what', 47, [2])] },
  { n: 48, title: 'ch', g: ['ch'], w: ['chip', 'chick', 'lunch', 'bench', 'chin', 'rich', 'chop', 'much', 'chest', 'check', 'inch', 'punch', 'crunch', 'chat'], h: [H('from', 48, [2])] },
  { n: 50, title: 'wh ph', g: ['wh', 'ph'], w: ['whip', 'when', 'which', 'whisk', 'whiz', 'graph'] },
  { n: 51, title: 'ng', g: ['ng'], w: ['ring', 'king', 'swing', 'sing', 'long', 'song', 'thing', 'bang', 'hang', 'sting', 'strong', 'lung'], h: [H('have', 51, [1, 3])] },
  { n: 52, title: 'nk', g: ['nk'], w: ['sink', 'drink', 'pink', 'skunk', 'bank', 'trunk', 'wink', 'think', 'honk', 'junk', 'tank', 'ink', 'stink', 'bunk'], h: [H('one', 52, [0, 1, 2]), H('two', 52, [1, 2])] },
  { n: 54, title: 'a_e', g: ['a_e'], w: ['cake', 'snake', 'gate', 'cape', 'lake', 'plane', 'grape', 'game', 'tape', 'wave', 'cave', 'rake', 'skate', 'plate', 'name', 'made', 'bake', 'shake', 'whale'], h: [H('there', 54, [2, 3, 4]), H('here', 54, [1, 3])] },
  { n: 55, title: 'i_e', g: ['i_e'], w: ['bike', 'kite', 'five', 'dime', 'nine', 'slide', 'pine', 'smile', 'hike', 'bite', 'ride', 'hide', 'side', 'time', 'line', 'vine', 'wipe', 'pipe', 'prize', 'white', 'shine'] },
  { n: 56, title: 'o_e', g: ['o_e'], w: ['rope', 'bone', 'nose', 'home', 'rose', 'stone', 'hole', 'cone', 'robe', 'globe', 'pole', 'note', 'hope', 'joke', 'smoke', 'stove', 'broke', 'those', 'phone'] },
  { n: 57, title: 'u_e', g: ['u_e'], w: ['cube', 'mule', 'flute', 'tube', 'cute', 'dune', 'prune', 'rule', 'tune', 'use'] },
  { n: 58, title: 'e_e', g: ['e_e'], w: ['these', 'theme', 'eve'] },
];

export const LESSON_NUMS = LESSONS.map(l => l.n);
export const lessonInfo = (n: number) => LESSONS.find(l => l.n === n);
export const nextLesson = (n: number) => LESSON_NUMS.find(x => x > n) ?? n;
export const prevLesson = (n: number) => [...LESSON_NUMS].reverse().find(x => x < n) ?? n;
export const FIRST_LESSON = LESSON_NUMS[0];
export const LAST_LESSON = LESSON_NUMS[LESSON_NUMS.length - 1];

export const WORD_LESSON: Record<string, number> = {};
export const HEART: Record<string, HeartWord> = {};
for (const l of LESSONS) {
  for (const w of l.w) WORD_LESSON[w] ??= l.n;
  for (const h of l.h || []) HEART[h.w] = h;
}

// Pictures for decodable words. Kept to emoji that render on most phones (Unicode ≤ 14).
export const PIC: Record<string, string> = {
  map: '🗺️', tap: '🚰', pan: '🍳', pin: '📌', nap: '😴', pot: '🪴', mom: '👩', dad: '👨', sad: '😢', mad: '😠',
  cat: '🐱', cap: '🧢', can: '🥫', cop: '👮', up: '⬆️', sun: '☀️', cup: '☕', nut: '🥜', pup: '🐶', dog: '🐕',
  pig: '🐷', fog: '🌫️', gas: '⛽', tag: '🏷️', bat: '🦇', bag: '👜', bus: '🚌', cab: '🚕', tub: '🛁', bug: '🐛',
  bed: '🛏️', net: '🥅', pen: '🖊️', ten: '🔟', kid: '🧒', hat: '🎩', hen: '🐔', hot: '🥵', hug: '🤗', hut: '🛖',
  ham: '🍖', rat: '🐀', red: '🟥', run: '🏃', log: '🪵', leg: '🦵', lip: '👄', web: '🕸️', wet: '💦', win: '🏆',
  jet: '🛩️', box: '📦', fox: '🦊', six: '6️⃣', ox: '🐂', van: '🚐', zap: '⚡',
  flag: '🚩', crab: '🦀', clap: '👏', hand: '✋', lamp: '💡', ant: '🐜', camp: '🏕️', sand: '🏖️', milk: '🥛', gift: '🎁',
  swim: '🏊', frog: '🐸', stop: '🛑', drop: '💧', drum: '🥁', nest: '🪺', tent: '⛺', sled: '🛷', vest: '🦺',
  bell: '🔔', hill: '⛰️', kiss: '💋', dress: '👗', ball: '⚽', wall: '🧱', roll: '🧻', troll: '🧌',
  duck: '🦆', sock: '🧦', rock: '🪨', lock: '🔒', clock: '⏰', truck: '🚚', sick: '🤒',
  ship: '🚢', fish: '🐟', shell: '🐚', dish: '🍽️', shop: '🏪', cash: '💵', brush: '🪥', trash: '🗑️', bath: '🛀',
  chick: '🐤', lunch: '🍱', inch: '📏', punch: '👊', ring: '💍', king: '👑', sing: '🎤', song: '🎵',
  drink: '🥤', skunk: '🦨', bank: '🏦', wink: '😉', think: '🤔',
  cake: '🎂', snake: '🐍', lake: '🏞️', plane: '✈️', grape: '🍇', game: '🎮', wave: '🌊', skate: '⛸️', whale: '🐳',
  bike: '🚲', kite: '🪁', five: '5️⃣', nine: '9️⃣', slide: '🛝', smile: '😊', pine: '🌲',
  rope: '🪢', bone: '🦴', nose: '👃', home: '🏠', rose: '🌹', cone: '🍦', globe: '🌍', phone: '📱', smoke: '💨', cube: '🧊',
};

// Words whose pictures look alike — never shown side by side.
const PIC_CONFLICTS = [['pup', 'dog'], ['cup', 'drink'], ['tub', 'bath'], ['hot', 'sick'], ['mom', 'dad'], ['rock', 'log'],
  ['sad', 'mad'], ['smoke', 'fog'], ['jet', 'plane'], ['six', 'five', 'nine', 'ten']];
export const picConflict = (a: string, b: string) =>
  a === b || PIC[a] === PIC[b] || PIC_CONFLICTS.some(g => g.includes(a) && g.includes(b));

// Picture words that are concrete things (usable as the subject of a sentence).
export const NOUNS = new Set(['map', 'pan', 'pin', 'pot', 'cat', 'cap', 'can', 'cop', 'sun', 'cup', 'nut', 'pup', 'dog', 'pig',
  'bat', 'bag', 'bus', 'cab', 'tub', 'bug', 'bed', 'net', 'pen', 'kid', 'hat', 'hen', 'hut', 'rat', 'log', 'web', 'jet',
  'box', 'fox', 'ox', 'van', 'flag', 'crab', 'ant', 'tent', 'frog', 'drum', 'nest', 'sled', 'vest', 'bell', 'ball',
  'troll', 'duck', 'sock', 'rock', 'lock', 'clock', 'truck', 'ship', 'fish', 'shell', 'dish', 'brush',
  'chick', 'ring', 'king', 'skunk', 'cake', 'snake', 'plane', 'whale', 'bike', 'kite', 'bone', 'cone', 'globe', 'phone', 'cube']);

export interface Token {
  /** Letters as written. */
  t: string;
  /** Grapheme id for its sound, or null for a silent letter. */
  g: string | null;
}

const MULTI = ['all', 'oll', 'ull', 'ck', 'sh', 'th', 'ch', 'wh', 'ph', 'ng', 'nk', 'qu', 'ff', 'll', 'ss', 'zz'];
const VOICED_TH = new Set(['this', 'that', 'them', 'then', 'than', 'with', 'these', 'those']);

// Split a word into grapheme tokens. Only graphemes taught by the word's lesson are used,
// so "doll" (lesson 42) is d-o-ll, not d-oll.
export function segment(word: string, lesson = WORD_LESSON[word] ?? Infinity): Token[] {
  const w = word.toLowerCase();
  const taught = (g: string) => !!GRAPHEMES[g] && GRAPHEMES[g].lesson <= lesson;
  let vce = -1;
  if (w.length >= 3 && w.endsWith('e')) {
    const v = w.length - 3;
    if ('aeiou'.includes(w[v]) && !'aeiou'.includes(w[v + 1]) && taught(w[v] + '_e')) vce = v;
  }
  const toks: Token[] = [];
  for (let i = 0; i < w.length;) {
    if (vce >= 0 && i === w.length - 1) { toks.push({ t: 'e', g: null }); i++; continue; }
    if (i === vce) { toks.push({ t: w[i], g: w[i] + '_e' }); i++; continue; }
    const gid = (mg: string) => (mg === 'th' && VOICED_TH.has(w) ? 'th_v' : mg);
    const m = MULTI.find(mg => w.startsWith(mg, i) && taught(gid(mg)));
    if (m) {
      toks.push({ t: m, g: gid(m) });
      i += m.length;
    } else {
      toks.push({ t: w[i], g: w[i] });
      i++;
    }
  }
  return toks;
}

// ---- Non-reading picture bank for phonemic awareness games ----
export const BANK: Record<string, string> = {
  apple: '🍎', ant: '🐜', alligator: '🐊', astronaut: '🧑‍🚀', axe: '🪓',
  bear: '🐻', ball: '⚽', banana: '🍌', bus: '🚌', bee: '🐝', boat: '⛵', bat: '🦇', bed: '🛏️', bone: '🦴', bell: '🔔', bread: '🍞',
  cat: '🐱', car: '🚗', cake: '🎂', cow: '🐮', carrot: '🥕', corn: '🌽', coat: '🧥', cone: '🍦', clock: '⏰',
  dog: '🐶', duck: '🦆', door: '🚪', donut: '🍩', dinosaur: '🦕', dish: '🍽️',
  egg: '🥚', elephant: '🐘', envelope: '✉️',
  fish: '🐟', frog: '🐸', fox: '🦊', fire: '🔥', flower: '🌸',
  goat: '🐐', gift: '🎁', grapes: '🍇', guitar: '🎸', ghost: '👻',
  hat: '🎩', horse: '🐴', house: '🏠', heart: '❤️', hamburger: '🍔', hen: '🐔', hand: '✋',
  inchworm: '🐛', insect: '🐞',
  juice: '🧃', jeans: '👖', jar: '🫙', jet: '🛩️',
  kite: '🪁', key: '🔑', kangaroo: '🦘', koala: '🐨', king: '👑',
  lion: '🦁', lemon: '🍋', leaf: '🍃', lips: '👄', log: '🪵', lock: '🔒', light: '💡',
  moon: '🌙', monkey: '🐵', mouse: '🐭', milk: '🥛', map: '🗺️', mug: '☕', mail: '📬',
  nose: '👃', nest: '🪺', nut: '🥜', net: '🥅', nine: '9️⃣',
  octopus: '🐙', otter: '🦦', one: '1️⃣',
  pig: '🐷', pizza: '🍕', pear: '🍐', penguin: '🐧', pen: '🖊️', phone: '📱',
  queen: '👸',
  rabbit: '🐰', rainbow: '🌈', robot: '🤖', rocket: '🚀', ring: '💍', rock: '🪨', rose: '🌹', rain: '🌧️', rat: '🐀', run: '🏃',
  sun: '☀️', snake: '🐍', sock: '🧦', socks: '🧦', star: '⭐', seal: '🦭', spoon: '🥄', snail: '🐌', sled: '🛷', sing: '🎤',
  tiger: '🐯', tree: '🌳', turtle: '🐢', tomato: '🍅', train: '🚂', ten: '🔟', tent: '⛺', three: '3️⃣', thumb: '👍',
  umbrella: '☂️', up: '⬆️',
  volcano: '🌋', violin: '🎻', van: '🚐',
  watermelon: '🍉', worm: '🪱', web: '🕸️', whale: '🐳', wall: '🧱', wig: '🦱',
  yarn: '🧶', 'yo-yo': '🪀',
  zebra: '🦓', zero: '0️⃣',
  ship: '🚢', shell: '🐚', shoe: '👟', sheep: '🐑',
  chick: '🐤', chair: '🪑', cheese: '🧀', cherries: '🍒', chain: '⛓️',
  bug: '🐛', bike: '🚲', box: '📦',
};

// Initial sound of a bank word, as a grapheme id.
export function initialSound(word: string) {
  for (const d of ['sh', 'ch', 'th', 'wh', 'qu']) if (word.startsWith(d)) return d;
  return word[0];
}

// Rhyme families, all drawn from BANK.
export const RHYMES: string[][] = [
  ['cat', 'hat', 'bat', 'rat'], ['dog', 'frog', 'log'], ['bee', 'tree', 'key', 'three'], ['car', 'star', 'jar'],
  ['cake', 'snake'], ['moon', 'spoon'], ['fox', 'box', 'socks'], ['goat', 'boat', 'coat'], ['mouse', 'house'],
  ['bear', 'pear', 'chair'], ['ring', 'king', 'sing'], ['clock', 'sock', 'rock', 'lock'], ['fish', 'dish'],
  ['bed', 'sled', 'bread'], ['bug', 'mug'], ['sun', 'run', 'one'], ['ball', 'wall'], ['bell', 'shell'],
  ['bone', 'phone', 'cone'], ['ten', 'pen', 'hen'], ['whale', 'snail', 'mail'], ['train', 'rain', 'chain'],
  ['kite', 'light'], ['nose', 'rose'], ['pig', 'wig'], ['net', 'jet'],
];

export const itemId = (kind: ItemKind, x: string) => `${kind}:${x}`;
export const parseId = (id: string) => {
  const i = id.indexOf(':');
  return { kind: id.slice(0, i) as ItemKind, x: id.slice(i + 1) };
};

// All learnable items introduced at or before a lesson.
export function itemsUpTo(lesson: number) {
  const out: { id: string; lesson: number }[] = [];
  for (const l of LESSONS) {
    if (l.n > lesson) break;
    for (const g of l.g) out.push({ id: itemId('g', g), lesson: l.n });
    for (const w of l.w) if (WORD_LESSON[w] === l.n) out.push({ id: itemId('w', w), lesson: l.n });
    for (const h of l.h || []) out.push({ id: itemId('h', h.w), lesson: l.n });
  }
  return out;
}

export function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
