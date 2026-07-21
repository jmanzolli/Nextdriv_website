// Mobile nav toggle (accessible)
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.setAttribute('aria-expanded', 'false');
  if (links.id) toggle.setAttribute('aria-controls', links.id);

  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    toggle.innerHTML = open ? '&times;' : '&#9776;';
  };

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setOpen(false))
  );
}

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// Count-up metrics
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countObserver.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      if (reduceMotion) {
        el.textContent = target;
        return;
      }
      const duration = 1300;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// Screenshot slideshow (laptop mockup)
document.querySelectorAll('[data-slideshow]').forEach((box) => {
  const slides = Array.from(box.querySelectorAll('.slide'));
  if (slides.length < 2) return;
  const root = box.closest('.container');
  const dotsWrap = root.querySelector('.slide-dots');
  const caption = root.querySelector('.slide-caption');
  let current = 0;
  let timer = null;

  const setCaption = (slide) => {
    if (!caption) return;
    caption.innerHTML =
      '<span class="cap-num">' + slide.dataset.num + '</span><strong>' +
      slide.dataset.title + '</strong> &mdash; ' + slide.dataset.desc;
  };

  const dots = slides.map((slide, k) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', (slide.dataset.title || 'Slide ' + (k + 1)).slice(0, 60));
    if (k === 0) b.classList.add('active');
    b.addEventListener('click', () => {
      show(k);
      restart();
    });
    dotsWrap.appendChild(b);
    return b;
  });

  const show = (n) => {
    const prev = slides[current];
    prev.classList.remove('active');
    dots[current].classList.remove('active');
    if (prev.tagName === 'VIDEO') prev.pause();
    current = (n + slides.length) % slides.length;
    const cur = slides[current];
    cur.classList.add('active');
    dots[current].classList.add('active');
    if (cur.tagName === 'VIDEO' && !reduceMotion) {
      cur.currentTime = 0;
      cur.play().catch(() => {});
    }
    setCaption(cur);
  };

  const restart = () => {
    if (timer) clearTimeout(timer);
    if (reduceMotion) return;
    const cur = slides[current];
    if (cur.tagName !== 'VIDEO') {
      timer = setTimeout(() => {
        show(current + 1);
        restart();
      }, 5000);
    } else {
      // video advances on 'ended'; safety timer covers blocked autoplay
      const ms = (isFinite(cur.duration) && cur.duration > 0 ? cur.duration : 36) * 1000 + 5000;
      timer = setTimeout(() => {
        show(current + 1);
        restart();
      }, ms);
    }
  };

  slides.forEach((s) => {
    if (s.tagName === 'VIDEO') {
      s.addEventListener('ended', () => {
        if (slides[current] === s) {
          show(current + 1);
          restart();
        }
      });
    }
  });

  setCaption(slides[0]);
  if (slides[0].tagName === 'VIDEO' && !reduceMotion) slides[0].play().catch(() => {});
  // retry playback when the slideshow becomes visible (autoplay may be deferred)
  const visObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const cur = slides[current];
      if (e.isIntersecting && cur.tagName === 'VIDEO' && cur.paused && !reduceMotion) {
        cur.play().catch(() => {});
      }
    });
  }, { threshold: 0.3 });
  visObserver.observe(box);
  restart();
});

// Laptop lid follows scroll: opens on the way down, closes on the way up
document.querySelectorAll('.laptop').forEach((laptop) => {
  if (reduceMotion) return;
  const screen = laptop.querySelector('.laptop-screen');
  let ticking = false;
  const CLOSED_ANGLE = -72;
  const update = () => {
    ticking = false;
    const rect = laptop.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the laptop top is near the bottom edge, 1 once it reaches ~40% up
    const progress = Math.min(1, Math.max(0, (vh * 0.92 - rect.top) / (vh * 0.55)));
    const eased = 1 - Math.pow(1 - progress, 2.2);
    screen.style.transform = 'rotateX(' + (CLOSED_ANGLE * (1 - eased)).toFixed(2) + 'deg)';
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
});


// Plan / Operate mobile tabs
document.querySelectorAll('.mod-mobile').forEach((box) => {
  const tabs = box.querySelectorAll('.mod-tab');
  const panes = box.querySelectorAll('.mod-pane');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
      });
      panes.forEach((p) => {
        const on = p.dataset.pane === tab.dataset.pane;
        p.classList.toggle('active', on);
        p.hidden = !on;
      });
    });
  });
});
