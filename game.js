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
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  // Create polygon points centered at origin so we can project onto a side view.
  const points = [];
  for (let i = 0; i < currentSides; i++) {
    const angle = angleOffset + (i / currentSides) * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    points.push({ x, y });
  }

  const xs = points.map(p => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const edges = [];
  for (let i = 0; i < currentSides; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % currentSides];
    const avgX = (p1.x + p2.x) / 2;
    edges.push({ p1, p2, avgX });
  }

  // Draw from farthest to nearest so closer edges occlude distant ones.
  edges.sort((a, b) => b.avgX - a.avgX);

  for (const { p1, p2, avgX } of edges) {
    const t = (avgX - minX) / (maxX - minX); // 0 near, 1 far
    const grey = Math.round(255 * t);
    ctx.strokeStyle = `rgb(${grey},${grey},${grey})`;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + p1.y);
    ctx.lineTo(centerX, centerY + p2.y);
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
