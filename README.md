# Kids Read

A phone/tablet reading game for 4–5 year olds: short (~45 second) minigames built on the
UFLI Foundations phonics sequence, with spaced repetition and difficulty that adapts to each child.
Kids never need to read to get around — every instruction is spoken and every button is a picture.

Built with Phaser 4 + TypeScript + Vite. Characters are SVG drawings, pictures are emoji, speech is
pre-recorded at build time, and music (plucked strings, marimba, soft pads, room reverb) and sound
effects are synthesized live.

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

**Bonus games** are just for fun and can't be picked directly: about a third of sessions (and at
least every third session) slip one in after the first game, announced with a big “BONUS!”.

| World | Bonus game |
|---|---|
| 🌱 Plants vs. Zombies | **Wall-nut Bowling** — tap a lane to bowl over the zombies |
| ⚡ Pokémon | **Poké Pop-up** — catch Pokémon popping out of the tall grass |
| 🐾 Paw Patrol | **Treat Catch** — move the pup to catch falling treats |
| 👾 Friends | **Balloon Party** — pop balloons; gold star balloons are worth extra |

The ▶ button plays a mixed session (default 4 games, then a sticker). Tapping a character plays only
that world. Each game has 🏠 (home) and 👂 (hear the instructions again). ⚙️ on the home screen has
big picture toggles for music and sound effects.

## Voice

All speech is pre-recorded by `npm run voice` into `public/voice/`, so it sounds identical on
every phone. The narrator is **Laura** on ElevenLabs' **eleven_v4** model, used whenever
`ELEVENLABS_KEY` is set:

```sh
npm run voice -- --dry     # what would be recorded and roughly how many characters (no API calls)
npm run voice              # record anything new or changed (cached by exact text, voice and model)
npm run voice -- --force   # re-record everything
npm run voice -- --say     # use macOS voices instead (no key needed)
```

Each kind of line gets its own delivery via v4 audio tags (in `scripts/voice.mjs`): praise and
rewards `[excited]`, game intros `[cheerfully]`, instructions `[warmly]`, character lines in
character (squeaky Pikachu, groaning zombies), and single words plain for clarity. Run it from your
own terminal: ElevenLabs flags requests that arrive through proxies, and the free tier allows only
two requests at a time (the script respects that and retries when rate-limited).

Listen to every clip at **/voices.html** while `npm run dev` is running: letter sounds, every phrase
(grouped by where it's used, with the exact text sent), and every word, with play-all and search.

`scripts/voice-samples.mjs` builds a side-by-side comparison page of candidate voices and models in
`voice-samples/` (git-ignored) — handy if you want to try a different narrator.

Isolated letter sounds are the hard part — speech engines say “tuh” for /t/. The script builds each
sound from real speech and checks it automatically: short vowels are cut from words (/æ/ from “at”),
fricatives from word onsets (/f/ from “fun”, stretched), stops are clipped to the burst, and held
sounds (/m/, /s/) are only accepted if they come out as one continuous sound (otherwise it falls back
to the macOS voice and says so). Check them in the grown-up area (▶ next to each sound) and **record
your own** for any that sound off — your recording replaces the built-in one.

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
