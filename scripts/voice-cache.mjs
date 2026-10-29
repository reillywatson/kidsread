// Local cache of raw narrator recordings from ElevenLabs (voice-cache/, git-ignored), keyed by
// voice, model and exact text — so processing can be redone without paying for audio twice.
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EL_VOICE = process.env.ELEVEN_VOICE || 'FGY2WhTYpPnrIDTdsKH5'; // Laura
export const EL_MODEL = process.env.ELEVEN_MODEL || 'eleven_v4';
export const LABEL = `elevenlabs/${EL_VOICE}/${EL_MODEL}`;
export const CACHE = join(dirname(fileURLToPath(import.meta.url)), '..', 'voice-cache');

export const cachePath = (text, voice = EL_VOICE, model = EL_MODEL) =>
  join(CACHE, createHash('sha1').update(`elevenlabs/${voice}/${model}|${text}`).digest('hex') + '.mp3');
