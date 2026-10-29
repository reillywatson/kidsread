# Kids Read

A phone/tablet reading game for 4–5 year olds: short (~45 second) minigames built on the
UFLI Foundations phonics sequence, with spaced repetition and difficulty that adapts to the child.
Kids never need to read to get around — every instruction is spoken and every button is a picture.

Built with Phaser 4 + TypeScript + Vite. No art or audio files: characters are hand-drawn SVG,
pictures are emoji, speech uses the device's voice, and sound effects are synthesized.

## Running

```sh
npm install
npm run dev        # http://localhost:5173, also on your LAN (open it on a phone/tablet)
npm test           # curriculum + learner model tests
npm run build      # typecheck + production build in dist/
```

Dev shortcut: `/?game=zombies` jumps straight into one minigame
(ids: `zombies suns pikablend pikaspell pupmessage pupmemory monster frog`).

On a phone, add it to the home screen for full-screen landscape play. Recording letter sounds in the
grown-up area needs a secure origin (HTTPS or localhost), so it won't work over plain LAN http.

## The games

| World | Game | Skill (UFLI routine) |
|---|---|---|
| 🌱 Plants vs. Zombies | **Zombie Letters** — hear a sound, zap the zombie holding that letter | Auditory drill (sound → grapheme) |
| 🌱 Plants vs. Zombies | **Sunflower Suns** — hear a word, catch the sun that says it | Word recognition, heart words |
| ⚡ Pokémon | **Poké Catch** — read a word (tap letters for sounds), catch its picture. Before picture words exist: see a letter, catch the picture starting with its sound | Blending / visual drill |
| ⚡ Pokémon | **Poké Spell** — hear a word, build it in sound boxes | Encoding (word work) |
| 🐾 Paw Patrol | **Pup Pad** — read a sentence (“The cat is not big.”), pick the picture | Decodable connected text |
| 🐾 Paw Patrol | **Pup Match** — memory: letter ↔ keyword picture, word ↔ picture, heart word pairs | Letter–sound / word review |
| 👾 Friends | **Letter Monster** — feed it pictures that start with its sound | Initial sound ↔ grapheme |
| 👾 Friends | **Rhyme Frog** — hop to the picture that rhymes | Phonological awareness (no reading) |

The ▶ button plays a mixed session (default 4 games, then a sticker). Tapping a character plays only
that world. Each game has 🏠 (home) and 👂 (hear the instructions again).

## How the learning works

- **Curriculum** — `src/data/curriculum.ts` holds the UFLI-order scope & sequence: graphemes with
  keywords, decodable word lists per lesson, and heart words with their irregular letters marked.
  A test guarantees every word only uses graphemes taught by its lesson. Practice/review lessons are
  folded in, so lesson numbers skip a few (e.g. 5, 10, 11, 19).
- **Spaced repetition** — `src/learner.ts`. Every grapheme, word and heart word is a Leitner item.
  Short early intervals (2 min, 20 min) give spacing within a session; later ones span days.
  A correct answer only promotes an item once it's due; misses drop it back and bring it up again
  soon. Each game asks the learner for items: a few new ones (current lesson first), then due
  reviews, then weaker known items.
- **Difficulty** — each skill has a tier (easy/medium/hard) driven by rolling accuracy. Tiers change
  the number of choices, how similar the distractors are (b/d, cat/cap at the top tier), speed,
  word length and how much scaffolding is given (keyword pictures, auto-named pictures).
- **Lesson advancement** — the child moves to the next lesson when the lesson's new graphemes are
  solid, about half its words are, and its heart words have been read correctly. Kids at the top
  tier move faster. Grown-ups can also move the lesson manually.
- **Scaffolding, not failure** — wrong taps wiggle and fade; after misses the game models the answer
  (e.g. sound-by-sound blending) and the right choice pulses, so every round ends in success.
  Needing help is recorded as “help”, not as a correct answer.

## Grown-up area

Press and hold the 🔒 in the bottom-right of the home screen for two seconds. It shows progress and
the trickiest items, lets you change the lesson, voice, speed and session length, and lets you
**record letter sounds in your own voice** — highly recommended, because computer voices say
isolated sounds badly (“tuh” for /t/, “ah” for both short a and short o).

## Adding a minigame

1. Create `src/games/MyGame.ts` with a `meta` (id, theme, skill, spoken intro, icon, `eligible`)
   and a class extending `BaseGame` that implements `setup()` (scenery) and `run()` (rounds).
2. Use `this.learner.pick(...)` for items, `this.choose(...)` for taps (handles wrong-tap feedback
   and scaffolding), `this.record(...)` / `this.score(...)` for results, and `this.say` /
   `this.letterSound` / `this.tween` / `this.wait` for anything async (they stop when the child
   leaves the game).
3. Add it to `src/games/index.ts`.

## Notes

- The Plants vs. Zombies, Pokémon and Paw Patrol characters are original drawings in those styles,
  meant for personal/family use only. Don't publish or distribute builds that use them.
- Emoji pictures look slightly different on each platform. Pictures are limited to emoji that
  render on most devices (Unicode ≤ 14).
- Progress is stored in the browser's localStorage; recordings are stored in IndexedDB.
