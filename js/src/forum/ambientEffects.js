import { rand } from './util';

function initStarfield() {
  const container = document.createElement('div');
  container.className = 'timeofmagic-layer timeofmagic-stars';
  container.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    star.className = 'timeofmagic-star';
    star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    star.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    const size = rand(1, 3).toFixed(1);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${rand(0, 6).toFixed(2)}s`;
    star.style.animationDuration = `${rand(2, 6).toFixed(2)}s`;
    container.appendChild(star);
  }

  document.body.appendChild(container);
}

function initFog() {
  const container = document.createElement('div');
  container.className = 'timeofmagic-layer timeofmagic-fog';
  container.setAttribute('aria-hidden', 'true');

  for (let i = 0; i < 3; i++) {
    const blob = document.createElement('div');
    blob.className = 'timeofmagic-fog-blob';
    blob.style.top = `${15 + i * 25}%`;
    blob.style.left = `${i * 30 - 10}%`;
    blob.style.animationDelay = `${(-i * 12).toFixed(0)}s`;
    container.appendChild(blob);
  }

  document.body.appendChild(container);
}

export function initAmbientEffect(kind) {
  if (kind === 'starfield') initStarfield();
  if (kind === 'fog') initFog();
}