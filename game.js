const canvas = document.querySelector('#river');
const ctx = canvas.getContext('2d');
const intro = document.querySelector('#intro');
const hint = document.querySelector('#hint');
const distanceEl = document.querySelector('#distance');
const paceEl = document.querySelector('#pace');

let width = 0;
let height = 0;
let dpr = 1;
let lastTime = performance.now();
let elapsed = 0;
let started = false;
let distance = 0;
let speed = 0;
let targetSpeed = 0;
let canoeX = 0;
let canoeTilt = 0;
let targetTilt = 0;
let lastSide = '';
let stroke = null;
let ripples = [];

const bankSeeds = Array.from({ length: 30 }, (_, i) => ({
  side: i % 2 ? 1 : -1,
  y: ((i * 193) % 1200) / 1200,
  x: .02 + ((i * 71) % 100) / 850,
  size: 4 + (i * 17) % 13,
  color: i % 3,
}));

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function riverEdge(y, side) {
  const bend = Math.sin(y * .004 + elapsed * .00018) * Math.min(34, width * .035);
  const riverWidth = Math.min(width * .7, 720) + Math.sin(y * .0027) * 18;
  return width / 2 + bend + side * riverWidth / 2;
}

function drawBanks() {
  ctx.fillStyle = '#263d32';
  ctx.fillRect(0, 0, width, height);

  const water = ctx.createLinearGradient(0, 0, width, 0);
  water.addColorStop(0, '#24494d');
  water.addColorStop(.48, '#356066');
  water.addColorStop(.52, '#38656a');
  water.addColorStop(1, '#23474b');
  ctx.fillStyle = water;
  ctx.beginPath();
  for (let y = -20; y <= height + 20; y += 18) {
    const x = riverEdge(y, -1);
    if (y === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  for (let y = height + 20; y >= -20; y -= 18) ctx.lineTo(riverEdge(y, 1), y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(196, 204, 155, .22)';
  ctx.lineWidth = 8;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let y = -20; y <= height + 20; y += 14) {
      const x = riverEdge(y, side);
      if (y === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  for (const plant of bankSeeds) {
    let y = (plant.y * (height + 260) + distance * 2.2) % (height + 260) - 130;
    const edge = riverEdge(y, plant.side);
    const x = edge + plant.side * (22 + plant.x * width);
    ctx.fillStyle = ['#395943', '#4d6a49', '#304d3d'][plant.color];
    ctx.beginPath();
    ctx.arc(x, y, plant.size, 0, Math.PI * 2);
    ctx.arc(x - plant.side * plant.size * .8, y + 4, plant.size * .65, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWater() {
  const drift = (distance * 5) % 90;
  ctx.lineWidth = 1;
  for (let i = 0; i < 17; i++) {
    const y = ((i * 97 + drift) % (height + 80)) - 40;
    const center = width / 2 + Math.sin(y * .004 + elapsed * .00018) * Math.min(34, width * .035);
    const x = center + Math.sin(i * 91.7) * Math.min(width * .22, 210);
    ctx.strokeStyle = i % 3 ? 'rgba(210, 236, 219, .10)' : 'rgba(237, 196, 112, .10)';
    ctx.beginPath();
    ctx.moveTo(x - 22, y);
    ctx.quadraticCurveTo(x, y - 4, x + 28, y);
    ctx.stroke();
  }
  for (const ripple of ripples) {
    const alpha = 1 - ripple.age;
    ctx.strokeStyle = `rgba(211, 235, 219, ${alpha * .42})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(ripple.x, ripple.y, 10 + ripple.age * 32, 3 + ripple.age * 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawCanoe() {
  const x = width / 2 + canoeX;
  const y = height * .62;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(canoeTilt);

  ctx.shadowColor = 'rgba(0,0,0,.28)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 9;
  const hull = ctx.createLinearGradient(-25, 0, 25, 0);
  hull.addColorStop(0, '#9a4e30');
  hull.addColorStop(.5, '#d07a45');
  hull.addColorStop(1, '#874129');
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(0, -84);
  ctx.bezierCurveTo(27, -54, 30, 48, 0, 91);
  ctx.bezierCurveTo(-30, 48, -27, -54, 0, -84);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.fillStyle = '#412b25';
  ctx.beginPath();
  ctx.moveTo(0, -68);
  ctx.bezierCurveTo(17, -39, 18, 47, 0, 72);
  ctx.bezierCurveTo(-18, 47, -17, -39, 0, -68);
  ctx.fill();
  ctx.strokeStyle = '#ebb276';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-17, -26); ctx.lineTo(17, -26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-18, 30); ctx.lineTo(18, 30); ctx.stroke();

  // Paddler
  ctx.fillStyle = '#d5b28d';
  ctx.beginPath(); ctx.arc(0, 1, 9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#efbd65';
  ctx.beginPath(); ctx.arc(0, 0, 10, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#36515a';
  ctx.beginPath(); ctx.ellipse(0, 17, 12, 18, 0, 0, Math.PI * 2); ctx.fill();

  if (stroke) {
    const progress = Math.min(1, (performance.now() - stroke.started) / 430);
    const side = stroke.side === 'left' ? -1 : 1;
    ctx.save();
    ctx.translate(side * 9, 9);
    ctx.rotate(side * (-.55 + progress * .85));
    ctx.strokeStyle = '#d8bb83';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(side * 42, 56); ctx.stroke();
    ctx.fillStyle = '#e9c98e';
    ctx.beginPath(); ctx.ellipse(side * 47, 64, 6, 17, -side * .55, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function paddle(side) {
  if (!started) {
    started = true;
    intro.classList.add('hidden');
    hint.classList.add('visible');
  }
  const alternating = side !== lastSide;
  targetSpeed = Math.min(7.5, targetSpeed + (alternating ? 1.5 : .65));
  targetTilt += side === 'left' ? .09 : -.09;
  canoeX += side === 'left' ? 5 : -5;
  lastSide = side;
  stroke = { side, started: performance.now() };
  ripples.push({ x: width / 2 + canoeX + (side === 'left' ? -48 : 48), y: height * .62 + 62, age: 0 });
  const button = document.querySelector(side === 'left' ? '#leftKey' : '#rightKey');
  button.classList.add('active');
  setTimeout(() => button.classList.remove('active'), 140);
}

function reset() {
  distance = 0; speed = 0; targetSpeed = 0; canoeX = 0; canoeTilt = 0; targetTilt = 0; lastSide = ''; ripples = [];
}

function update(dt) {
  elapsed += dt * 1000;
  targetSpeed *= Math.pow(.988, dt * 60);
  speed += (targetSpeed - speed) * Math.min(1, dt * 3.2);
  distance += speed * dt * 1.7;
  targetTilt *= Math.pow(.96, dt * 60);
  canoeTilt += (targetTilt - canoeTilt) * Math.min(1, dt * 5);
  canoeX *= Math.pow(.997, dt * 60);
  const maxX = Math.min(width * .25, 235);
  canoeX = Math.max(-maxX, Math.min(maxX, canoeX));
  ripples.forEach(r => r.age += dt * 1.25);
  ripples = ripples.filter(r => r.age < 1);
  if (stroke && performance.now() - stroke.started > 430) stroke = null;
  distanceEl.textContent = `${Math.floor(distance)} m`;
  paceEl.textContent = `${speed.toFixed(1)} kn`;
}

function frame(now) {
  const dt = Math.min(.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  drawBanks();
  drawWater();
  drawCanoe();
  requestAnimationFrame(frame);
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    if (!event.repeat) paddle(event.key === 'ArrowLeft' ? 'left' : 'right');
  }
  if (event.key.toLowerCase() === 'r') reset();
});
document.querySelector('#leftKey').addEventListener('pointerdown', () => paddle('left'));
document.querySelector('#rightKey').addEventListener('pointerdown', () => paddle('right'));

resize();
requestAnimationFrame(frame);
