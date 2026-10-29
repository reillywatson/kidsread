// Player profiles. Each profile has its own learner progress; device settings and
// recorded letter sounds are shared.
import { Learner, type Storage, type LearnerState } from './learner';

export interface Profile { id: string; avatar: string; name: string; created: number; lastPlayed: number }

const INDEX = 'kidsread.profiles';
const LEGACY = 'kidsread.v1';
const key = (id: string) => `kidsread.p.${id}`;

function readJSON<T>(k: string): T | null {
  try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; }
}
function writeJSON(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
}

export function profileStorage(id: string): Storage {
  return { get: () => readJSON<Partial<LearnerState>>(key(id)), set: v => writeJSON(key(id), v) };
}

export function profiles(): Profile[] {
  const list = readJSON<Profile[]>(INDEX);
  if (list) return list;
  // First run after profiles were added: keep any existing progress as the first player.
  const legacy = readJSON<Partial<LearnerState>>(LEGACY);
  if (legacy) {
    const p = newProfile('pikachu');
    writeJSON(key(p.id), legacy);
    writeJSON(INDEX, [p]);
    localStorage.removeItem(LEGACY);
    return [p];
  }
  return [];
}

function newProfile(avatar: string): Profile {
  const now = Date.now();
  return { id: now.toString(36) + Math.random().toString(36).slice(2, 6), avatar, name: '', created: now, lastPlayed: now };
}

function saveIndex(list: Profile[]) { writeJSON(INDEX, list); }

export function createProfile(avatar: string): Profile {
  const p = newProfile(avatar);
  saveIndex([...profiles(), p]);
  return p;
}

export function updateProfile(id: string, patch: Partial<Pick<Profile, 'name' | 'avatar'>>) {
  saveIndex(profiles().map(p => (p.id === id ? { ...p, ...patch } : p)));
  if (profile?.id === id) profile = { ...profile, ...patch };
}

export function deleteProfile(id: string) {
  saveIndex(profiles().filter(p => p.id !== id));
  try { localStorage.removeItem(key(id)); } catch { /* blocked */ }
  if (profile?.id === id) { profile = null; learner = new Learner(memoryStorage()); }
}

const memoryStorage = (): Storage => { let v: LearnerState | null = null; return { get: () => v, set: s => { v = s; } }; };

/** The active player. Until one is chosen, progress goes nowhere. */
export let profile: Profile | null = null;
export let learner: Learner = new Learner(memoryStorage());

export function selectProfile(id: string) {
  const p = profiles().find(x => x.id === id);
  if (!p) return;
  saveIndex(profiles().map(x => (x.id === id ? { ...x, lastPlayed: Date.now() } : x)));
  profile = p;
  learner = new Learner(profileStorage(id));
}
