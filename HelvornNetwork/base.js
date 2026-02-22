// Reveal animation on scroll
function reveal() {
  const reveals = document.querySelectorAll('.card,.hero-content,section h2');
  for (let i = 0; i < reveals.length; i++) {
    const windowHeight = window.innerHeight;
    const elementTop = reveals[i].getBoundingClientRect().top;
    const elementVisible = 150;
    if (elementTop < windowHeight - elementVisible) {
      reveals[i].classList.add('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.add('reveal'));
  reveal();
});

window.addEventListener('scroll', reveal);

// Particle animation with mouse interaction
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', e => {
  mouse.x = e.x;
  mouse.y = e.y;
});

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.color = '#c9b458';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
  }

  update() {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }

    this.baseX += (Math.random() - 0.5) * 0.2;
    this.baseY += (Math.random() - 0.5) * 0.2;
  }
}

function initParticles() {
  particles = [];
  let numberOfParticles = (canvas.width * canvas.height) / 9000;
  for (let i = 0; i < numberOfParticles; i++) {
    particles.push(new Particle());
  }
}
initParticles();

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(animate);
}
animate();

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const themeText = document.getElementById('themeText');
const currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
  themeText.textContent = 'Dark Mode';
}

themeToggle.addEventListener('click', function () {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
    themeText.textContent = 'Light Mode';
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeText.textContent = 'Dark Mode';
  }
});

// Card animation on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('animate');
      }, delay);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.card,.mode-card,.faq-item').forEach(el => {
  observer.observe(el);
});

// Check server status
async function checkStatus() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');

  text.textContent = 'Checking Server...';

  try {
    const response = await fetch('https://api.mcsrvstat.us/3/helvornnetwork.playserver.pro');
    if (!response.ok) throw new Error();

    const data = await response.json();
    if (data.online) {
      dot.classList.add('online');
      text.textContent = `Server Online - ${data.players.online}/${data.players.max} players`;
    } else {
      dot.classList.remove('online');
      text.textContent = 'Server Offline';
    }
  } catch (error) {
    dot.classList.remove('online');
    text.textContent = 'Status Unknown';
  }
}

checkStatus();
setInterval(checkStatus, 60000);

// Copy to clipboard
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#55ff55';
    btn.style.color = '#000';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
    }, 2000);
  });
}

// Load players online
const SERVER_IP = 'helvornnetwork.playserver.pro';

async function loadPlayers() {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
    const data = await response.json();

    const countEl = document.getElementById('playerCount');
    const listEl = document.getElementById('playerList');

    if (!data.online || !data.players.list) {
      countEl.textContent = '0 Players Online';
      listEl.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">No players online</p>';
      return;
    }

    countEl.textContent = `${data.players.online}/${data.players.max} players online`;

    if (data.players.online === 0) {
      listEl.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">No players online</p>';
      return;
    }

    listEl.innerHTML = data.players.list.map(player => {
      const name = typeof player === 'string' ? player : (player.name || 'Unknown');
      return `
        <div class="player-entry">
          <img src="https://mc-heads.net/avatar/${name}/40" alt="${name}" class="player-avatar" onerror="this.src='https://mc-heads.net/avatar/steve/40'">
          <span class="player-name">${name}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    document.getElementById('playerCount').textContent = 'Unable to load players';
  }
}

loadPlayers();
setInterval(loadPlayers, 5000);

// Toggle FAQ items
function toggleFAQ(btn) {
  const item = btn.parentElement;
  const wasActive = item.classList.contains('active');

  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('active');
  });

  if (!wasActive) {
    item.classList.add('active');
  }
}
