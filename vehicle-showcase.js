(() => {
  'use strict';

  const STORAGE_KEY = 'CONCESIONARIOS_VEHICLE_SHOWCASE_V1';
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const mod = (n, m) => ((n % m) + m) % m;

  const defaults = {
    brand: {
      name: 'ATLAS MOTORS',
      kicker: 'PREMIUM ELECTRIC SELECTION',
      titleA: 'Choose the machine',
      titleB: 'that changes the road.',
      closing: 'Reserve the showroom. Own the moment.',
      finalCta: 'Request appointment'
    },
    vehicles: [
      {
        model: 'Tesla Model S',
        title: 'Performance without noise.',
        body: 'Luxury electric sedan with instant torque, long-range confidence and a clean grand touring silhouette.',
        cta: 'Book a private test drive',
        hotspot: 'Performance',
        ghost: 'S',
        image: 'assets/vehicles/tesla-model-s-red.svg'
      },
      {
        model: 'Tesla Model X',
        title: 'Space with presence.',
        body: 'Premium electric SUV with panoramic cabin, family comfort and a showroom-level silhouette.',
        cta: 'Discover Model X',
        hotspot: 'Space',
        ghost: 'X',
        image: 'assets/vehicles/tesla-model-x-white.svg'
      },
      {
        model: 'Tesla Model Y',
        title: 'Everyday electric luxury.',
        body: 'Compact premium SUV with practical range, clean design language and a confident urban stance.',
        cta: 'Request availability',
        hotspot: 'Design',
        ghost: 'Y',
        image: 'assets/vehicles/tesla-model-y-blue.svg'
      }
    ]
  };

  let state = loadState();
  let active = 0;
  let current = 0;
  let target = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartTarget = 0;
  let lockedUntil = 0;
  let copyTimer = null;

  const rail = document.querySelector('[data-rail]');
  const stage = document.querySelector('.vehicle-stage');
  const ghost = document.querySelector('[data-ghost]');
  const modelEl = document.querySelector('[data-vehicle-model]');
  const titleEl = document.querySelector('[data-vehicle-title]');
  const bodyEl = document.querySelector('[data-vehicle-body]');
  const ctaEl = document.querySelector('[data-vehicle-cta]');
  const copyBox = document.querySelector('.vehicle-copy');
  const hotspot = document.querySelector('[data-hotspot]');
  const hotspotTitle = document.querySelector('[data-hotspot-title]');
  const progress = document.querySelector('[data-progress]');
  const studio = document.querySelector('[data-studio]');

  if (!rail || !stage) return;

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored && stored.brand && Array.isArray(stored.vehicles)) return stored;
    } catch (_) {}
    return JSON.parse(JSON.stringify(defaults));
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setPath(path, value) {
    const parts = path.split('.');
    let targetObj = state;
    parts.slice(0, -1).forEach(part => { targetObj = targetObj[part]; });
    targetObj[parts.at(-1)] = value;
    saveState();
    renderBindings();
  }

  function circularDelta(i, base) {
    const count = state.vehicles.length;
    let d = i - base;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  }

  function build() {
    rail.innerHTML = '';
    progress.innerHTML = '';

    state.vehicles.forEach((vehicle, index) => {
      const card = document.createElement('article');
      card.className = 'vehicle-card';
      card.dataset.index = String(index);
      card.innerHTML = `<img src="${vehicle.image}" alt="${vehicle.model}" draggable="false" />`;
      card.addEventListener('click', () => goTo(index));
      rail.appendChild(card);

      const dot = document.createElement('span');
      dot.dataset.index = String(index);
      progress.appendChild(dot);
    });

    renderBindings();
    renderCopy(true);
    bindStudioFields();
  }

  function go(direction) {
    const now = performance.now();
    if (now < lockedUntil) return;
    lockedUntil = now + 460;
    target += direction;
    active = mod(Math.round(target), state.vehicles.length);
    scheduleCopyUpdate();
  }

  function goTo(index) {
    const count = state.vehicles.length;
    const direct = index - active;
    const wrapped = direct > count / 2 ? direct - count : direct < -count / 2 ? direct + count : direct;
    if (wrapped !== 0) {
      target += wrapped;
      active = mod(index, count);
      scheduleCopyUpdate();
    }
  }

  function scheduleCopyUpdate() {
    clearTimeout(copyTimer);
    copyBox?.classList.add('is-changing');
    copyTimer = setTimeout(() => renderCopy(false), 280);
  }

  function renderCopy(immediate = false) {
    const vehicle = state.vehicles[active];
    if (!vehicle) return;
    modelEl.textContent = vehicle.model;
    titleEl.textContent = vehicle.title;
    bodyEl.textContent = vehicle.body;
    ctaEl.textContent = vehicle.cta;
    hotspotTitle.textContent = vehicle.hotspot;
    ghost.textContent = vehicle.ghost || String(active + 1).padStart(2, '0');
    document.querySelectorAll('[data-progress] span').forEach((el, i) => el.classList.toggle('is-active', i === active));
    if (!immediate) requestAnimationFrame(() => copyBox?.classList.remove('is-changing'));
    else copyBox?.classList.remove('is-changing');
    bindVehicleFields();
  }

  function renderBindings() {
    document.querySelectorAll('[data-bind]').forEach(el => {
      const path = el.dataset.bind;
      const value = path.split('.').reduce((acc, part) => acc && acc[part], state);
      if (value != null) el.textContent = value;
    });

    document.querySelectorAll('[data-field]').forEach(input => {
      const value = input.dataset.field.split('.').reduce((acc, part) => acc && acc[part], state);
      if (document.activeElement !== input) input.value = value || '';
    });
  }

  function bindStudioFields() {
    document.querySelectorAll('[data-field]').forEach(input => {
      input.oninput = () => setPath(input.dataset.field, input.value);
    });
    bindVehicleFields();
  }

  function bindVehicleFields() {
    const vehicle = state.vehicles[active];
    document.querySelectorAll('[data-vehicle-field]').forEach(input => {
      const key = input.dataset.vehicleField;
      if (document.activeElement !== input) input.value = vehicle[key] || '';
      input.oninput = () => {
        state.vehicles[active][key] = input.value;
        saveState();
        renderCopy(true);
      };
    });
  }

  function render() {
    current += (target - current) * 0.12;
    const count = state.vehicles.length;
    const cards = [...document.querySelectorAll('.vehicle-card')];
    const viewport = Math.max(900, window.innerWidth);

    cards.forEach((card, index) => {
      const d = circularDelta(index, current);
      const abs = Math.abs(d);
      const dir = Math.sign(d);
      const visible = abs < 2.15;

      const x = d * viewport * 0.56;
      const y = Math.pow(abs, 1.4) * 22;
      const scale = clamp(1 - abs * 0.18, 0.58, 1.04);
      const opacity = clamp(1 - abs * 0.42, 0, 1);
      const blur = abs > 1.2 ? Math.min(4, (abs - 1.2) * 3.5) : 0;
      const brightness = clamp(1 - abs * 0.18, 0.66, 1);
      const rotate = dir * clamp(abs * -1.8, -3, 3);
      const z = String(100 - Math.round(abs * 20));

      card.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) scale(${scale}) rotate(${rotate}deg)`;
      card.style.opacity = visible ? opacity : 0;
      card.style.filter = `brightness(${brightness}) blur(${blur}px)`;
      card.style.zIndex = z;
      card.style.pointerEvents = abs < 0.72 ? 'auto' : 'none';
      card.style.setProperty('--shadow', clamp(1 - abs * 0.36, 0, 1).toFixed(3));
      card.style.setProperty('--shadow-scale', clamp(1 - abs * 0.14, .55, 1).toFixed(3));
      card.dataset.state = abs < 0.48 ? 'active' : abs < 1.45 ? 'neighbour' : 'far';
    });

    const phase = Math.abs(target - current);
    const settle = clamp(1 - phase, 0, 1);
    const activeX = Math.sin(current * Math.PI * 2 / count) * 8;
    hotspot.style.transform = `translate3d(${activeX}px, ${-settle * 4}px, 0)`;
    hotspot.style.opacity = String(clamp(settle + .18, .18, 1));
    ghost.style.transform = `translate(-50%,-50%) translateX(${(target-current)*-22}px)`;
    ghost.style.opacity = String(clamp(.68 + settle * .32, .54, 1));

    requestAnimationFrame(render);
  }

  function onWheel(event) {
    if (Math.abs(event.deltaY) < 10 && Math.abs(event.deltaX) < 10) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    go(delta > 0 ? 1 : -1);
  }

  function onPointerDown(event) {
    dragging = true;
    dragStartX = event.clientX;
    dragStartTarget = target;
    stage.classList.add('is-dragging');
    stage.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (!dragging) return;
    const dx = event.clientX - dragStartX;
    target = dragStartTarget - dx / Math.max(260, window.innerWidth * 0.32);
  }

  function onPointerUp(event) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    stage.releasePointerCapture?.(event.pointerId);
    target = Math.round(target);
    active = mod(Math.round(target), state.vehicles.length);
    scheduleCopyUpdate();
  }

  function bindEvents() {
    document.querySelector('[data-next]')?.addEventListener('click', () => go(1));
    document.querySelector('[data-prev]')?.addEventListener('click', () => go(-1));
    stage.addEventListener('wheel', onWheel, { passive: true });
    stage.addEventListener('pointerdown', onPointerDown, { passive: true });
    stage.addEventListener('pointermove', onPointerMove, { passive: true });
    stage.addEventListener('pointerup', onPointerUp, { passive: true });
    stage.addEventListener('pointercancel', onPointerUp, { passive: true });
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
      if (event.key === 'Enter') hotspot.click();
    });

    document.querySelector('[data-open-studio]')?.addEventListener('click', () => {
      studio.classList.add('is-open');
      studio.setAttribute('aria-hidden', 'false');
      bindVehicleFields();
    });
    document.querySelector('[data-close-studio]')?.addEventListener('click', () => {
      studio.classList.remove('is-open');
      studio.setAttribute('aria-hidden', 'true');
    });
    document.querySelector('[data-export]')?.addEventListener('click', () => {
      document.querySelector('[data-json-output]').value = JSON.stringify(state, null, 2);
    });
    document.querySelector('[data-reset]')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      state = JSON.parse(JSON.stringify(defaults));
      active = 0; current = 0; target = 0;
      build();
    });
  }

  build();
  bindEvents();
  requestAnimationFrame(render);
})();
