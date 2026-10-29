# Kids Read

A phone/tablet reading game for 4–5 year olds: short (~45 second) minigames built on the
UFLI Foundations phonics sequence, with spaced repetition and difficulty that adapts to each child.
Kids never need to read to get around — every instruction is spoken and every button is a picture.

Built with Phaser 4 + TypeScript + Vite. Characters are SVG drawings, pictures are emoji, speech is
pre-recorded at build time, and music and sound effects are synthesized live.

## Running

```sh
npm install
npm run dev        # http://localhost:5173, also on your LAN (open it on a phone/tablet)
npm test           # curriculum, learner model, game logic, voice coverage
npm run build      # typecheck + production build in dist/
npm run voice      # re-record speech (macOS only; see below)
```

Dev shortcut: `/?game=zombies` jumps straight into one minigame as the first player.

On a phone, add it to the home screen for full-screen landscape play. Recording letter sounds in the
grown-up area needs a secure origin (HTTPS or localhost), so it won't work over plain LAN http.

## Players

At startup each child taps their picture (or **+** to make a new player and pick an avatar).
Every player has their own lesson, spaced-repetition history, stars and stickers. Tap your avatar on
the home screen to switch players. Grown-ups can name, re-picture or delete players.

## The games

| World | Game | Skill (UFLI routine) |
|---|---|---|
| 🌱 Plants vs. Zombies | **Zombie Letters** — hear a sound, zap the zombie holding that letter | Auditory drill (sound → grapheme) |
| 🌱 Plants vs. Zombies | **Sunflower Suns** — hear a word, catch the sun that says it | Word recognition, heart words |
| 🌱 Plants vs. Zombies | **Garden Sort** — read a word, plant it in the pot with its vowel | Short-vowel discrimination |
| ⚡ Pokémon | **Poké Catch** — read a word (tap letters for sounds), catch its picture. Before picture words exist: see a letter, catch the picture starting with its sound | Blending / visual drill |
| ⚡ Pokémon | **Poké Spell** — hear a word, build it in sound boxes | Encoding (word work) |
| ⚡ Pokémon | **Poké Evolve** — “this says cat, now make it say hat”: swap one letter | Word chains |
| 🐾 Paw Patrol | **Pup Pad** — read a sentence (“The cat is not big.”), pick the picture | Decodable connected text |
| 🐾 Paw Patrol | **Pup Match** — memory: letter ↔ keyword picture, word ↔ picture, heart word pairs | Letter–sound / word review |
| 🐾 Paw Patrol | **Rubble's Bones** — give Rubble one bone per sound in a word | Phonemic segmentation (no reading) |
| 👾 Friends | **Letter Monster** — feed it pictures that start with its sound | Initial sound ↔ grapheme |
| 👾 Friends | **Rhyme Frog** — hop to the picture that rhymes | Phonological awareness (no reading) |
| 👾 Friends | **Bubble Pop** — pop every bubble with the sound you hear | Auditory drill, fast |

The ▶ button plays a mixed session (default 4 games, then a sticker). Tapping a character plays only
that world. Each game has 🏠 (home) and 👂 (hear the instructions again). ⚙️ on the home screen has
big picture toggles for music and sound effects.

## Voice

All speech is pre-recorded by `npm run voice` (macOS `say` + `afconvert`) into `public/voice/`,
so it sounds identical on every phone. The script uses the best installed English voice, preferring
**Premium** or **Enhanced** voices — install one in *System Settings → Accessibility → Spoken Content
→ System Voice → Manage Voices* (e.g. “Ava (Premium)” or “Zoe (Premium)”) and re-run
`npm run voice -- --force` for a much more natural voice. `VOICE="Name" npm run voice` picks one explicitly.

Isolated letter sounds are the hard part — speech engines say “tuh” for /t/. The script builds each
sound from real speech and checks it automatically: short vowels are cut from words (/æ/ from “at”),
fricatives from word onsets (/f/ from “fun”, stretched), stops are clipped to the burst, and held
sounds (/m/, /s/) are only accepted if they come out as one continuous sound. Check them in the
grown-up area (▶ next to each sound) and **record your own** for any that sound off — your
recording replaces the built-in one.

Character lines are the narrator's recordings pitched up or down (squeaky Pikachu, groaning zombies).
Anything without a recording falls back to the device's speech synthesis. A test fails if a phrase
or word is missing a recording, so add new phrases to `src/lines.ts` and re-run `npm run voice`.

## Art

Characters and scenes are SVG drawings in `src/art/` (Pokémon, Plants vs. Zombies, Paw Patrol and
the unbranded friends), rasterized at load. They're cel-shaded with `cel()` in `src/art/util.ts`:
each shape gets a crisp shadow crescent and highlight inside its outline. Characters that have an
eyes-shut frame (generated automatically with `withBlink`) blink on their own wherever they appear.

Browse everything at **/art.html** while `npm run dev` is running.

To use your own images instead, drop a PNG/WebP/JPG into `src/assets/art/` named after the texture
key — `pikachu.png`, `pup-chase.png`, `zombie.png`, `bgLawn.jpg`, … (see `TEXTURES` in
`src/art/index.ts`). It replaces the drawing everywhere.

## How the learning works

- **Curriculum** — `src/data/curriculum.ts` holds the UFLI-order scope & sequence: graphemes with
  keywords, decodable word lists per lesson, and heart words with their irregular letters marked.
  A test guarantees every word only uses graphemes taught by its lesson.
- **Spaced repetition** — `src/learner.ts`. Every grapheme, word and heart word is a Leitner item.
  Short early intervals (2 min, 20 min) give spacing within a session; later ones span days.
  A correct answer only promotes an item once it's due; misses bring it back soon. Each game asks
  for a few new items (current lesson first), then due reviews, then weaker known items.
- **Difficulty** — each skill has a tier (easy/medium/hard) driven by rolling accuracy, changing the
  number of choices, distractor similarity (b/d, cat/cap), speed, word length and scaffolding.
- **Lesson advancement** — automatic once the lesson's new graphemes are solid, about half its words
  are, and its heart words have been read correctly. Grown-ups can also change it.
- **Scaffolding, not failure** — wrong taps wiggle and fade; after misses the game models the answer
  and the right choice pulses, so every round ends in success. Needing help isn't counted as correct.

## Grown-up area

Press and hold the 🔒 in the bottom-right of the home screen for two seconds: players, progress and
trickiest items, lesson, music/sound settings, session length, and letter-sound playback/recording.

## Adding a minigame

1. Create `src/games/MyGame.ts` with a `meta` (id, theme, skill, intro from `LINES.intro`, icon,
   `eligible`) and a class extending `BaseGame` implementing `setup()` and `run()`.
2. Use `this.learner.pick(...)` for items, `this.choose(...)` for taps (wrong-tap feedback and
   scaffolding built in), `this.record(...)` / `this.score(...)` for results, and `this.say` /
   `this.letterSound` / `this.tween` / `this.wait` for anything async (they stop when the child leaves).
3. Put any new phrases in `src/lines.ts`, run `npm run voice`, and add the game to `src/games/index.ts`.

## Notes

- The Plants vs. Zombies, Pokémon and Paw Patrol characters are original drawings in those styles,
  meant for personal/family use only. Don't publish or distribute builds that use them.
- Progress is stored per player in localStorage; recordings are stored in IndexedDB.
