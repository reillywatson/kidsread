// Device-wide settings (shared by all players on this device).

export interface DeviceSettings {
  music: boolean;
  sfx: boolean;
}

const KEY = 'kidsread.settings';
const defaults: DeviceSettings = { music: true, sfx: true };

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
