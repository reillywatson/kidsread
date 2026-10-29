// Device-wide settings (shared by all players on this device).

export interface DeviceSettings {
  music: boolean;
  sfx: boolean;
  /** Fallback speech-synthesis voice, used only for phrases without a recording. */
  voice: string;
  rate: number;
}

const KEY = 'kidsread.settings';
const defaults: DeviceSettings = { music: true, sfx: true, voice: '', rate: 0.9 };

function load(): DeviceSettings {
  try { return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...defaults }; }
}

export const settings: DeviceSettings = typeof localStorage === 'undefined' ? { ...defaults } : load();
const listeners = new Set<() => void>();

export function updateSettings(patch: Partial<DeviceSettings>) {
  Object.assign(settings, patch);
  try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* storage blocked */ }
  listeners.forEach(fn => fn());
}

export function onSettingsChange(fn: () => void) { listeners.add(fn); }
