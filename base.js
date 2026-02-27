// Scroll reveal animation
function reveal() {
    var reveals = document.querySelectorAll(".card, .hero-content, section h2");
    
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    var cards = document.querySelectorAll(".card");
    cards.forEach(function(card) {
        card.classList.add("reveal");
    });
    reveal();
});

window.addEventListener("scroll", reveal);

// Particle canvas setup
var canvas = document.getElementById("particleCanvas");
var ctx = canvas.getContext("2d");
var particles = [];
var mouse = {
    x: null,
    y: null,
    radius: 150
};

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", function(e) {
    mouse.x = e.x;
    mouse.y = e.y;
});

// Particle class
function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.color = '#c9b458';
}

Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
};

Particle.prototype.update = function() {
    var dx = mouse.x - this.x;
    var dy = mouse.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var forceDirectionX = dx / distance;
    var forceDirectionY = dy / distance;
    var maxDistance = mouse.radius;
    var force = (maxDistance - distance) / maxDistance;
    var directionX = forceDirectionX * force * this.density;
    var directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
        this.x -= directionX;
        this.y -= directionY;
    } else {
        if (this.x !== this.baseX) {
            var dx = this.x - this.baseX;
            this.x -= dx / 10;
        }
        if (this.y !== this.baseY) {
            var dy = this.y - this.baseY;
            this.y -= dy / 10;
        }
    }

    this.baseX += (Math.random() - 0.5) * 0.2;
    this.baseY += (Math.random() - 0.5) * 0.2;
};

function init() {
    particles = [];
    var numberOfParticles = (canvas.width * canvas.height) / 9000;
    for (var i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

init();

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animate);
}

animate();

// Theme toggle
var themeToggle = document.getElementById('themeToggle');
var themeText = document.getElementById('themeText');
var currentTheme = localStorage.getItem('theme') || 'dark';

if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeText.textContent = 'Dark Mode';
}

themeToggle.addEventListener('click', function() {
    var theme = document.documentElement.getAttribute('data-theme');
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

// Intersection observer for cards
var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
        if (entry.isIntersecting) {
            var delay = entry.target.dataset.delay || 0;
            setTimeout(function() {
                entry.target.classList.add('animate');
            }, delay);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.card, .mode-card, .faq-item').forEach(function(el) {
    observer.observe(el);
});

// Server status checker
async function checkServerStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '<span style="color:var(--muted)">Checking Server...</span>';

    try {
        const response = await fetch('https://api.mcsrvstat.us/3/helvornsmp.playserver.pro');
        if (!response.ok) throw new Error();

        const data = await response.json();
        if (data.online) {
            statusDiv.innerHTML = `<span style="color:#55ff55">●</span> ONLINE <span style="color:var(--muted); margin-left:8px;">${data.players.online}/${data.players.max}</span>`;
        } else {
            statusDiv.innerHTML = `<span style="color:#ff5555">●</span> OFFLINE`;
        }
    } catch (error) {
        statusDiv.innerHTML = `<span style="color:#ffaa00">●</span> STATUS UNKNOWN`;
    }
}

checkServerStatus();
setInterval(checkServerStatus, 60000);

// Copy IP to clipboard
function copyToClipboard(elementId) {
    var text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(function() {
        var btn = event.target;
        var originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = '#55ff55';
        btn.style.color = '#000';
        setTimeout(function() {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.color = '';
        }, 2000);
    });
}

// Load online players
var SERVER_IP = 'helvornnetwork.playserver.pro';

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
        
        var playerHTML = '';
        for (var i = 0; i < data.players.list.length; i++) {
            var player = data.players.list[i];
            var name = typeof player === 'string' ? player : (player.name || 'Unknown');
            playerHTML += `
                <div class="player-entry">
                    <img src="https://mc-heads.net/avatar/${name}/40" 
                         alt="${name}" 
                         class="player-avatar" 
                         onerror="this.src='https://mc-heads.net/avatar/steve/40'">
                    <span class="player-name">${name}</span>
                </div>
            `;
        }
        listEl.innerHTML = playerHTML;
    } catch (err) {
        document.getElementById('playerCount').textContent = 'Unable to load players';
    }
}

loadPlayers();
setInterval(loadPlayers, 5000);

// FAQ toggle
function toggleFAQ(btn) {
    var item = btn.parentElement;
    var wasActive = item.classList.contains('active');
    
    var allItems = document.querySelectorAll('.faq-item');
    for (var i = 0; i < allItems.length; i++) {
        allItems[i].classList.remove('active');
    }
    
    if (!wasActive) {
        item.classList.add('active');
    }
}
