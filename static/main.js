const header = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const navLinks = document.querySelectorAll("[data-navlink]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const faqItems = document.querySelectorAll(".faq-item");
const testimonials = document.querySelectorAll(".testimonial");
const prevButton = document.getElementById("prevTestimonial");
const nextButton = document.getElementById("nextTestimonial");
const parallaxCard = document.querySelector("[data-parallax]");
const pricingToggle = document.getElementById("pricingToggle");
const leadForms = document.querySelectorAll(".lead-form");

const pricingPlans = {
  course: {
    title: "Luxury Asset Operator Program",
    amount: "$2,500",
    detail: "Self-paced program, strategic frameworks, operating checklists, and monetization guidance.",
  },
  "course-plus": {
    title: "Operator Program + Advisory Sprint",
    amount: "$6,800",
    detail: "Program access plus private implementation sessions for buyers who want tailored strategic support.",
  },
};

let testimonialIndex = 0;

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 24);
};

const toggleMobileMenu = () => {
  if (!menuToggle || !mobileNav) return;
  const isOpen = mobileNav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("menu-open", isOpen);
};

const closeMobileMenu = () => {
  if (!menuToggle || !mobileNav) return;
  mobileNav.classList.remove("is-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

const smoothScroll = (event) => {
  const href = event.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;
  const target = document.querySelector(href);
  if (!target) return;
  event.preventDefault();
  closeMobileMenu();
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const activateNavLink = () => {
  const sections = document.querySelectorAll("main section[id]");
  let currentSection = "";

  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 120) {
      currentSection = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;
    link.classList.toggle("active", href === `#${currentSection}`);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const counter = entry.target;
      const target = Number(counter.dataset.target || 0);
      const duration = 1200;
      const startTime = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        counter.textContent = Math.floor(progress * target);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      };

      requestAnimationFrame(tick);
      counterObserver.unobserve(counter);
    });
  },
  { threshold: 0.6 }
);

const setTestimonial = (index) => {
  if (!testimonials.length) return;
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  testimonials.forEach((testimonial, currentIndex) => {
    testimonial.classList.toggle("active", currentIndex === testimonialIndex);
  });
};

const setupFAQ = () => {
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");
    if (!button) return;
    button.addEventListener("click", () => item.classList.toggle("open"));
  });
};

const setupPricingToggle = () => {
  if (!pricingToggle) return;

  const title = document.getElementById("pricingTitle");
  const amount = document.getElementById("pricingAmount");
  const detail = document.getElementById("pricingDetail");
  const options = pricingToggle.querySelectorAll(".toggle-option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const plan = pricingPlans[option.dataset.plan];
      if (!plan || !title || !amount || !detail) return;

      options.forEach((item) => item.classList.remove("active"));
      option.classList.add("active");
      title.textContent = plan.title;
      amount.textContent = plan.amount;
      detail.textContent = plan.detail;
    });
  });
};

const validateForm = (form) => {
  const fields = form.querySelectorAll("input[required], select[required], textarea[required]");
  let isValid = true;

  fields.forEach((field) => {
    const value = field.value.trim();
    const type = field.getAttribute("type");
    let fieldValid = Boolean(value);

    if (type === "email" && value) {
      fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    if (field.name === "message" && value) {
      fieldValid = value.length >= 20;
    }

    field.classList.toggle("invalid", !fieldValid);
    if (!fieldValid) isValid = false;
  });

  return isValid;
};

const setupForms = () => {
  leadForms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!validateForm(form)) {
        event.preventDefault();
      }
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("invalid"));
      field.addEventListener("change", () => field.classList.remove("invalid"));
    });
  });
};

const setupParallax = () => {
  if (!parallaxCard) return;
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 18;
    parallaxCard.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
};

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMobileMenu);
}

navLinks.forEach((link) => link.addEventListener("click", smoothScroll));
revealItems.forEach((item) => revealObserver.observe(item));
counters.forEach((counter) => counterObserver.observe(counter));

if (prevButton) {
  prevButton.addEventListener("click", () => setTestimonial(testimonialIndex - 1));
}

if (nextButton) {
  nextButton.addEventListener("click", () => setTestimonial(testimonialIndex + 1));
}

if (testimonials.length) {
  setTestimonial(0);
  window.setInterval(() => setTestimonial(testimonialIndex + 1), 6000);
}

setupFAQ();
setupPricingToggle();
setupForms();
setupParallax();
syncHeader();
activateNavLink();

window.addEventListener("scroll", () => {
  syncHeader();
  activateNavLink();
});
