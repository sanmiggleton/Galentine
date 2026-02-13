// js/script.js

const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const buttons = document.getElementById("buttons");
const responseText = document.getElementById("responseText");
const planButton = document.getElementById("planButton");
const timelineWrap = document.getElementById("timelineWrap");
const card = document.getElementById("card");

// main gif display (the <img> inside .card)
const mainGif = document.querySelector(".card img");
const defaultGifSrc = mainGif ? mainGif.getAttribute("src") : "img/cats.gif";

// ---------- GIF swap (with transition) ----------
function swapMainGif(newSrc) {
  if (!mainGif || !newSrc) return;

  // avoid stacking multiple onload handlers
  mainGif.onload = null;

  mainGif.classList.add("gif-fade");

  setTimeout(() => {
    mainGif.src = newSrc;
  }, 150);

  mainGif.onload = () => {
    mainGif.classList.remove("gif-fade");
  };
}

// ---------- FULL SCREEN hearts ----------
function heartBurst(count = 55) {
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("span");
    heart.className = "heart-burst";
    heart.textContent = Math.random() > 0.25 ? "💗" : "💞";

    // anywhere on screen
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    const drift = (Math.random() * 300 - 150);
    const lift = 180 + Math.random() * 320;
    const dur = 900 + Math.random() * 900;
    const size = 14 + Math.random() * 32;
    const rot = (Math.random() * 140 - 70);

    heart.style.setProperty("--x", `${x}vw`);
    heart.style.setProperty("--y", `${y}vh`);
    heart.style.setProperty("--dx", `${drift}px`);
    heart.style.setProperty("--lift", `${lift}px`);
    heart.style.setProperty("--dur", `${dur}ms`);
    heart.style.setProperty("--size", `${size}px`);
    heart.style.setProperty("--rot", `${rot}deg`);

    document.body.appendChild(heart);
    heart.addEventListener("animationend", () => heart.remove());
  }
}

// ---------- YES flow (resets gif) ----------
yesButton.addEventListener("click", () => {
  // always reset back to default cats gif when YES is clicked
  swapMainGif(defaultGifSrc);

  responseText.textContent = "YAY!! i can’t wait 😽💗";
  buttons.classList.add("hidden");
  planButton.classList.remove("hidden");

  card.classList.add("accepted");
  planButton.focus({ preventScroll: false });
});

// ---------- NO flow (eventually swaps gif) ----------
let noClicks = 0;
noButton.addEventListener("click", () => {
  noClicks++;

  if (noClicks === 1) {
    dodgeNoButton();
    responseText.textContent = "Hehe… you sure? 😼";
  } else if (noClicks === 2) {
    dodgeNoButton(true);
    responseText.textContent = "Be honest… is that your final answer? 🥺💗";
  } else {
    responseText.textContent = "NOOOO 😭 (jk… but also 😭)";
    swapMainGif("img/no-cat.gif");
  }
});

function dodgeNoButton() {
  const btn = noButton;

  // current scale (shrinks each click)
  const currentScale = parseFloat(btn.dataset.scale || "1");
  const newScale = Math.max(0.6, currentScale - 0.08);
  btn.dataset.scale = String(newScale);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // button size (use current size * new scale)
  const rect = btn.getBoundingClientRect();
  const bw = rect.width * newScale;
  const bh = rect.height * newScale;

  // padding so it never touches edges
  const pad = 10;

  // random target position within viewport bounds
  const targetX = pad + Math.random() * Math.max(0, vw - bw - pad * 2);
  const targetY = pad + Math.random() * Math.max(0, vh - bh - pad * 2);

  // use fixed positioning so viewport math is accurate
  btn.classList.add("no-fly");
  btn.style.left = `${targetX}px`;
  btn.style.top = `${targetY}px`;
  btn.style.setProperty("--scale", newScale);
}




// ---------- Timeline: reveal buttons + persistent stop clicking ----------
const stops = Array.from(document.querySelectorAll(".stop"));
const finalButton = document.getElementById("finalButton");

// Data per stop (clicked stop always shows its own gif)
const stopData = [
  { gif: "img/cafe.gif"  },
  { gif: "img/cook.gif"},
  { gif: "img/movie.gif" },
];

// Hide stop 2 and 3 completely until revealed
stops.forEach((stop, i) => {
  if (i !== 0) stop.classList.add("is-hidden");
});

// Hide details until revealed (CSS also handles this, but we enforce here too)
stops.forEach((stop) => {
  const details = stop.querySelector(".stop-details");
  if (details) details.classList.add("hidden");
});

// Plan button: show timeline + stop 1 reveal button (no gif change here)
planButton.addEventListener("click", () => {
  timelineWrap.classList.remove("hidden");
  timelineWrap.classList.add("reveal");
  timelineWrap.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Hook up reveal buttons and stop clicks
stops.forEach((stop, index) => {
  const revealBtn = stop.querySelector(".stop-reveal");
  const details = stop.querySelector(".stop-details");

  // Clicking "Stop X: click to reveal"
  if (revealBtn) {
    revealBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // so we don't also trigger stop click

      // If already revealed, do nothing here (stop click still works)
      if (stop.classList.contains("revealed")) return;

      // Reveal this stop + change gif to THIS stop's gif
      swapMainGif(stopData[index].gif);

      // Replace button with details
      revealBtn.classList.add("hidden");
      if (details) details.classList.remove("hidden");
      stop.classList.add("revealed");

      // Reveal the next stop's "click to reveal" button row
      const next = index + 1;
      if (next < stops.length) {
        stops[next].classList.remove("is-hidden");
      } else {
        // Stop 3 revealed: hearts immediately + show final replay button
        heartBurst(65);
        if (finalButton) finalButton.classList.remove("hidden");
      }
    });
  }

  // After reveal, clicking the stop again shows THIS stop's gif
  stop.addEventListener("click", () => {
    if (!stop.classList.contains("revealed")) return;
    swapMainGif(stopData[index].gif);
  });
});

// Final message button can be pressed repeatedly to replay hearts
if (finalButton) {
  finalButton.addEventListener("click", () => {
    heartBurst(65);
  });
}
