// Sticker rewards: character textures and emoji. No imports (read by the voice script).
// Names are the original edition's; FAMILY_NAMES has the family edition's (see src/edition.ts).

export interface Sticker { id: string; texture?: string; emoji?: string; name: string }

export const STICKERS: Sticker[] = [
  { id: 'shooter', texture: 'shooter', name: 'Spritz' },
  { id: 'sunflower', texture: 'sunflower', name: 'Sunflower' },
  { id: 'roller', texture: 'roller', name: 'Pumpkin' },
  { id: 'pest', texture: 'pest', name: 'Muncher' },
  { id: 'pestBig', texture: 'pestBig', name: 'Big Muncher' },
  { id: 'hero', texture: 'hero', name: 'Zippy' },
  { id: 'leafy', texture: 'leafy', name: 'Bramble' },
  { id: 'ember', texture: 'ember', name: 'Ember' },
  { id: 'splash', texture: 'splash', name: 'Lolo' },
  { id: 'catcher', texture: 'catcher', name: 'Acorn' },
  { id: 'pup-lead', texture: 'pup-lead', name: 'Scout' },
  { id: 'pup-fire', texture: 'pup-fire', name: 'Biscuit' },
  { id: 'pup-fly', texture: 'pup-fly', name: 'Pip' },
  { id: 'pup-dig', texture: 'pup-dig', name: 'Moose' },
  { id: 'monster', texture: 'monsterHappy', name: 'Letter Monster' },
  { id: 'frog', texture: 'frog', name: 'Froggy' },
  // Emoji stickers, by kind. Only emoji from Unicode 13 or earlier, so older tablets draw them all.
  ...[
    // The first set
    ['🦄', 'unicorn'], ['🚀', 'rocket'], ['🦖', 'dinosaur'], ['🌈', 'rainbow'], ['🍦', 'ice cream'], ['🐙', 'octopus'],
    ['🦋', 'butterfly'], ['🐳', 'whale'], ['🎈', 'balloon'], ['🏆', 'trophy'], ['🦁', 'lion'], ['🐉', 'dragon'],
    ['🍩', 'donut'], ['🚒', 'fire truck'], ['🎸', 'guitar'], ['🐧', 'penguin'], ['🦈', 'shark'], ['🍕', 'pizza'],
    ['🚂', 'train'], ['🐢', 'turtle'], ['🌋', 'volcano'], ['🦒', 'giraffe'], ['🐼', 'panda'], ['🎂', 'cake'], ['👑', 'crown'],
    // Animals
    ['🐶', 'puppy'], ['🐱', 'kitty'], ['🐰', 'bunny'], ['🦊', 'fox'], ['🐻', 'bear'], ['🐨', 'koala'], ['🐯', 'tiger'],
    ['🐮', 'cow'], ['🐷', 'pig'], ['🐵', 'monkey'], ['🐔', 'chicken'], ['🐤', 'baby chick'], ['🦉', 'owl'], ['🦜', 'parrot'],
    ['🦩', 'flamingo'], ['🦚', 'peacock'], ['🦢', 'swan'], ['🦆', 'duck'], ['🐘', 'elephant'], ['🦛', 'hippo'], ['🦏', 'rhino'],
    ['🦓', 'zebra'], ['🐪', 'camel'], ['🦘', 'kangaroo'], ['🦥', 'sloth'], ['🦦', 'otter'], ['🦔', 'hedgehog'], ['🦫', 'beaver'],
    ['🐿️', 'chipmunk'], ['🦇', 'bat'], ['🐺', 'wolf'], ['🐴', 'horse'], ['🐑', 'sheep'], ['🐐', 'goat'], ['🦙', 'llama'],
    ['🐊', 'crocodile'], ['🦎', 'lizard'], ['🐍', 'snake'], ['🦕', 'long-neck dinosaur'], ['🐬', 'dolphin'], ['🦭', 'seal'],
    ['🦀', 'crab'], ['🦞', 'lobster'], ['🐠', 'fish'], ['🐡', 'pufferfish'], ['🦑', 'squid'], ['🐌', 'snail'], ['🐞', 'ladybug'],
    ['🐝', 'bee'], ['🐛', 'caterpillar'], ['🐜', 'ant'], ['🕷️', 'spider'],
    // Food
    ['🍎', 'apple'], ['🍌', 'banana'], ['🍓', 'strawberry'], ['🍉', 'watermelon'], ['🍇', 'grapes'], ['🍒', 'cherries'],
    ['🍍', 'pineapple'], ['🍋', 'lemon'], ['🍑', 'peach'], ['🥑', 'avocado'], ['🥕', 'carrot'], ['🌽', 'corn'], ['🥦', 'broccoli'],
    ['🧀', 'cheese'], ['🍔', 'hamburger'], ['🌭', 'hot dog'], ['🍟', 'french fries'], ['🌮', 'taco'], ['🍝', 'spaghetti'],
    ['🥞', 'pancakes'], ['🧇', 'waffle'], ['🥨', 'pretzel'], ['🍿', 'popcorn'], ['🧁', 'cupcake'], ['🍪', 'cookie'],
    ['🍭', 'lollipop'], ['🍬', 'candy'], ['🍫', 'chocolate'], ['🍯', 'honey'], ['🥛', 'milk'], ['🧃', 'juice box'],
    // Things that go
    ['🚗', 'car'], ['🚌', 'bus'], ['🚑', 'ambulance'], ['🚓', 'police car'], ['🚜', 'tractor'], ['🚚', 'truck'],
    ['🏎️', 'race car'], ['🏍️', 'motorcycle'], ['🚲', 'bike'], ['🛴', 'scooter'], ['✈️', 'airplane'], ['🚁', 'helicopter'],
    ['⛵', 'sailboat'], ['🚤', 'speedboat'], ['🚢', 'ship'], ['🛶', 'canoe'], ['🛸', 'flying saucer'],
    // Toys and fun
    ['⚽', 'soccer ball'], ['🏀', 'basketball'], ['⚾', 'baseball'], ['🏈', 'football'], ['🎾', 'tennis ball'], ['🪁', 'kite'],
    ['🧸', 'teddy bear'], ['🪀', 'yo-yo'], ['🎨', 'paints'], ['🖍️', 'crayon'], ['🥁', 'drum'], ['🎺', 'trumpet'], ['🎹', 'piano'],
    ['🎻', 'violin'], ['🎁', 'present'], ['🎉', 'party popper'], ['🪄', 'magic wand'], ['🔮', 'crystal ball'], ['💎', 'diamond'],
    ['🧲', 'magnet'], ['🔦', 'flashlight'], ['⏰', 'alarm clock'], ['☂️', 'umbrella'], ['🎩', 'top hat'], ['🕶️', 'sunglasses'],
    ['👟', 'sneaker'], ['🧦', 'socks'], ['🏰', 'castle'], ['🎪', 'circus tent'], ['🎠', 'carousel'], ['🎡', 'Ferris wheel'],
    ['🎢', 'roller coaster'], ['⛺', 'tent'],
    // Outside and up in the sky
    ['☀️', 'sun'], ['🌙', 'moon'], ['⭐', 'star'], ['🌎', 'Earth'], ['🪐', 'planet'], ['☄️', 'comet'], ['⚡', 'lightning'],
    ['❄️', 'snowflake'], ['⛄', 'snowman'], ['🌪️', 'tornado'], ['🌊', 'wave'], ['🔥', 'fire'], ['🌷', 'tulip'], ['🌹', 'rose'],
    ['🌵', 'cactus'], ['🌴', 'palm tree'], ['🌳', 'tree'], ['🍁', 'leaf'], ['🍀', 'four-leaf clover'], ['🍄', 'mushroom'],
    ['🐚', 'seashell'], ['🎃', 'jack-o’-lantern'], ['🎄', 'Christmas tree'],
    // Make-believe
    ['🤖', 'robot'], ['👽', 'alien'], ['👻', 'ghost'], ['🧜', 'mermaid'], ['🧚', 'fairy'], ['🧙', 'wizard'], ['🧞', 'genie'],
    ['🦸', 'superhero'], ['🥷', 'ninja'], ['🤠', 'cowboy'], ['🏴‍☠️', 'pirate flag'], ['🦷', 'tooth'],
  ].map(([emoji, name]) => ({ id: emoji, emoji, name })),
];

/** The family edition's names for its characters, by sticker id. */
export const FAMILY_NAMES: Record<string, string> = {
  shooter: 'Peashooter', roller: 'Wall-nut', pest: 'Zombie', pestBig: 'Conehead Zombie',
  hero: 'Pikachu', leafy: 'Bulbasaur', ember: 'Charmander', splash: 'Squirtle', catcher: 'Poké Ball',
  'pup-lead': 'Chase', 'pup-fire': 'Marshall', 'pup-fly': 'Skye', 'pup-dig': 'Rubble',
};
