import { ArrowRight, ArrowUp, ArrowUpRight, Mail, Menu, Play, Quote, X, createIcons } from "lucide";
import { masonryItems, projects, showreel, socialLinks, videoProjects } from "../data/projects.js";
import { renderMasonry, renderProjectGrid, renderShowreel, renderSocialLinks, renderVideoShowcase } from "./components.js";
import { initProjectFilters } from "./projects.js";

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(pointer: fine)");
const siteIcons = {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Mail,
  Menu,
  Play,
  Quote,
  X
};

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])"));
}

function initIcons() {
  createIcons({ icons: siteIcons });
}

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const menuClose = document.getElementById("menuClose");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!menuToggle || !menuClose || !mobileMenu) return;

  let lastFocusedElement = null;

  function openMenu() {
    lastFocusedElement = document.activeElement;
    mobileMenu.classList.remove("translate-x-full");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    menuToggle.setAttribute("aria-expanded", "true");
    menuClose.focus();
  }

  function closeMenu() {
    mobileMenu.classList.add("translate-x-full");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    menuToggle.setAttribute("aria-expanded", "false");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  menuToggle.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  document.querySelectorAll(".mobile-link").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (mobileMenu.getAttribute("aria-hidden") === "true") return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = getFocusableElements(mobileMenu);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

function initScrollUI() {
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");
  if (!header || !backToTop) return;

  function updateScrollState() {
    const y = window.scrollY;
    header.classList.toggle("bg-obsidian/90", y > 40);
    header.classList.toggle("border-white/10", y > 40);
    backToTop.classList.toggle("opacity-0", y <= 600);
    backToTop.classList.toggle("pointer-events-none", y <= 600);
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotionQuery.matches ? "auto" : "smooth" }));
}

function initReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => element.classList.add("in-view"));
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  revealItems.forEach((element) => revealObserver.observe(element));
}

function initProcessSteps() {
  const steps = document.querySelectorAll(".process-step");
  if (!("IntersectionObserver" in window)) {
    steps.forEach((step) => step.classList.add("active"));
    return;
  }

  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("active", entry.isIntersecting);
    });
  }, { threshold: 0.55 });

  steps.forEach((element) => processObserver.observe(element));
}

function initVideoPausing() {
  const videos = document.querySelectorAll("video");
  if (!("IntersectionObserver" in window)) return;

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) entry.target.pause();
    });
  }, { threshold: 0.15 });

  videos.forEach((video) => videoObserver.observe(video));
}

function initCustomCursor() {
  if (!finePointerQuery.matches || reduceMotionQuery.matches) return;

  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (!dot || !ring) return;

  document.body.classList.add("has-custom-cursor");
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    window.requestAnimationFrame(animateRing);
  }

  animateRing();
}

function bindCursorHoverTargets() {
  const ring = document.getElementById("cursorRing");
  if (!ring || !document.body.classList.contains("has-custom-cursor")) return;

  document.querySelectorAll(".cursor-hover").forEach((element) => {
    element.addEventListener("mouseenter", () => ring.classList.add("hovered"));
    element.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
  });
}

function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  if (!contactForm || !formStatus) return;

  const fields = {
    name: contactForm.elements.namedItem("name"),
    email: contactForm.elements.namedItem("email"),
    projectType: contactForm.elements.namedItem("projectType"),
    message: contactForm.elements.namedItem("message")
  };

  function setError(field, message) {
    const error = document.getElementById(`cf-${field === "projectType" ? "type" : field}-error`);
    if (!error) return;
    error.textContent = message;
    error.classList.toggle("hidden", !message);
  }

  function validate() {
    let isValid = true;
    let firstInvalidField = null;
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();

    setError("name", "");
    setError("email", "");
    setError("projectType", "");
    setError("message", "");

    if (name.length < 2) {
      setError("name", "Enter your name.");
      firstInvalidField = firstInvalidField || fields.name;
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("email", "Enter a valid email.");
      firstInvalidField = firstInvalidField || fields.email;
      isValid = false;
    }

    if (!fields.projectType.value) {
      setError("projectType", "Choose a project type.");
      firstInvalidField = firstInvalidField || fields.projectType;
      isValid = false;
    }

    if (message.length < 10) {
      setError("message", "Write at least 10 characters.");
      firstInvalidField = firstInvalidField || fields.message;
      isValid = false;
    }

    return { isValid, firstInvalidField };
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.classList.add("hidden");

    const validation = validate();
    if (!validation.isValid) {
      formStatus.textContent = "Please fix the highlighted fields.";
      formStatus.className = "font-mono text-xs text-red-400";
      validation.firstInvalidField.focus();
      return;
    }

    // TODO: Connect Formspree / EmailJS / custom API.
    formStatus.textContent = "Message ready to send - connect this form to your email service to receive it.";
    formStatus.className = "font-mono text-xs text-acid";
    contactForm.reset();
  });
}

function initActiveNavigation() {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        if (isCurrent) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
  }, { rootMargin: "-35% 0px -60% 0px", threshold: 0.01 });

  sections.forEach((section) => observer.observe(section));
}

function init() {
  renderShowreel(showreel);
  renderProjectGrid(projects);
  renderVideoShowcase(videoProjects);
  renderMasonry(masonryItems);
  renderSocialLinks(socialLinks);

  initIcons();
  initMobileMenu();
  initScrollUI();
  initReveal();
  initProcessSteps();
  initProjectFilters();
  initVideoPausing();
  initCustomCursor();
  bindCursorHoverTargets();
  initContactForm();
  initActiveNavigation();
}

init();
