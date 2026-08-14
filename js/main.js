// 24 Keys — shared front-end behavior

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initReveal();
  initCarousels();
});

function initNav() {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("solid", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }
}

function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  els.forEach((el) => io.observe(el));
}

function initCarousels() {
  document.querySelectorAll("[data-carousel]").forEach((root) => new Carousel(root));
}

class Carousel {
  constructor(root) {
    this.root = root;
    this.slides = Array.from(root.querySelectorAll(".slide"));
    this.dotsWrap = root.querySelector(".carousel__dots");
    this.indexEl = root.querySelector(".carousel__index .now");
    this.totalEl = root.querySelector(".carousel__index .total");
    this.current = 0;

    if (this.dotsWrap) {
      this.slides.forEach((_, i) => {
        const b = document.createElement("button");
        if (i === 0) b.classList.add("active");
        b.setAttribute("aria-label", `Go to slide ${i + 1}`);
        b.addEventListener("click", () => this.go(i));
        this.dotsWrap.appendChild(b);
      });
      this.dots = Array.from(this.dotsWrap.children);
    }

    const prev = root.querySelector(".carousel__nav.prev");
    const next = root.querySelector(".carousel__nav.next");
    if (prev) prev.addEventListener("click", () => this.go(this.current - 1));
    if (next) next.addEventListener("click", () => this.go(this.current + 1));

    if (this.totalEl) this.totalEl.textContent = String(this.slides.length).padStart(2, "0");
    this.update();

    // touch swipe
    let startX = 0;
    root.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    root.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) this.go(this.current + (dx < 0 ? 1 : -1));
      },
      { passive: true }
    );

    // keyboard when carousel in view
    document.addEventListener("keydown", (e) => {
      const rect = root.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (!inView) return;
      if (e.key === "ArrowRight") this.go(this.current + 1);
      if (e.key === "ArrowLeft") this.go(this.current - 1);
    });
  }

  go(i) {
    const n = this.slides.length;
    this.current = (i + n) % n;
    this.update();
  }

  update() {
    this.slides.forEach((s, i) => s.classList.toggle("active", i === this.current));
    if (this.dots) this.dots.forEach((d, i) => d.classList.toggle("active", i === this.current));
    if (this.indexEl) this.indexEl.textContent = String(this.current + 1).padStart(2, "0");
  }
}
