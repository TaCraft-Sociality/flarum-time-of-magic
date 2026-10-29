export const PREFIX = 'stezkoy-time-of-magic';

export function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function parseJsonArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return [];
}

export function parseCustomConfig(raw) {
  let conf = {};

  if (typeof raw === 'string' && raw) {
    try {
      conf = JSON.parse(raw);
    } catch (e) {
      conf = {};
    }
  } else if (raw && typeof raw === 'object') {
    conf = raw;
  }

  const items = String(conf.items || '');
  let count = parseInt(conf.count, 10);
  if (Number.isNaN(count) || count < 1) count = 20;
  count = Math.min(100, Math.max(1, count));

  return { enabled: !!conf.enabled, items, count };
}

export function normalizeEffects(schedule) {
  return (schedule.effects || []).map((effect) =>
    typeof effect === 'string' ? { name: effect, density: null } : effect
  );
}

export function isDarkTheme() {
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    const body = document.body;

    if (
      html.classList.contains('cc--darkmode') ||
      html.classList.contains('dark') ||
      html.classList.contains('dark-mode') ||
      html.classList.contains('theme-dark') ||
      (body && (
        body.classList.contains('dark') ||
        body.classList.contains('dark-mode') ||
        body.classList.contains('theme-dark')
      )) ||
      html.getAttribute('data-theme') === 'dark' ||
      (body && body.getAttribute('data-theme') === 'dark')
    ) {
      return true;
    }
  }

  if (typeof app !== 'undefined' && app.session && app.session.user) {
    const prefs = app.session.user.preferences && app.session.user.preferences();
    if (prefs) {
      if (prefs.darkMode !== undefined && prefs.darkMode !== null) return !!prefs.darkMode;
      if (prefs.theme !== undefined && prefs.theme !== null) return prefs.theme === 'dark';
      if (prefs.colorScheme !== undefined && prefs.colorScheme !== null) return prefs.colorScheme === 'dark';
    }
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}

function parseTime(str) {
  const [h, m] = String(str || '00:00').split(':').map(Number);
  const hh = Number.isNaN(h) ? 0 : Math.min(23, Math.max(0, h));
  const mm = Number.isNaN(m) ? 0 : Math.min(59, Math.max(0, m));
  return hh * 60 + mm;
}

function isDailyActive(schedule, now) {
  const start = parseTime(schedule.startTime);
  const end = parseTime(schedule.endTime);

  if (start === end) return true;

  const cur = now.getHours() * 60 + now.getMinutes();

  if (start < end) {
    return cur >= start && cur < end;
  }

  return cur >= start || cur < end;
}

export function isScheduleActive(schedule, now = new Date()) {
  if (!schedule || !schedule.enabled) return false;

  if (schedule.theme && schedule.theme !== 'any') {
    const dark = isDarkTheme();
    if (schedule.theme === 'dark' && !dark) return false;
    if (schedule.theme === 'light' && dark) return false;
  }

  if (schedule.mode === 'daily') {
    return isDailyActive(schedule, now);
  }

  const start = new Date(schedule.start).getTime();
  const end = new Date(schedule.end).getTime();

  return !Number.isNaN(start) && !Number.isNaN(end) && now.getTime() >= start && now.getTime() <= end;
}

export function formatScheduleTime(schedule) {
  if (schedule.mode === 'daily') {
    return `daily ${schedule.startTime || '00:00'} ${schedule.endTime || '23:59'}`;
  }
  return `dates ${schedule.start || ''} ${schedule.end || ''}`;
}