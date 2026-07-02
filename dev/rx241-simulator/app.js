const PANEL = { width: 450, height: 600 };
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
  layout: {
    distanceTop: 242,
    distanceHeight: 128,
    distanceGap: 12,
    numberYOffset: 12,
    feetWidth: 96,
    inchWidth: 96,
    statusTop: 380,
    bottomY: 44,
    signalRight: 202,
    wifiRight: 132,
    batteryRight: 18,
    iconTop: 24,
  },
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

function syncControls() {
  $('distanceInput').value = state.distance;
  $('routeInput').value = state.route;
  $('statusInput').value = state.status;
  $('offsetInput').value = state.offset;
  $('modeInput').value = state.mode;
  $('themeInput').value = state.theme;
  $('connectedInput').value = String(state.connected);
  $('rssiInput').value = state.rssi;
  $('wifiInput').value = String(state.wifi);
  $('powerSourceInput').value = state.powerSource;
  $('batteryInput').value = state.battery;
  $('scaleInput').value = state.scale;
  Object.entries(state.layout).forEach(([key, value]) => {
    const input = $(`${key}Input`);
    const output = $(`${key}Value`);
    if (input) input.value = value;
    if (output) output.textContent = value;
  });
}

function renderSignalBars() {
  const signalBars = $('signalBars');
  signalBars.innerHTML = '';
  signalBars.style.right = `${state.layout.signalRight}px`;
  signalBars.style.top = `${state.layout.iconTop}px`;
  const bars = barsFromRssi(Number(state.rssi), state.connected);
  for (let i = 0; i < 4; i += 1) {
    const bar = document.createElement('div');
    bar.className = `bar ${i < bars ? 'on' : ''}`;
    bar.style.setProperty('--i', i);
    signalBars.appendChild(bar);
  }
}

function renderPages() {
  pageEls.forEach((page) => page.classList.toggle('active', page.dataset.page === state.screen));
  $('screen').dataset.screen = state.screen;
}

function applyLayout() {
  const l = state.layout;
  const distance = document.querySelector('.distance-readout');
  distance.style.top = `${l.distanceTop}px`;
  distance.style.height = `${l.distanceHeight}px`;
  distance.style.gap = `${l.distanceGap}px`;
  document.querySelectorAll('.feet-number, .inch-number').forEach((el) => { el.style.paddingTop = `${l.numberYOffset}px`; });
  $('feetNumber').style.width = `${l.feetWidth}px`;
  $('inchNumber').style.width = `${l.inchWidth}px`;
  $('statusLine').style.top = `${l.statusTop}px`;
  $('offsetLabel').style.bottom = `${l.bottomY}px`;
  $('modeLabel').style.bottom = `${l.bottomY}px`;
  $('signalHit').style.right = `${l.signalRight}px`;
  $('signalHit').style.top = `${l.iconTop}px`;
  $('wifiIcon').style.right = `${l.wifiRight}px`;
  $('wifiIcon').style.top = `${l.iconTop + 11}px`;
  $('batteryPill').style.right = `${l.batteryRight}px`;
  $('batteryPill').style.top = `${l.iconTop}px`;
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
  const bars = barsFromRssi(Number(state.rssi), state.connected);
  $('powerInfo').textContent = `Source\n${state.powerSource}\n\nBattery\n${state.powerSource === 'Battery' ? `${state.battery}%` : '--'}\n\nUSB\n${state.powerSource === 'USB' ? 'Connected' : '--'}`;
  $('connectionInfo').textContent = `Source\n${state.route}\n\nTX link\n${live() ? 'OK' : state.status}\n\nSignal\n${bars}/4  ${state.rssi} dBm\n\nScans\n${state.scans}`;
  $('diagInfo').textContent = `TX LINK       ${live() ? 'OK' : '--'}\nUWB STATUS    OK\nRoute         ${state.route}\nRSSI          ${state.rssi} dBm\nDistance      ${state.distance}\nPower         ${state.powerSource}\nBattery       ${state.battery}%\nScreen        ${PANEL.width} x ${PANEL.height}`;
  $('wifiInfo').textContent = state.wifi ? 'Connected\ntheinternet\n192.168.68.57' : 'WiFi off\ntheinternet';
}

function render() {
  document.documentElement.style.setProperty('--scale', state.scale);
  renderPages();
  renderHome();
  renderInfoPages();
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

controlIds.forEach((id) => {
  $(id).addEventListener('input', () => {
    state.distance = $('distanceInput').value;
    state.route = $('routeInput').value;
    state.status = $('statusInput').value;
    state.offset = $('offsetInput').value;
    state.mode = $('modeInput').value;
    state.theme = $('themeInput').value;
    state.connected = $('connectedInput').value === 'true';
    state.rssi = Number($('rssiInput').value);
    state.wifi = $('wifiInput').value === 'true';
    state.powerSource = $('powerSourceInput').value;
    state.battery = Number($('batteryInput').value);
    state.scale = Number($('scaleInput').value);
    Object.keys(state.layout).forEach((key) => {
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
  state = { ...defaults };
  syncControls();
  render();
});
$('copyState').addEventListener('click', async () => {
  await navigator.clipboard.writeText(JSON.stringify(state, null, 2));
  $('copyState').textContent = 'Copied';
  setTimeout(() => $('copyState').textContent = 'Copy JSON', 900);
});
$('exportPng').addEventListener('click', () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PANEL.width}" height="${PANEL.height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString($('screen').cloneNode(true))}</foreignObject></svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = PANEL.width;
    canvas.height = PANEL.height;
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

syncControls();
render();
