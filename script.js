/* MadeByMyst script.js
   Plain JavaScript, no libraries. The page works without it; this adds the
   mobile menu, scroll effects, the FAQ animation and the contact form. */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Header: hairline once scrolled, hides while scrolling down ---------- */

const header = document.querySelector(".site-header");
const siteNav = document.getElementById("site-nav");
let lastScrollY = window.scrollY;

function updateHeader() {
  const y = window.scrollY;
  const scrollingDown = y > lastScrollY;
  const menuIsOpen = siteNav.classList.contains("is-open");

  header.classList.toggle("is-scrolled", y > 8);
  header.classList.toggle("is-hidden", scrollingDown && y > 160 && !menuIsOpen);
  lastScrollY = y;
}

/* ---------- Process: the line fills as the steps scroll into view ---------- */

const steps = document.querySelector(".steps");
const stepItems = steps ? [...steps.querySelectorAll(".step")] : [];

function updateSteps() {
  if (!steps) return;
  const rect = steps.getBoundingClientRect();
  const start = window.innerHeight * 0.8; // starts filling when the steps reach 80% down the screen
  const progress = Math.min(Math.max((start - rect.top) / rect.height, 0), 1);

  steps.style.setProperty("--progress", progress.toFixed(3));
  stepItems.forEach((step, index) => {
    step.classList.toggle("is-active", progress > index / stepItems.length);
  });
}

// Run both on scroll, at most once per frame
let ticking = false;

window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateHeader();
      updateSteps();
      ticking = false;
    });
  },
  { passive: true }
);

updateHeader();
updateSteps();

/* ---------- Mobile menu ---------- */

const menuToggle = document.querySelector(".menu-toggle");

function setMenu(open) {
  if (open) header.classList.remove("is-hidden"); // keep the header in view while the menu is open
  menuToggle.setAttribute("aria-expanded", String(open));
  siteNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

// Close the menu after picking a link
siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && siteNav.classList.contains("is-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

// Close it if the screen grows past the mobile layout
window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* ---------- Fade sections in as they scroll into view ---------- */

const revealItems = document.querySelectorAll(".reveal, .stagger");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ---------- Hero: the screenshots drift gently with the mouse ---------- */

const heroVisual = document.querySelector(".hero-visual");
const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (heroVisual && hasMouse && !reduceMotion) {
  const hero = heroVisual.closest(".hero");

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    // -1 on the left/top edge, 1 on the right/bottom edge
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    heroVisual.style.setProperty("--mx", x.toFixed(3));
    heroVisual.style.setProperty("--my", y.toFixed(3));
  });

  hero.addEventListener("pointerleave", () => {
    heroVisual.style.setProperty("--mx", 0);
    heroVisual.style.setProperty("--my", 0);
  });
}

/* ---------- FAQ: smooth open and close, one answer at a time ---------- */

const faqItems = document.querySelectorAll(".faq-item");
const faqTiming = { duration: 550, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };

function openFaq(item) {
  const answer = item.querySelector(".faq-answer");
  item.open = true;
  answer.animate(
    [
      { height: "0px", opacity: 0 },
      { height: `${answer.scrollHeight}px`, opacity: 1 },
    ],
    faqTiming
  );
}

function closeFaq(item) {
  const answer = item.querySelector(".faq-answer");
  item.classList.add("is-closing");
  const animation = answer.animate(
    [
      { height: `${answer.scrollHeight}px`, opacity: 1 },
      { height: "0px", opacity: 0 },
    ],
    faqTiming
  );
  animation.onfinish = () => {
    item.open = false;
    item.classList.remove("is-closing");
  };
}

faqItems.forEach((item) => {
  item.querySelector("summary").addEventListener("click", (event) => {
    if (reduceMotion) return; // let the browser open it instantly
    event.preventDefault();

    if (item.open && !item.classList.contains("is-closing")) {
      closeFaq(item);
    } else {
      faqItems.forEach((other) => {
        if (other !== item && other.open) closeFaq(other);
      });
      openFaq(item);
    }
  });
});

/* ---------- Contact form: send through FormSubmit without leaving the page ---------- */

const contactForm = document.querySelector(".contact-form");
const formStatus = contactForm.querySelector(".form-status");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const button = contactForm.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector("span");
  const originalLabel = buttonLabel.textContent;

  button.disabled = true;
  buttonLabel.textContent = "Sending…";
  formStatus.textContent = "";
  formStatus.className = "form-status";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });
    const result = await response.json();

    if (!response.ok || String(result.success) !== "true") {
      throw new Error("FormSubmit did not accept the message");
    }

    contactForm.reset();
    formStatus.textContent = "Thank you! Your message is on its way. I'll reply soon.";
    formStatus.classList.add("is-success");
  } catch {
    formStatus.textContent =
      "Sorry, that didn't send. Please try again, or email me at mystique20084589@gmail.com.";
    formStatus.classList.add("is-error");
  } finally {
    button.disabled = false;
    buttonLabel.textContent = originalLabel;
  }
});

/* ---------- Keep the copyright year current ---------- */

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
