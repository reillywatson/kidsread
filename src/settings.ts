// Device-wide settings (shared by all players on this device).

/** Which English the narrator speaks: for now, only what Z is called ("zee" or "zed"). */
export type English = 'us' | 'uk';

export interface DeviceSettings {
  music: boolean;
  sfx: boolean;
  english: English;
}

const KEY = 'kidsread.settings';
const defaults: DeviceSettings = { music: true, sfx: true, english: 'us' };

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
