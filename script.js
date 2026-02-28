// Particle canvas setup
var canvas = document.getElementById('particles');
var ctx = canvas.getContext('2d');
var particleArray = [];
var mousePosition = {
    x: null,
    y: null,
    radius: 150
};

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

window.addEventListener('mousemove', function(event) {
    mousePosition.x = event.x;
    mousePosition.y = event.y;
});

// Particle constructor
function createParticle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
    this.color = '#c9b458';
}

createParticle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
};

createParticle.prototype.update = function() {
    var dx = mousePosition.x - this.x;
    var dy = mousePosition.y - this.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var forceX = dx / distance;
    var forceY = dy / distance;
    var maxDist = mousePosition.radius;
    var force = (maxDist - distance) / maxDist;
    var moveX = forceX * force * this.density;
    var moveY = forceY * force * this.density;

    if (distance < mousePosition.radius) {
        this.x -= moveX;
        this.y -= moveY;
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

function initParticles() {
    particleArray = [];
    var numberOfParticles = (canvas.width * canvas.height) / 9000;
    for (var i = 0; i < numberOfParticles; i++) {
        particleArray.push(new createParticle());
    }
}

initParticles();

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

animateParticles();

// Theme toggle
var themeBtn = document.getElementById('theme-btn');
var themeLabel = document.getElementById('theme-label');
var savedTheme = localStorage.getItem('theme') || 'dark';

if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeLabel.textContent = 'Dark Mode';
}

themeBtn.addEventListener('click', function() {
    var currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        themeLabel.textContent = 'Light Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeLabel.textContent = 'Dark Mode';
    }
});

// Server status checker
function checkServerStatus() {
    var statusDiv = document.getElementById('server-status');
    statusDiv.innerHTML = '<span style="color:var(--text-secondary)">Checking Server...</span>';

    fetch('https://api.mcsrvstat.us/3/helvornnetwork.playserver.pro')
        .then(function(response) {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then(function(data) {
            if (data.online) {
                statusDiv.innerHTML = '<span style="color:#55ff55">●</span> ONLINE <span style="color:var(--text-secondary); margin-left:8px;">' + data.players.online + '/' + data.players.max + '</span>';
            } else {
                statusDiv.innerHTML = '<span style="color:#ff5555">●</span> OFFLINE';
            }
        })
        .catch(function(error) {
            statusDiv.innerHTML = '<span style="color:#ffaa00">●</span> STATUS UNKNOWN';
        });
}

checkServerStatus();
setInterval(checkServerStatus, 60000);

// Copy IP function
function copyIP(elementId) {
    var ipElement = document.getElementById(elementId);
    var ipText = ipElement.textContent;
    
    navigator.clipboard.writeText(ipText).then(function() {
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
    }).catch(function(err) {
        console.log('Copy failed:', err);
    });
}

// Load online players
var serverIP = 'helvornnetwork.playserver.pro';

function loadPlayers() {
    fetch('https://api.mcsrvstat.us/3/' + serverIP)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            var playerCount = document.getElementById('player-count');
            var playerList = document.getElementById('player-list');
            
            if (!data.online || !data.players.list) {
                playerCount.textContent = '0 Players Online';
                playerList.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Nobody online right now</p>';
                return;
            }
            
            playerCount.textContent = data.players.online + '/' + data.players.max + ' players online';
            
            if (data.players.online === 0) {
                playerList.innerHTML = '<p style="color:var(--text-secondary);text-align:center;padding:20px;">Nobody online right now</p>';
                return;
            }
            
            var html = '';
            for (var i = 0; i < data.players.list.length; i++) {
                var player = data.players.list[i];
                var playerName = typeof player === 'string' ? player : (player.name || 'Unknown');
                
                html += '<div class="player-item">';
                html += '<img src="https://mc-heads.net/avatar/' + playerName + '/40" ';
                html += 'alt="' + playerName + '" ';
                html += 'onerror="this.src=\'https://mc-heads.net/avatar/steve/40\'">';
                html += '<span>' + playerName + '</span>';
                html += '</div>';
            }
            
            playerList.innerHTML = html;
        })
        .catch(function(err) {
            document.getElementById('player-count').textContent = 'Failed to load players';
            console.log('Player load error:', err);
        });
}

loadPlayers();
setInterval(loadPlayers, 5000);

// FAQ toggle
function toggleAnswer(button) {
    var faqBox = button.parentElement;
    var wasOpen = faqBox.classList.contains('open');
    
    // Close all FAQ boxes
    var allBoxes = document.querySelectorAll('.faq-box');
    for (var i = 0; i < allBoxes.length; i++) {
        allBoxes[i].classList.remove('open');
    }
    
    // Open clicked one if it wasn't open
    if (!wasOpen) {
        faqBox.classList.add('open');
    }
}
