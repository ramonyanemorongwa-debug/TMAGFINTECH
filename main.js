/* ══════════════════════════════════════════
   TMAG FINTECH — Main JavaScript
   Handles: Charts, Ticker, Navigation, Forms, Market Data
══════════════════════════════════════════ */

// ─── MARKET DATA ───────────────────────────
const MARKET_DATA = {
  stocks: [
    { sym: 'AAPL',  name: 'Apple Inc.',       price: 192.50,  change: 0.55,  dir: 'up'  },
    { sym: 'TSLA',  name: 'Tesla Inc.',        price: 248.91,  change: 3.41,  dir: 'up'  },
    { sym: 'NVDA',  name: 'NVIDIA Corp.',      price: 875.40,  change: 2.18,  dir: 'up'  },
    { sym: 'MSFT',  name: 'Microsoft Corp.',   price: 418.22,  change: -0.34, dir: 'dn'  },
  ],
  forex: [
    { sym: 'EUR/USD', name: 'Euro / US Dollar',       price: 1.0842, change: -0.14, dir: 'dn'  },
    { sym: 'GBP/USD', name: 'British Pound / Dollar', price: 1.2731, change:  0.08, dir: 'up'  },
    { sym: 'USD/JPY', name: 'Dollar / Japanese Yen',  price: 151.22, change:  0.31, dir: 'up'  },
    { sym: 'AUD/USD', name: 'Aussie / US Dollar',     price: 0.6544, change: -0.22, dir: 'dn'  },
  ],
  crypto: [
    { sym: 'BTC/USD', name: 'Bitcoin',    price: 71204.50, change: -0.37, dir: 'dn'  },
    { sym: 'ETH/USD', name: 'Ethereum',   price:  3841.20, change:  2.15, dir: 'up'  },
    { sym: 'SOL/USD', name: 'Solana',     price:   182.44, change:  4.22, dir: 'up'  },
    { sym: 'XRP/USD', name: 'Ripple',     price:     0.62, change: -1.10, dir: 'dn'  },
  ],
  indexes: [
    { sym: 'SPX',    name: 'S&P 500',         price:  5248.32,  change:  0.84, dir: 'up'  },
    { sym: 'NAS100', name: 'Nasdaq 100',       price: 18432.10,  change:  1.12, dir: 'up'  },
    { sym: 'DOW',    name: 'Dow Jones 30',     price: 39127.14,  change: -0.18, dir: 'dn'  },
    { sym: 'VIX',    name: 'Volatility Index', price:    13.44,  change: -1.20, dir: 'dn'  },
  ],
  futures: [
    { sym: 'OIL(WTI)', name: 'Crude Oil WTI',    price:  84.62, change:  0.61, dir: 'up'  },
    { sym: 'GOLD',     name: 'Gold Futures',      price: 2341.80, change: 0.22, dir: 'up'  },
    { sym: 'SILVER',   name: 'Silver Futures',    price:  28.14, change:  1.04, dir: 'up'  },
    { sym: 'NATGAS',   name: 'Natural Gas',       price:   1.82, change: -2.11, dir: 'dn'  },
  ],
};

const CHART_COLORS = {
  up: { line: '#3fa849', fill: 'rgba(63,168,73,0.10)' },
  dn: { line: '#e03c3c', fill: 'rgba(224,60,60,0.10)' },
};

// Generate realistic-looking price data
function generatePriceData(basePrice, points = 30, volatility = 0.008) {
  const data = [];
  let price = basePrice * (1 - volatility * points * 0.5);
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.47) * volatility * 2);
    data.push(parseFloat(price.toFixed(4)));
  }
  data[data.length - 1] = basePrice;
  return data;
}

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100)  return price.toFixed(2);
  if (price >= 1)    return price.toFixed(4);
  return price.toFixed(5);
}

// ─── CHART INSTANCES ────────────────────────
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function createMiniChart(canvasId, dir, basePrice) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  destroyChart(canvasId);
  const ctx = canvas.getContext('2d');
  const data = generatePriceData(basePrice);
  const col = CHART_COLORS[dir] || CHART_COLORS.up;

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: col.line,
        backgroundColor: col.fill,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
      animation: { duration: 600, easing: 'easeInOutQuart' },
    }
  });
}

function createHeroChart() {
  const canvas = document.getElementById('heroChart');
  if (!canvas || !window.Chart) return;
  destroyChart('heroChart');
  const ctx = canvas.getContext('2d');
  const data = generatePriceData(5248.32, 60, 0.004);
  const labels = [];
  const now = new Date();
  for (let i = 60; i >= 0; i--) {
    const d = new Date(now - i * 5 * 60000);
    labels.push(d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'));
  }

  chartInstances['heroChart'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'SPX',
        data,
        borderColor: '#2e8fe8',
        backgroundColor: 'rgba(46,143,232,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: '#141414',
          borderColor: '#2e2e2e', borderWidth: 1,
          titleColor: '#aaa', bodyColor: '#f2f2f2',
          titleFont: { family: 'DM Mono', size: 11 },
          bodyFont: { family: 'DM Mono', size: 12 },
          callbacks: { label: ctx => ' ' + ctx.raw.toFixed(2) }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#444', font: { family: 'DM Mono', size: 10 }, maxTicksLimit: 6 },
        },
        y: {
          position: 'right',
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#444', font: { family: 'DM Mono', size: 10 }, callback: v => v.toFixed(0) },
        }
      },
      animation: { duration: 1200, easing: 'easeInOutQuart' },
    }
  });
}

// ─── MARKET CHARTS GRID ─────────────────────
function renderMarketGrid(category) {
  const grid = document.getElementById('charts-grid');
  if (!grid) return;

  // Destroy old charts
  Object.keys(chartInstances).forEach(id => {
    if (id.startsWith('mini-')) destroyChart(id);
  });

  const assets = MARKET_DATA[category] || [];
  grid.innerHTML = '';

  assets.forEach((asset, i) => {
    const id = `mini-${category}-${i}`;
    const card = document.createElement('div');
    card.className = 'mini-chart-card';
    const changeStr = (asset.dir === 'up' ? '▲ +' : '▼ ') + Math.abs(asset.change).toFixed(2) + '%';
    card.innerHTML = `
      <div class="mini-header">
        <div>
          <div class="mini-sym">${asset.sym}</div>
          <div class="mini-name">${asset.name}</div>
        </div>
        <div>
          <div class="mini-price">${formatPrice(asset.price)}</div>
          <div class="mini-change ${asset.dir}">${changeStr}</div>
        </div>
      </div>
      <div style="height:80px;position:relative;">
        <canvas id="${id}"></canvas>
      </div>
    `;
    grid.appendChild(card);

    // Draw chart after DOM insertion
    setTimeout(() => createMiniChart(id, asset.dir, asset.price), 50);
  });
}

// ─── NAVIGATION ─────────────────────────────
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const nav       = document.getElementById('nav');

  hamburger && hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) navLinks.classList.remove('open');
  });

  // Highlight active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

// ─── TICKER DUPLICATION ─────────────────────
function initTicker() {
  const track = document.getElementById('ticker-track');
  if (!track) return;
  // Duplicate content for seamless loop
  track.innerHTML += track.innerHTML;
}

// ─── MARKET TABS ────────────────────────────
function initMarketTabs() {
  const tabs = document.querySelectorAll('.mtab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMarketGrid(tab.dataset.market);
    });
  });
}

// ─── WAITLIST FORM ──────────────────────────
function initWaitlistForm() {
  const form    = document.getElementById('waitlist-form');
  const success = document.getElementById('wl-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    const data = {
      name:  form.name.value.trim(),
      email: form.email.value.trim(),
      role:  form.role.value,
    };

    try {
      const res = await fetch('api/waitlist.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        form.style.display = 'none';
        success.style.display = 'block';
      } else {
        alert(json.message || 'Something went wrong. Please try again.');
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (err) {
      // Fallback for local dev without PHP
      form.style.display = 'none';
      success.style.display = 'block';
    }
  });
}

// ─── SCROLL ANIMATIONS ──────────────────────
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.model-card, .pricing-card, .mini-chart-card').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });
}

// ─── LIVE PRICE SIMULATION ──────────────────
function startPriceUpdates() {
  setInterval(() => {
    // Re-randomize ticker data slightly to feel live
    document.querySelectorAll('.tick em').forEach(el => {
      const isUp = el.classList.contains('up');
      const base = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
      const delta = (Math.random() * 0.04 - 0.02).toFixed(2);
      const newVal = Math.max(0.01, base + parseFloat(delta)).toFixed(2);
      el.textContent = (isUp ? '▲ ' : '▼ ') + newVal + '%';
    });
  }, 5000);
}

// ─── INIT ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTicker();
  initMarketTabs();
  initWaitlistForm();
  initScrollAnimations();
  startPriceUpdates();

  // Load default market grid
  renderMarketGrid('stocks');

  // Hero chart (wait for Chart.js)
  if (window.Chart) {
    createHeroChart();
  } else {
    window.addEventListener('load', createHeroChart);
  }
});

// CSS for scroll animations (injected)
const style = document.createElement('style');
style.textContent = `
  .fade-up {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .nav-links a.active { color: #f2f2f2; }
`;
document.head.appendChild(style);
