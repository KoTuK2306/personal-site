// ========== HORIZON MATRIX RAIN ==========
(function () {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Horizon theme colors
  const HORIZON_COLORS = [
    "#B877DB", // purple (keyword)
    "#25B2BC", // cyan (function)
    "#09F7A0", // teal (string)
    "#E95678", // pink (tag)
    "#F09383", // orange (attribute)
    "#FAB795", // light orange (number)
    "#FAC39A", // yellow (type)
  ];

  const HEAD_COLOR = "#D5D8DA"; // white/bright for the head
  const FADE_COLOR = "rgba(28, 30, 38, 0.08)";

  // Characters: katakana, cyrillic, latin, numbers, symbols
  const chars =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
    "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя" +
    "0123456789" +
    "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

  const fontSize = 14;
  let columns = [];
  let drops = [];

  function initMatrix() {
    const colCount = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < colCount; i++) {
      drops.push({
        y: Math.random() * -height,
        speed: 0.5 + Math.random() * 1.5,
        color: HORIZON_COLORS[Math.floor(Math.random() * HORIZON_COLORS.length)],
        switchInterval: 10 + Math.random() * 30,
        switchCounter: 0,
        char: chars[Math.floor(Math.random() * chars.length)],
      });
    }
  }
  initMatrix();
  window.addEventListener("resize", () => {
    resize();
    initMatrix();
  });

  let frame = 0;
  function draw() {
    // Fade effect
    ctx.fillStyle = FADE_COLOR;
    ctx.fillRect(0, 0, width, height);

    ctx.font = fontSize + 'px "JetBrains Mono", monospace';

    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      const x = i * fontSize;
      const y = drop.y;

      // Draw head (bright white)
      ctx.fillStyle = HEAD_COLOR;
      ctx.shadowColor = drop.color;
      ctx.shadowBlur = 8;
      ctx.fillText(drop.char, x, y);
      ctx.shadowBlur = 0;

      // Draw trail with random color variations
      const trailLength = 12 + Math.floor(Math.random() * 8);
      for (let j = 1; j < trailLength; j++) {
        const trailY = y - j * fontSize;
        if (trailY < 0) break;
        const alpha = 1 - j / trailLength;
        const trailColor = HORIZON_COLORS[(i + j) % HORIZON_COLORS.length];
        ctx.fillStyle =
          trailColor +
          Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, "0");
        ctx.fillText(chars[(i * j + frame) % chars.length], x, trailY);
      }

      // Move drop
      drop.y += drop.speed;
      drop.switchCounter++;

      // Change character occasionally
      if (drop.switchCounter >= drop.switchInterval) {
        drop.char = chars[Math.floor(Math.random() * chars.length)];
        drop.switchCounter = 0;
        drop.switchInterval = 10 + Math.random() * 30;
      }

      // Reset when off screen
      if (drop.y > height + trailLength * fontSize) {
        drop.y = Math.random() * -100;
        drop.speed = 0.5 + Math.random() * 1.5;
        drop.color = HORIZON_COLORS[Math.floor(Math.random() * HORIZON_COLORS.length)];
      }
    }

    frame++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ========== UI SCRIPTS ==========
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
);
document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

// ========== SMOOTH ANCHOR SCROLL + URL UPDATE ==========
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", href);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Scroll to anchor on page load (if URL has hash)
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }
});

// Dynamic dates
function declension(number, titles) {
  const cases = [2, 0, 1, 1, 1, 2];
  return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]];
}

function calculateExperience(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  const yLabels = ["год", "года", "лет"];
  const mLabels = ["месяц", "месяца", "месяцев"];
  let result = "";
  if (years > 0) result += years + " " + declension(years, yLabels);
  if (months > 0) {
    if (years > 0) result += " ";
    result += months + " " + declension(months, mLabels);
  }
  return result || "менее месяца";
}

const totalStart = new Date("2020-02-01");
const totalNow = new Date();
let totalYears = totalNow.getFullYear() - totalStart.getFullYear();
let totalMonths = totalNow.getMonth() - totalStart.getMonth();
if (totalMonths < 0) {
  totalYears--;
  totalMonths += 12;
}

const totalExpEl = document.querySelector("#experience .section-desc");
if (totalExpEl) {
  let txt = "";
  if (totalYears > 0) txt += totalYears + " " + declension(totalYears, ["год", "года", "лет"]);
  if (totalMonths > 0) {
    if (totalYears > 0) txt += " ";
    txt += totalMonths + " " + declension(totalMonths, ["месяц", "месяца", "месяцев"]);
  }
  totalExpEl.textContent = txt + " в продуктовых компаниях с фокусом на enterprise и fintech.";
}

document.querySelectorAll(".timeline-period").forEach((el) => {
  const start = el.getAttribute("data-start");
  const end = el.getAttribute("data-end");
  if (start) {
    const period = calculateExperience(start, end);
    const baseText = el.textContent.split("·")[0].trim();
    el.textContent = baseText + " · " + period;
  }
});

document.getElementById("footerYear").textContent = new Date().getFullYear();

// ========== SCROLL SPY / ACTIVE NAV ==========
(function () {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = document.querySelectorAll("section[id]");

  function setActiveLink(id) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + id);
    });
  }

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
          if (window.location.hash !== "#" + entry.target.id) {
            history.replaceState(null, "", "#" + entry.target.id);
          }
        }
      });
    },
    { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" },
  );

  sections.forEach((section) => spyObserver.observe(section));

  // При клике на ссылку сразу подсвечиваем её (пока скроллится)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });
})();
