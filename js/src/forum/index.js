import app from 'flarum/common/app';
import { extend } from 'flarum/common/extend';
import Switch from 'flarum/common/components/Switch';
import FieldSet from 'flarum/common/components/FieldSet';
import { PREFIX, capitalize, parseJsonArray, parseCustomConfig, normalizeEffects, isScheduleActive } from '../common';
import { FALLING_EFFECTS, createParticleLayer, renderParticles } from './fallingEffects';
import { forumAttribute, userPreference } from './util';
import { initAmbientEffect } from './ambientEffects';

function effectsDisabled() {
  return !!userPreference('disableEffects');
}

function getSchedules() {
  return parseJsonArray(forumAttribute('timeOfMagicSchedules'));
}

function activeSchedule(kind) {
  return getSchedules().find(
    (s) => isScheduleActive(s) && normalizeEffects(s).some((e) => e.name === kind)
  );
}

function isEffectActive(kind) {
  return !!forumAttribute('timeOfMagic' + capitalize(kind)) || !!activeSchedule(kind);
}

function effectDensity(kind) {
  const schedule = activeSchedule(kind);

  if (schedule) {
    const effect = normalizeEffects(schedule).find((e) => e.name === kind);
    if (effect && effect.density) return effect.density;
  }

  return forumAttribute('timeOfMagic' + capitalize(kind) + 'Density') || 'medium';
}

function getCustomConfig(slot) {
  const raw = forumAttribute('timeOfMagicCustom' + capitalize(slot));
  const cfg = parseCustomConfig(raw);

  const items = cfg.items
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return { ...cfg, items };
}

function initUserSettings() {
  if (!forumAttribute('timeOfMagicAllowUserDisable')) return;

  extend('flarum/forum/components/SettingsPage', 'settingsItems', function (items) {
    items.add(
      'timeOfMagicEffects',
      <FieldSet
        className="Settings-timeOfMagicEffects FieldSet--min"
        label={app.translator.trans(PREFIX + '.forum.effects_section_heading')}
        description={app.translator.trans(PREFIX + '.forum.effects_section_description', {}, true)}
      >
        <Switch
          state={!!(app.session.user && app.session.user.preferences()?.disableEffects)}
          onchange={(value) => {
            app.session.user.savePreferences({ disableEffects: value }).then(() => m.redraw());
          }}
        >
          {app.translator.trans(PREFIX + '.forum.disable_effects_label')}
        </Switch>
      </FieldSet>,
      8
    );

    return items;
  });
}

const activeLayers = {};

function removeLayer(kind) {
  if (activeLayers[kind] && activeLayers[kind].parentNode) {
    activeLayers[kind].parentNode.removeChild(activeLayers[kind]);
  }
  delete activeLayers[kind];
}

function initFallingEffect(kind) {
  const cfg = FALLING_EFFECTS[kind];
  const count = cfg.counts[effectDensity(kind)] || cfg.counts.medium;

  removeLayer(kind);
  activeLayers[kind] = createParticleLayer(cfg.containerId);
  renderParticles(activeLayers[kind], cfg, count);
}

function initCustomEffect(slot) {
  const cfg = getCustomConfig(slot);
  if (!cfg.items.length) return;

  const key = 'custom_' + slot;

  removeLayer(key);
  activeLayers[key] = createParticleLayer('timeofmagic-custom-' + slot);
  renderParticles(
    activeLayers[key],
    {
      className: slot === 'up' ? 'timeofmagic-custom-up' : 'timeofmagic-custom-down',
      items: cfg.items,
      fallDelay: [0, 10],
      fallDuration: slot === 'up' ? [9, 16] : [7, 13],
      swayDelay: [0, 5],
      swayDuration: [2, 5],
      opacity: [0.6, 1],
      fontScale: [0.8, 1.6],
      dualAnimation: true,
    },
    cfg.count
  );
}

function initAmbientWithTracking(kind) {
  if (activeLayers[kind]) return;

  const before = document.body.children.length;
  initAmbientEffect(kind);

  const cls = 'timeofmagic-' + (kind === 'starfield' ? 'stars' : 'fog');

  for (let i = document.body.children.length - 1; i >= before - 1 && i >= 0; i--) {
    const node = document.body.children[i];
    if (node && node.classList && node.classList.contains(cls)) {
      activeLayers[kind] = node;
      return;
    }
  }
}

function syncDynamicEffects() {
  if (effectsDisabled()) return;

  Object.keys(FALLING_EFFECTS).forEach((kind) => {
    const active = isEffectActive(kind);
    if (active && !activeLayers[kind]) {
      initFallingEffect(kind);
    } else if (!active && activeLayers[kind]) {
      removeLayer(kind);
    }
  });

  ['fog', 'starfield'].forEach((kind) => {
    const active = isEffectActive(kind);
    if (active && !activeLayers[kind]) {
      initAmbientWithTracking(kind);
    } else if (!active && activeLayers[kind]) {
      removeLayer(kind);
    }
  });

  ['up', 'down'].forEach((slot) => {
    const key = 'custom_' + slot;
    const active = getCustomConfig(slot).enabled || !!activeSchedule(key);

    if (active && !activeLayers[key]) {
      initCustomEffect(slot);
    } else if (!active && activeLayers[key]) {
      removeLayer(key);
    }
  });
}

app.initializers.add(PREFIX, () => {
  initUserSettings();

  if (effectsDisabled()) return;

  Object.keys(FALLING_EFFECTS).forEach((kind) => {
    if (isEffectActive(kind)) initFallingEffect(kind);
  });

  ['fog', 'starfield'].forEach((kind) => {
    if (isEffectActive(kind)) initAmbientWithTracking(kind);
  });

  ['up', 'down'].forEach((slot) => {
    if (getCustomConfig(slot).enabled || !!activeSchedule('custom_' + slot)) {
      initCustomEffect(slot);
    }
  });

  setInterval(syncDynamicEffects, 60000);

  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncDynamicEffects);
    } catch (e) {
      // ignore
    }
  }
});