/* =========================================================================
 * TODO: completa estos datos. Todo lo visible en la página sale de aquí.
 * Ojo: el <title>/Open Graph de index.html y el archivo invitacion.ics
 * son estáticos; si cambias nombre, fecha u hora, edítalos también.
 * ========================================================================= */
const EVENTO = {
  nombre: 'Emilio',                       // TODO
  edad: 32,                               // TODO
  frase: 'Una noche para brindar, conversar y celebrar sin apuro.',          // TODO
  descripcion: 'Cumplo 32 y quiero celebrarlo con las personas que hacen que valga la pena. ' +
    'Habrá buena música, algo rico para picar y un brindis a medianoche.',   // TODO
  vestimenta: 'Elegante sport. Tonos oscuros, si te animas.',                // TODO
  nota: 'Trae tu mejor ánimo. Si vienes en auto, hay estacionamiento en la calle.', // TODO
  firma: 'Con cariño, Emilio',            // TODO
  lugar: 'Casa de Emilio',                // TODO

  // Hora local del evento (zona horaria indicada abajo), formato AAAA-MM-DDTHH:MM
  inicio: '2026-10-23T21:00',
  fin: '2026-10-24T02:00',                // TODO: hora de término (solo para el calendario)
  zonaHoraria: 'America/Santiago',

  direccion: 'Pasaje Monte Morelos 155, Maipú, Chile',
  // TODO (opcional): coordenadas exactas. Si las pones, Apple Maps, Waze y Uber
  // apuntan al punto exacto en vez de buscar la dirección por texto.
  lat: null,                              // ej. -33.5xxxxx
  lng: null,                              // ej. -70.7xxxxx

  whatsapp: '56974972688',
  mensajeWhatsApp: '¡Hola! Confirmo que voy a tu cumpleaños el viernes 23 de octubre a las 21:00. 🥂', // TODO
};

/* ========================================================================= */

(() => {
  'use strict';

  /* ---------- Fechas con zona horaria ---------- */

  // Diferencia (ms) entre la hora local de `timeZone` y UTC en el instante `ts`.
  function tzOffset(ts, timeZone) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(ts));
    const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    return Date.UTC(+v.year, v.month - 1, +v.day, +v.hour % 24, +v.minute, +v.second) - ts;
  }

  // '2026-10-23T21:00' en America/Santiago -> Date (instante absoluto).
  function zonedToDate(local, timeZone) {
    const [d, t] = local.split('T');
    const [y, m, day] = d.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    const guess = Date.UTC(y, m - 1, day, hh, mm);
    let ts = guess - tzOffset(guess, timeZone);
    ts = guess - tzOffset(ts, timeZone); // corrige si cae junto a un cambio de horario
    return new Date(ts);
  }

  const inicio = zonedToDate(EVENTO.inicio, EVENTO.zonaHoraria);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmt = (opts) => new Intl.DateTimeFormat('es-CL', { timeZone: EVENTO.zonaHoraria, ...opts }).format(inicio);

  const fechaLarga = cap(fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).replace(',', ''));
  const diaMes = fmt({ weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
  const hora = `${fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })} hrs`;

  /* ---------- Textos ---------- */

  const textos = {
    ...EVENTO,
    fechaLarga,
    hora,
    fechaCorta: `${cap(diaMes)} · ${hora}`,
  };
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const v = textos[el.dataset.bind];
    if (v !== undefined && v !== null) el.textContent = String(v);
  });

  /* ---------- Enlaces ---------- */

  const enc = encodeURIComponent;
  const dir = enc(EVENTO.direccion);
  const conCoords = Number.isFinite(EVENTO.lat) && Number.isFinite(EVENTO.lng);
  const ll = conCoords ? `${EVENTO.lat},${EVENTO.lng}` : '';

  // WhatsApp — https://faq.whatsapp.com/5913398998672934
  document.querySelectorAll('[data-whatsapp]').forEach((a) => {
    a.href = `https://wa.me/${EVENTO.whatsapp}?text=${enc(EVENTO.mensajeWhatsApp)}`;
  });

  // Google Calendar: fechas en hora local + ctz para fijar la zona horaria.
  const gcalFecha = (s) => s.replace(/[-:]/g, '') + '00';
  const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${enc(`Cumpleaños de ${EVENTO.nombre}`)}` +
    `&dates=${gcalFecha(EVENTO.inicio)}/${gcalFecha(EVENTO.fin)}` +
    `&ctz=${enc(EVENTO.zonaHoraria)}` +
    `&details=${enc(`${EVENTO.descripcion}\n\nVestimenta: ${EVENTO.vestimenta}\n\n${location.href.split('#')[0]}`)}` +
    `&location=${dir}`;
  document.querySelectorAll('[data-gcal]').forEach((a) => { a.href = gcal; });

  // Mapas y transporte (formatos documentados por cada app)
  const mapas = {
    // https://developers.google.com/maps/documentation/urls/get-started
    google: `https://www.google.com/maps/dir/?api=1&destination=${dir}`,
    // https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
    apple: conCoords ? `https://maps.apple.com/?daddr=${ll}&q=${dir}` : `https://maps.apple.com/?daddr=${dir}`,
    // https://developers.google.com/waze/deeplinks
    waze: conCoords ? `https://waze.com/ul?ll=${ll}&navigate=yes` : `https://waze.com/ul?q=${dir}&navigate=yes`,
    // https://developer.uber.com/docs/riders/ride-requests/tutorials/deep-links/introduction
    uber: 'https://m.uber.com/ul/?action=setPickup&pickup=my_location' +
      `&dropoff[nickname]=${enc(EVENTO.lugar)}&dropoff[formatted_address]=${dir}` +
      (conCoords ? `&dropoff[latitude]=${EVENTO.lat}&dropoff[longitude]=${EVENTO.lng}` : ''),
  };
  document.querySelectorAll('[data-map]').forEach((a) => {
    const url = mapas[a.dataset.map];
    if (url) a.href = url;
  });

  /* ---------- Cuenta regresiva ---------- */

  const cd = document.querySelector('[data-countdown]');
  const done = document.querySelector('[data-countdown-done]');
  const unidades = {};
  document.querySelectorAll('[data-unit]').forEach((el) => { unidades[el.dataset.unit] = el; });
  const dos = (n) => String(n).padStart(2, '0');
  let timer;

  function tick() {
    const ms = inicio.getTime() - Date.now();
    if (ms <= 0) {
      clearInterval(timer);
      cd.hidden = true;
      done.hidden = false;
      done.textContent = '¡Llegó la hora! Te esperamos.';
      return;
    }
    const s = Math.ceil(ms / 1000);
    const valores = {
      dias: Math.floor(s / 86400),
      horas: dos(Math.floor((s % 86400) / 3600)),
      minutos: dos(Math.floor((s % 3600) / 60)),
      segundos: dos(s % 60),
    };
    for (const k in valores) {
      const v = String(valores[k]);
      if (unidades[k].textContent !== v) unidades[k].textContent = v;
    }
    cd.setAttribute('aria-label',
      `Faltan ${valores.dias} días, ${+valores.horas} horas y ${+valores.minutos} minutos`);
  }
  tick();
  timer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

  /* ---------- Hojas (dialog) ---------- */

  document.querySelectorAll('[data-open]').forEach((btn) => {
    const dlg = document.getElementById(btn.dataset.open);
    if (!dlg) return;
    btn.addEventListener('click', () => {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    });
  });

  document.querySelectorAll('dialog.sheet').forEach((dlg) => {
    const cerrar = () => (typeof dlg.close === 'function' ? dlg.close() : dlg.removeAttribute('open'));
    dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', cerrar));
    // Clic en el fondo (fuera del panel) cierra la hoja.
    dlg.addEventListener('click', (e) => { if (e.target === dlg) cerrar(); });
    // Al elegir una opción, cierra la hoja.
    dlg.querySelectorAll('.sheet__item').forEach((a) => a.addEventListener('click', () => setTimeout(cerrar, 150)));
  });

  /* ---------- Aparición al hacer scroll ---------- */

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  }
})();
