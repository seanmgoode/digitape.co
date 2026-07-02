const profiles = {
  rx241: {
    title: 'RX 2.41 Simulator',
    subtitle: '450 x 600 AMOLED layout mirror',
    firmware: 'RX 2.41 AMOLED 3.3.5',
    width: 450,
    height: 600,
    layout: {
      distanceTop: 212,
      distanceHeight: 128,
      distanceGap: 12,
      numberYOffset: 12,
      feetWidth: 96,
      inchWidth: 96,
      statusTop: 342,
      bottomY: 44,
      signalRight: 202,
      wifiRight: 132,
      batteryRight: 18,
      iconTop: 24,
      route: { x: 22, y: 22, w: 84, h: 48 },
      bottom: { marginX: 24, gap: 18, h: 50 },
      menu: { w: 94, h: 92 },
    },
  },
  mini18: {
    title: 'MiniRx Simulator',
    subtitle: '368 x 448 MiniRx 1.8 layout mirror',
    firmware: 'MiniRx 1.8 3.3.6',
    width: 368,
    height: 448,
    layout: {
      distanceTop: 136,
      distanceHeight: 128,
      distanceGap: 12,
      numberYOffset: 12,
      feetWidth: 84,
      inchWidth: 84,
      statusTop: 254,
      bottomY: 50,
      signalRight: 204,
      wifiRight: 116,
      batteryRight: 18,
      iconTop: 28,
      route: { x: 28, y: 28, w: 72, h: 42 },
      bottom: { marginX: 14, gap: 10, h: 42 },
      menu: { w: 82, h: 74 },
    },
  },
};

let activeProfileId = 'rx241';

const defaults = {
  screen: 'home',
  distance: `5' 10"`,
  route: 'TX',
  status: 'Live',
  offset: '0"',
  mode: 'NORMAL',
  theme: 'white',
  connected: true,
  rssi: -42,
  wifi: true,
  powerSource: 'USB',
  battery: 74,
  scale: 1,
  layout: { ...profiles.rx241.layout },
  scans: 1,
};
let state = { ...defaults };

const $ = (id) => document.getElementById(id);
const pageEls = [...document.querySelectorAll('.page')];
const controlIds = [
  'distanceInput','routeInput','statusInput','offsetInput','modeInput','themeInput',
  'connectedInput','rssiInput','wifiInput','powerSourceInput','batteryInput','scaleInput',
  'distanceTopInput','distanceHeightInput','distanceGapInput','numberYOffsetInput','feetWidthInput','inchWidthInput',
  'statusTopInput','bottomYInput','signalRightInput','wifiRightInput','batteryRightInput','iconTopInput'
];
const modes = ['FAST', 'NORMAL', 'SMOOTH', 'SLOW'];
let effectiveScale = defaults.scale;

function setControlValue(id, value) {
  const el = $(id);
  if (el) el.value = value;
}

function controlValue(id, fallback) {
  const el = $(id);
  return el ? el.value : fallback;
}

function offsetToNumber(offsetText) {
  const parsed = Number(String(offsetText).replace('"', ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatOffset(value) {
  if (value === 0) return '0"';
  return `${value > 0 ? '+' : ''}${value}"`;
}

function parseDistance(text) {
  const match = String(text).match(/^\s*([^']*)'\s*([^\"]*)\"?\s*$/);
  if (!match) return { feet: '--', inches: '--' };
  return { feet: match[1].trim() || '--', inches: match[2].trim() || '--' };
}

function barsFromRssi(rssi, connected) {
  if (!connected && rssi <= -120) return 0;
  if (rssi >= -58) return 4;
  if (rssi >= -68) return 3;
  if (rssi >= -80) return 2;
  return 1;
}

function live() {
  return Boolean(state.connected);
}

function activeProfile() {
  return profiles[activeProfileId];
}

function cloneLayout(layout) {
  return {
    ...layout,
    route: { ...layout.route },
    bottom: { ...layout.bottom },
    menu: { ...layout.menu },
  };
}

function syncControls() {
  setControlValue('distanceInput', state.distance);
  setControlValue('routeInput', state.route);
  setControlValue('statusInput', state.status);
  setControlValue('offsetInput', state.offset);
  setControlValue('modeInput', state.mode);
  setControlValue('themeInput', state.theme);
  setControlValue('connectedInput', String(state.connected));
  setControlValue('rssiInput', state.rssi);
  setControlValue('wifiInput', String(state.wifi));
  setControlValue('powerSourceInput', state.powerSource);
  setControlValue('batteryInput', state.battery);
  setControlValue('scaleInput', state.scale);
  Object.entries(state.layout).forEach(([key, value]) => {
    if (value && typeof value === 'object') return;
    const input = $(`${key}Input`);
    const output = $(`${key}Value`);
    if (input) input.value = value;
    if (output) output.textContent = value;
  });
}

function renderSignalBars() {
  const signalBars = $('signalBars');
  signalBars.innerHTML = '';
  const bars = barsFromRssi(Number(state.rssi), state.connected);
  for (let i = 0; i < 4; i += 1) {
    const bar = document.createElement('div');
    bar.className = `bar ${i < bars ? 'on' : ''}`;
    bar.style.right = `${state.layout.signalRight - i * 15}px`;
    bar.style.top = `${state.layout.iconTop + 28 - i * 8}px`;
    bar.style.height = `${12 + i * 8}px`;
    signalBars.appendChild(bar);
  }
}

function renderPages() {
  pageEls.forEach((page) => page.classList.toggle('active', page.dataset.page === state.screen));
  $('screen').dataset.screen = state.screen;
}

function applyLayout() {
  const profile = activeProfile();
  const l = state.layout;
  document.documentElement.style.setProperty('--screen-w', `${profile.width}px`);
  document.documentElement.style.setProperty('--screen-h', `${profile.height}px`);
  $('simTitle').textContent = profile.title;
  $('simSubtitle').textContent = profile.subtitle;
  $('screen').classList.toggle('is-mini', activeProfileId === 'mini18');
  $('screen').classList.toggle('is-rx241', activeProfileId === 'rx241');
  $('screen').setAttribute('aria-label', `Simulated ${profile.title}`);
  document.querySelectorAll('.sim-tab').forEach((tab) => {
    const active = tab.dataset.profile === activeProfileId;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  $('txPill').style.left = `${l.route.x}px`;
  $('txPill').style.top = `${l.route.y}px`;
  $('txPill').style.width = `${l.route.w}px`;
  $('txPill').style.height = `${l.route.h}px`;
  const distance = document.querySelector('.distance-readout');
  distance.style.width = `${profile.width}px`;
  distance.style.top = `${l.distanceTop}px`;
  distance.style.height = `${l.distanceHeight}px`;
  distance.style.gap = `${l.distanceGap}px`;
  document.querySelectorAll('.feet-number, .inch-number').forEach((el) => { el.style.paddingTop = `${l.numberYOffset}px`; });
  $('feetNumber').style.width = `${l.feetWidth}px`;
  $('inchNumber').style.width = `${l.inchWidth}px`;
  $('statusLine').style.width = `${profile.width}px`;
  $('statusLine').style.top = `${l.statusTop}px`;
  const bottomW = (profile.width - l.bottom.marginX * 2 - l.bottom.gap * 2) / 3;
  $('offsetLabel').style.bottom = `${l.bottomY}px`;
  $('offsetLabel').style.left = `${l.bottom.marginX}px`;
  $('offsetLabel').style.width = `${bottomW}px`;
  $('offsetLabel').style.height = `${l.bottom.h}px`;
  $('modeLabel').style.bottom = `${l.bottomY}px`;
  $('modeLabel').style.left = `${l.bottom.marginX + bottomW + l.bottom.gap}px`;
  $('modeLabel').style.width = `${bottomW}px`;
  $('modeLabel').style.height = `${l.bottom.h}px`;
  $('signalHit').style.right = `${l.signalRight}px`;
  $('signalHit').style.top = `${l.iconTop}px`;
  $('wifiIcon').style.right = `${l.wifiRight}px`;
  $('wifiIcon').style.top = `${l.iconTop + 11}px`;
  $('batteryPill').style.right = `${l.batteryRight}px`;
  $('batteryPill').style.top = `${l.iconTop}px`;
  $('settingsHotspot').style.width = `${l.menu.w}px`;
  $('settingsHotspot').style.height = `${l.menu.h}px`;
}

function renderHome() {
  applyLayout();
  const d = parseDistance(state.distance);
  $('txPill').dataset.route = state.route;
  $('txPill').classList.toggle('connected', live());
  $('feetNumber').textContent = d.feet;
  $('inchNumber').textContent = d.inches;
  const distanceReadout = document.querySelector('.distance-readout');
  distanceReadout.className = `distance-readout ${state.theme}`;
  $('statusLine').textContent = live() ? '' : state.status;
  $('offsetLabel').textContent = `OFF ${state.offset}`;
  $('offsetReadout').textContent = `Offset: ${state.offset}`;
  $('modeLabel').textContent = state.mode;
  $('wifiIcon').classList.toggle('hidden', !state.wifi);
  $('batteryPill').dataset.label = state.powerSource === 'USB' ? 'USB' : `${state.battery}%`;
  renderSignalBars();
}

function renderInfoPages() {
  const profile = activeProfile();
  const bars = barsFromRssi(Number(state.rssi), state.connected);
  $('powerInfo').textContent = `Source\n${state.powerSource}\n\nBattery\n${state.powerSource === 'Battery' ? `${state.battery}%` : '--'}\n\nUSB\n${state.powerSource === 'USB' ? 'Connected' : '--'}`;
  $('connectionInfo').textContent = `Source\n${state.route}\n\nTX link\n${live() ? 'OK' : state.status}\n\nSignal\n${bars}/4  ${state.rssi} dBm\n\nScans\n${state.scans}`;
  $('diagInfo').textContent = `TX LINK       ${live() ? 'OK' : '--'}\nUWB STATUS    OK\nRoute         ${state.route}\nRSSI          ${state.rssi} dBm\nDistance      ${state.distance}\nPower         ${state.powerSource}\nBattery       ${state.battery}%\nFirmware      ${profile.firmware}`;
  $('wifiInfo').textContent = state.wifi ? 'Connected\ntheinternet\n192.168.68.57' : 'WiFi off\ntheinternet';
}

function render() {
  const workspace = document.querySelector('.workspace');
  const profile = activeProfile();
  const availableWidth = workspace ? workspace.clientWidth - 16 : window.innerWidth - 20;
  const availableHeight = workspace ? workspace.clientHeight - 16 : window.innerHeight - 20;
  const fitScale = Math.max(0.34, Math.min(1, availableWidth / profile.width, availableHeight / profile.height));
  effectiveScale = Math.min(state.scale, fitScale);
  document.documentElement.style.setProperty('--scale', effectiveScale);
  renderPages();
  renderHome();
  renderInfoPages();
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

controlIds.forEach((id) => {
  const control = $(id);
  if (!control) return;
  control.addEventListener('input', () => {
    state.distance = controlValue('distanceInput', state.distance);
    state.route = controlValue('routeInput', state.route);
    state.status = controlValue('statusInput', state.status);
    state.offset = controlValue('offsetInput', state.offset);
    state.mode = controlValue('modeInput', state.mode);
    state.theme = controlValue('themeInput', state.theme);
    state.connected = controlValue('connectedInput', String(state.connected)) === 'true';
    state.rssi = Number(controlValue('rssiInput', state.rssi));
    state.wifi = controlValue('wifiInput', String(state.wifi)) === 'true';
    state.powerSource = controlValue('powerSourceInput', state.powerSource);
    state.battery = Number(controlValue('batteryInput', state.battery));
    state.scale = Number(controlValue('scaleInput', state.scale));
    Object.keys(state.layout).forEach((key) => {
      if (state.layout[key] && typeof state.layout[key] === 'object') return;
      const input = $(`${key}Input`);
      const output = $(`${key}Value`);
      if (input) {
        state.layout[key] = Number(input.value);
        if (output) output.textContent = input.value;
      }
    });
    render();
  });
});

document.querySelectorAll('.sim-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    activeProfileId = tab.dataset.profile;
    state.screen = 'home';
    state.layout = cloneLayout(activeProfile().layout);
    syncControls();
    render();
  });
});

document.querySelectorAll('[data-open]').forEach((el) => {
  el.addEventListener('click', () => setScreen(el.dataset.open));
});
$('batteryPill').addEventListener('click', () => setScreen('power'));
$('signalHit').addEventListener('click', () => setScreen('connection'));
$('settingsHotspot').addEventListener('click', () => setScreen('settings'));
$('txPill').addEventListener('click', () => {
  state.route = state.route === 'TX' ? 'RX' : 'TX';
  syncControls();
  render();
});
$('offsetLabel').addEventListener('click', () => setScreen('offset'));
$('offsetMinus').addEventListener('click', () => {
  state.offset = formatOffset(Math.max(-120, offsetToNumber(state.offset) - 1));
  syncControls();
  render();
});
$('offsetPlus').addEventListener('click', () => {
  state.offset = formatOffset(Math.min(120, offsetToNumber(state.offset) + 1));
  syncControls();
  render();
});
$('modeLabel').addEventListener('click', () => {
  const currentIndex = modes.indexOf(state.mode);
  state.mode = modes[(currentIndex + 1 + modes.length) % modes.length];
  syncControls();
  render();
});
$('resetState').addEventListener('click', () => {
  state = { ...defaults, screen: 'home', layout: cloneLayout(activeProfile().layout) };
  syncControls();
  render();
});
if ($('copyState')) {
  $('copyState').addEventListener('click', async () => {
    await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
    $('copyState').textContent = 'Copied';
    setTimeout(() => $('copyState').textContent = 'Copy JSON', 900);
  });
}
if ($('exportPng')) {
  $('exportPng').addEventListener('click', () => {
    const profile = activeProfile();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${profile.width}" height="${profile.height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString($('screen').cloneNode(true))}</foreignObject></svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = profile.width;
      canvas.height = profile.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `mini-rx-${state.screen}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  });
}

syncControls();
render();
window.addEventListener('resize', render);
