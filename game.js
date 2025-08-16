const canvas = document.getElementById('creature');
const ctx = canvas.getContext('2d');
let currentSides = 3;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCreature() {
  currentSides = randomInt(3, 10);
  const angleOffset = Math.random() * Math.PI * 2;
  const radius = 150;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  const points = [];
  for (let i = 0; i < currentSides; i++) {
    const angle = angleOffset + (i / currentSides) * Math.PI * 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }

  const ys = points.map(p => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let i = 0; i < currentSides; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % currentSides];
    const midY = (p1.y + p2.y) / 2;
    const t = (maxY - midY) / (maxY - minY); // 0 near, 1 far
    const grey = Math.round(255 * t);
    ctx.strokeStyle = `rgb(${grey},${grey},${grey})`;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
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
