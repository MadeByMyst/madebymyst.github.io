/* MadeByMyst script.js (Overhauled) */

// Scroll progress bar
const scrollProgressBar = document.getElementById("scrollProgress");
function updateScrollProgress() {
  if (!scrollProgressBar) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  scrollProgressBar.style.width = pct + "%";
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });

// Sticky header
const header = document.getElementById("header");
function updateStickyHeader() {
  if (!header) return;
  header.classList.toggle("sticky", window.scrollY > 20);
}
window.addEventListener("scroll", updateStickyHeader, { passive: true });
updateStickyHeader();

// Intersection observer for fade-in
const observerOptions = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      fadeObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".fade, .fade-up").forEach((el) => fadeObserver.observe(el));

// Skill bar animation
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll(".exp-bar-fill").forEach((fill) => {
        // Small delay so CSS transition fires after element is in view
        setTimeout(() => fill.classList.add("animated"), 100);
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const expCard = document.querySelector(".exp-card");
if (expCard) barObserver.observe(expCard);

// Mobile menu
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const mobileBackdrop = document.getElementById("mobile-menu-backdrop");
const mobileClose = document.getElementById("mobile-menu-close");

function openMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileBackdrop.classList.add("is-visible");
  hamburger.classList.add("is-open");
  hamburger.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileBackdrop.classList.remove("is-visible");
  hamburger.classList.remove("is-open");
  hamburger.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (hamburger) {
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mobileMenu.classList.contains("is-open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

if (mobileClose) mobileClose.addEventListener("click", closeMobileMenu);
if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileMenu);

// Close on nav link click
if (mobileMenu) {
  mobileMenu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu?.classList.contains("is-open")) {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && mobileMenu?.classList.contains("is-open")) {
    closeMobileMenu();
  }
});

// FAQ accordion
document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.closest(".faq-item");
    const answer = item.querySelector(".faq-answer");
    const isOpen = item.classList.contains("active");

    // Close all
    document.querySelectorAll(".faq-item.active").forEach((openItem) => {
      openItem.classList.remove("active");
      openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      openItem.querySelector(".faq-answer").style.maxHeight = "0";
    });

    // Open clicked
    if (!isOpen) {
      item.classList.add("active");
      question.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// Contact form
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnSpan = submitBtn?.querySelector("span");
    const originalText = btnSpan?.textContent ?? submitBtn?.textContent ?? "Send message";

    if (submitBtn) {
      submitBtn.disabled = true;
      if (btnSpan) btnSpan.textContent = "Sending…";
    }

    formStatus.textContent = "";
    formStatus.className = "form-status";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (response.ok && (result.success === true || result.success === "true")) {
        formStatus.textContent = "Message sent successfully. I'll be in touch soon!";
        formStatus.classList.add("is-success");
        contactForm.reset();
      } else {
        formStatus.textContent =
          "Could not send. Check FormSubmit activation email and spam folder.";
        formStatus.classList.add("is-error");
      }
    } catch {
      formStatus.textContent = "Network error while sending. Please try again.";
      formStatus.classList.add("is-error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (btnSpan) btnSpan.textContent = originalText;
      }
    }
  });
}

// Back to top
const backToTopBtn = document.getElementById("backToTop");

function updateBackToTop() {
  if (!backToTopBtn) return;
  backToTopBtn.classList.toggle("is-visible", window.scrollY > 480);
}

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
}

// Touch card feedback
const isTouchUI = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const tapTargetSelector = ".service-card, .project-content, .platform-link";

if (isTouchUI) {
  let tapTimeout;
  document.addEventListener("pointerdown", (e) => {
    const card = e.target.closest(tapTargetSelector);
    clearTimeout(tapTimeout);
    document.querySelectorAll(`${tapTargetSelector}.tap-active`).forEach((el) => el.classList.remove("tap-active"));
    if (card) {
      card.classList.add("tap-active");
      tapTimeout = setTimeout(() => card.classList.remove("tap-active"), 700);
    }
  });
}
