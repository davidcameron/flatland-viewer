const canvas = document.getElementById('creature');
const ctx = canvas.getContext('2d');
let currentSides = 3;
let points = [];
let rotation = 0;
let lastTime = 0;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCreature() {
  currentSides = randomInt(3, 10);
  const angleOffset = Math.random() * Math.PI * 2;
  const radius = 150;

  points = [];
  for (let i = 0; i < currentSides; i++) {
    const angle = angleOffset + (i / currentSides) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push({ x, y });
  }

  rotation = 0;
  lastTime = 0;
}

function drawCreature() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 40; // five times thicker line
  ctx.lineCap = 'round';

  const rotated = points.map(p => ({
    x: p.x * Math.cos(rotation) - p.y * Math.sin(rotation),
    y: p.x * Math.sin(rotation) + p.y * Math.cos(rotation)
  }));

  const ys = rotated.map(p => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const edges = [];
  for (let i = 0; i < currentSides; i++) {
    const p1 = rotated[i];
    const p2 = rotated[(i + 1) % currentSides];
    const avgY = (p1.y + p2.y) / 2;
    edges.push({ p1, p2, avgY });
  }

  edges.sort((a, b) => b.avgY - a.avgY);

  for (const { p1, p2, avgY } of edges) {
    const t = (avgY - minY) / (maxY - minY);
    const grey = Math.round(255 * t);
    ctx.strokeStyle = `rgb(${grey},${grey},${grey})`;
    ctx.beginPath();
    ctx.moveTo(centerX + p1.x, centerY);
    ctx.lineTo(centerX + p2.x, centerY);
    ctx.stroke();
  }
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;
  rotation += delta * 2 * Math.PI; // one rotation per second
  drawCreature();
  requestAnimationFrame(animate);
}

document.getElementById('submit').addEventListener('click', () => {
  const guess = parseInt(document.getElementById('guess').value, 10);
  const feedback = document.getElementById('feedback');
  if (guess === currentSides) {
    feedback.textContent = `Correct! It was a ${currentSides}-sided creature.`;
  } else {
    feedback.textContent = `Incorrect. It was a ${currentSides}-sided creature.`;
  }
  generateCreature();
});

// Start game
generateCreature();
requestAnimationFrame(animate);
