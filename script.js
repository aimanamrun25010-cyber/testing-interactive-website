'use strict';

/* ============================================================
   ✨ CUSTOMIZE YOUR WEBSITE HERE ✨
   1) Set sheetsWebAppUrl after following README.md.
   2) Change the restaurantNames for your four meal choices.
   3) Replace the three photos in /assets (see README.md).
   ============================================================ */
const CONFIG = {
  sheetsWebAppUrl: 'https://script.google.com/macros/s/AKfycbyuBCupointfJ3xJVecdAEjboUUrI1TVmaPJirp2-eyVA0hwvEanm9ZFMqOH2ifw4QC/exec',
  restaurantNames: {
    western: 'Kedai western pilihan kita',
    'masakan panas': 'Kedai masakan panas pilihan kita',
    cafe: 'Cafe pilihan kita',
    burger: 'Kedai burger pilihan kita',
  },
  messageDelayMs: 660,
  finalPlayDurationMs: 10000,  // 10 seconds of standing / kiss animation
  photoFlipMs: 750,           // switch between standing and kissing every 0.75 sec
};

const state = {
  currentScene: 1,
  flowToken: 0,
  busy: false,
  startedAt: new Date().toISOString(),
  sessionId: getSessionId(),
  dinnerAccepted: false,
  mealChoice: '',
  clothingChoice: '',
  clothingColor: '',
  loveReply: '',
  submissionStarted: false,
  finalInterval: null,
  finalTimer: null,
};

const $ = (selector) => document.querySelector(selector);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getSessionId() {
  const key = 'cinta-hati-story-session-id';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `date-night-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch (_) {
    return `date-night-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function generateStars() {
  const container = $('#stars');
  const count = window.innerWidth < 650 ? 45 : 85;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement('span');
    star.className = 'star';
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.width = `${1 + Math.random() * 2.3}px`;
    star.style.height = star.style.width;
    star.style.animationDelay = `${Math.random() * 4}s`;
    star.style.animationDuration = `${1.4 + Math.random() * 3}s`;
    container.appendChild(star);
  }
}

function initializePhotos() {
  // Until you add the photographs, friendly placeholders remain visible.
  ['portrait', 'standing', 'kiss'].forEach((name) => {
    const img = $(`#${name}Image`);
    const frame = $(`#${name}Frame`);
    const reveal = () => {
      if (img.naturalWidth > 0) frame.classList.add('has-image');
    };
    img.addEventListener('load', reveal);
    img.addEventListener('error', () => frame.classList.remove('has-image'));
    if (img.complete) reveal();
  });
}

function cleanupRunawayButtons() {
  document.querySelectorAll('.choice-btn--floating').forEach((button) => button.remove());
}

function changeScene(sceneNumber) {
  state.flowToken += 1;
  state.busy = false;
  cleanupRunawayButtons();
  state.currentScene = sceneNumber;
  document.body.dataset.scene = String(sceneNumber);

  document.querySelectorAll('.scene').forEach((section) => {
    const shouldShow = section.id === `scene${sceneNumber}`;
    section.classList.toggle('active', shouldShow);
    section.setAttribute('aria-hidden', String(!shouldShow));
    if (shouldShow) section.scrollTop = 0;
  });
}

function messagesFor(scene) { return $(`#messages${scene}`); }
function choicesFor(scene) { return $(`#choices${scene}`); }

function addMessage(scene, text, from = 'them') {
  const container = messagesFor(scene);
  if (!container) return;
  const row = document.createElement('div');
  row.className = `message message--${from}`;
  const icon = document.createElement('span');
  icon.className = 'message-avatar';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = from === 'them' ? '♥' : '✿';
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text; // textContent protects custom colour input from HTML injection
  row.append(icon, bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

function showTyping(scene) {
  const container = messagesFor(scene);
  const row = document.createElement('div');
  row.className = 'message message--them message--typing';
  const icon = document.createElement('span');
  icon.className = 'message-avatar';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = '♥';
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.setAttribute('aria-label', 'Sedang menaip');
  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'typing-dot';
    bubble.appendChild(dot);
  }
  row.append(icon, bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

async function say(scene, text, token, pause = CONFIG.messageDelayMs) {
  if (token !== state.flowToken || state.currentScene !== scene) return false;
  const indicator = showTyping(scene);
  await wait(pause);
  indicator.remove();
  if (token !== state.flowToken || state.currentScene !== scene) return false;
  addMessage(scene, text, 'them');
  await wait(240);
  return token === state.flowToken && state.currentScene === scene;
}

function clearChoices(scene) {
  cleanupRunawayButtons();
  choicesFor(scene).replaceChildren();
}

function drawChoices(scene, choices, onChoose) {
  const container = choicesFor(scene);
  container.replaceChildren();
  for (const option of choices) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice-btn';
    button.textContent = option.label;
    if (option.primary) button.classList.add('choice-btn--primary');
    if (option.runaway) {
      button.classList.add('choice-btn--runaway');
      giveButtonEscapePower(button);
    } else {
      button.addEventListener('click', () => {
        if (state.busy || state.currentScene !== scene) return;
        state.busy = true;
        clearChoices(scene);
        onChoose(option.value, option.label);
      });
    }
    container.appendChild(button);
  }
}

/* The “Tak nak” button really glides around the ENTIRE screen.
   It evades a mouse hover, a touch, a stylus, or keyboard focus. */
function giveButtonEscapePower(button) {
  let escapedToBody = false;
  let lastMovedAt = 0;
  let moves = 0;

  function escape(event) {
    if (event && event.cancelable) event.preventDefault();
    if (Date.now() - lastMovedAt < 170) return;
    lastMovedAt = Date.now();

    if (!escapedToBody) {
      const box = button.getBoundingClientRect();
      button.style.left = `${box.left}px`;
      button.style.top = `${box.top}px`;
      button.style.width = `${box.width}px`;
      button.style.height = `${box.height}px`;
      button.classList.add('choice-btn--floating');
      document.body.appendChild(button);
      escapedToBody = true;
    }

    // Use the full viewport while keeping the moving button on-screen.
    const width = button.offsetWidth || 110;
    const height = button.offsetHeight || 48;
    const margin = 14;
    const maxX = Math.max(margin, window.innerWidth - width - margin);
    const maxY = Math.max(margin, window.innerHeight - height - margin);
    let x = margin + Math.random() * Math.max(0, maxX - margin);
    let y = margin + Math.random() * Math.max(0, maxY - margin);
    moves += 1;
    // Alternate sides so the dodge is much more noticeable.
    if (moves % 2 === 0) x = margin + Math.random() * Math.max(0, maxX * .3);
    else x = maxX - Math.random() * Math.max(0, maxX * .35);
    requestAnimationFrame(() => {
      button.style.left = `${Math.round(x)}px`;
      button.style.top = `${Math.round(y)}px`;
    });
  }
  button.addEventListener('pointerenter', escape);
  button.addEventListener('pointerdown', escape);
  button.addEventListener('touchstart', escape, { passive: false });
  button.addEventListener('focus', escape);
  button.addEventListener('click', (e) => { e.preventDefault(); escape(e); });
}

/* ======================== SCENE 2 ======================== */
async function beginScene2() {
  const token = state.flowToken;
  if (!await say(2, 'Assalamualaikum cinta hati saya 🥺💗', token)) return;
  drawChoices(2, [{ label: 'Waalaikummussalam 💕', value: 'salam', primary: true }], async () => {
    addMessage(2, 'Waalaikummussalam 💕', 'you');
    const current = state.flowToken;
    if (!await say(2, 'Sayang sihat?', current)) return;
    state.busy = false;
    drawChoices(2, [{ label: 'Sihat! 💗', value: 'sihat', primary: true }], async () => {
      addMessage(2, 'Sihat! 💗', 'you');
      const now = state.flowToken;
      if (!await say(2, 'Jom kita makan malam ni sayang. Nak? 🥰', now)) return;
      state.busy = false;
      drawChoices(2, [
        { label: 'Nakkk! 💖', value: 'nak', primary: true },
        { label: 'Tak nak 🙈', value: 'tak', runaway: true },
      ], async () => {
        state.dinnerAccepted = true;
        addMessage(2, 'Nakkk! 💖', 'you');
        const finalToken = state.flowToken;
        if (!await say(2, 'Yeayyy!!! 💗✨', finalToken, 450)) return;
        await wait(760);
        if (finalToken !== state.flowToken) return;
        changeScene(3);
        beginScene3();
      });
    });
  });
}

/* ======================== SCENE 3 ======================== */
async function beginScene3() {
  const token = state.flowToken;
  if (!await say(3, 'Disebabkan harini hari special sayang, kita makan and lepak okayy 💕', token)) return;
  if (!await say(3, 'Tapi tak boleh lama-lama, esok kita nak gi Games On pulak 🎮', token)) return;
  if (!await say(3, 'Sayang prefer nak makan apa? 🍽️', token)) return;
  state.busy = false;
  drawChoices(3, [
    { label: '🥩 Western', value: 'western' },
    { label: '🍲 Masakan panas', value: 'masakan panas' },
    { label: '☕ Cafe', value: 'cafe' },
    { label: '🍔 Burger', value: 'burger' },
  ], async (value, label) => {
    state.mealChoice = value;
    addMessage(3, label, 'you');
    const now = state.flowToken;
    if (!await say(3, 'Kalau macam tu jom kita pergi kedai ni! 🥰', now)) return;
    $('#placeName').textContent = CONFIG.restaurantNames[value] || 'Tempat makan pilihan kita';
    $('#placeCard').hidden = false;
    await wait(340);
    if (now !== state.flowToken) return;
    state.busy = false;
    drawChoices(3, [{ label: 'Jommm! 💞', value: 'jom', primary: true }], () => {
      addMessage(3, 'Jommm! 💞', 'you');
      changeScene(4);
      beginScene4();
    });
  });
}

/* ======================== SCENE 4 ======================== */
async function beginScene4() {
  const token = state.flowToken;
  if (!await say(4, 'Haa, before that saya kena matching sayang. Baru sweet couple orang bilang. Hehehe 🥹💕', token)) return;
  if (!await say(4, 'Sayang pakai warna apa tonight? 👕', token)) return;
  state.busy = false;
  drawChoices(4, [
    { label: '💚 Hijau', value: 'hijau' },
    { label: '🤍 Putih', value: 'putih' },
    { label: '🖤 Hitam', value: 'hitam' },
    { label: '🎨 Other', value: 'other' },
  ], (value, label) => {
    if (value === 'other') {
      const form = $('#otherColorForm');
      form.hidden = false;
      state.busy = false;
      $('#otherColorInput').focus();
      return;
    }
    completeColorSelection(value, value, label);
  });
}

async function completeColorSelection(choice, color, displayLabel = color) {
  if (state.currentScene !== 4 || state.clothingColor) return;
  state.busy = true;
  $('#otherColorForm').hidden = true;
  state.clothingChoice = choice;
  state.clothingColor = color;
  addMessage(4, displayLabel, 'you');
  const token = state.flowToken;
  if (!await say(4, `Yeayyy, sama laa! Saya pun fikir nak pakai warna ${color} 😍`, token)) return;
  if (!await say(4, 'Yeayyy, tak sabarnyaa nak jumpa babyy saya! 💗', token)) return;
  if (!await say(4, 'See you tonight babyy, I love youu 🥹💖', token)) return;
  state.busy = false;
  drawChoices(4, [
    { label: 'I love you more si kacak 😘', value: 'love', primary: true },
    { label: 'Tak nak 🙈', value: 'tak', runaway: true },
  ], () => {
    state.loveReply = 'I love you more si kacak';
    addMessage(4, 'I love you more si kacak 😘', 'you');
    saveAnswers(); // Send answers before Scene 5 begins.
    changeScene(5);
    beginScene5();
  });
}

/* ======================== SCENE 5 ======================== */
function popKiss() {
  const container = $('#kissHearts');
  const heart = document.createElement('span');
  heart.className = 'floating-kiss';
  heart.textContent = Math.random() > .4 ? '💋' : '💗';
  heart.style.left = `${39 + Math.random() * 35}%`;
  heart.style.top = `${24 + Math.random() * 42}%`;
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 1500);
}

function beginScene5() {
  const standing = $('#standingFrame');
  const kissing = $('#kissFrame');
  const black = $('#blackFade');
  black.classList.remove('is-black');
  standing.classList.add('is-visible');
  kissing.classList.remove('is-visible');
  let onKiss = false;
  clearInterval(state.finalInterval);
  clearTimeout(state.finalTimer);
  state.finalInterval = setInterval(() => {
    onKiss = !onKiss;
    standing.classList.toggle('is-visible', !onKiss);
    kissing.classList.toggle('is-visible', onKiss);
    if (onKiss) popKiss();
  }, CONFIG.photoFlipMs);
  state.finalTimer = setTimeout(() => {
    clearInterval(state.finalInterval);
    black.classList.add('is-black'); // Smooth 2.15-second fade to full black
  }, CONFIG.finalPlayDurationMs);
}

/* ===================== ANSWER COLLECTION =====================
   A website on GitHub Pages cannot write directly to a private local
   Excel workbook. Google Apps Script appends each visit to Google
   Sheets; the owner can then export the Sheet as an .xlsx file.
   The external endpoint MUST be configured before this works.
   ============================================================ */
function saveAnswers() {
  if (state.submissionStarted) return;
  state.submissionStarted = true;

  const payload = {
    sessionId: state.sessionId,
    startedAt: state.startedAt,
    submittedAt: new Date().toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    dinnerAccepted: state.dinnerAccepted ? 'Ya' : 'Tidak',
    mealChoice: state.mealChoice,
    clothingChoice: state.clothingChoice,
    clothingColor: state.clothingColor,
    loveReply: state.loveReply,
  };

  const url = CONFIG.sheetsWebAppUrl.trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url)) {
    console.info('💗 Answers collected in this session, but NOT uploaded. Add your Google Apps Script Web App URL in script.js.');
    console.table(payload);
    return;
  }

  // Apps Script public web-app endpoints use redirects; no-cors avoids a
  // browser CORS error, but the opaque response cannot confirm delivery.
  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((error) => {
    console.error('Could not submit answers. Check internet + Apps Script settings:', error);
  });
}

/* ====================== INITIALIZATION ====================== */
document.addEventListener('DOMContentLoaded', () => {
  generateStars();
  initializePhotos();

  $('#heartEnter').addEventListener('click', () => {
    if (state.currentScene !== 1) return;
    changeScene(2);
    beginScene2();
  });

  $('#otherColorForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const color = $('#otherColorInput').value.trim().replace(/\s+/g, ' ').slice(0, 35);
    if (!color) {
      $('#otherColorInput').focus();
      return;
    }
    completeColorSelection('other', color, `🎨 ${color}`);
  });
});
