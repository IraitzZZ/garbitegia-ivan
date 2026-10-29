/* ==========================================================================
   Garbitegia Ivan — Interacciones
   ========================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Header
     ---------------------------------------------------------------------- */

  const header = document.getElementById("siteHeader");
  const progressBar = document.getElementById("scrollProgress");
  let scrollTicking = false;

  const updateScrollUI = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 12);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    }

    scrollTicking = false;
  };

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollUI);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });

  /* ------------------------------------------------------------------------
     Menú móvil
     ---------------------------------------------------------------------- */

  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const pageMain = document.querySelector("main");
  const pageFooter = document.querySelector(".site-footer");

  const setMenu = (open) => {
    if (!burger || !mobileMenu) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    if (pageMain) pageMain.toggleAttribute("inert", open);
    if (pageFooter) pageFooter.toggleAttribute("inert", open);

    if (open) {
      const firstLink = mobileMenu.querySelector("a");
      if (firstLink) {
        window.setTimeout(() => firstLink.focus({ preventScroll: true }), 420);
      }
    }
  };

  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        setMenu(false);
        burger.focus();
      }
    });

    mobileMenu.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        mobileMenu.querySelectorAll('a[href], button:not([disabled])')
      );
      if (!focusable.length) return;

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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024 && mobileMenu.classList.contains("is-open")) {
        setMenu(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Aparición al hacer scroll
     ---------------------------------------------------------------------- */

  const revealItems = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.delay || 0);
          el.style.transitionDelay = delay ? `${delay * 90}ms` : "";
          el.classList.add("is-revealed");
          revealObserver.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("is-revealed"));
  }

  /* ------------------------------------------------------------------------
     Contadores
     ---------------------------------------------------------------------- */

  const counters = document.querySelectorAll("[data-count]");
  let countersStarted = false;

  const runCounters = () => {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach((el) => {
      const target = Number(el.dataset.count || 0);
      if (!target || prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }

      const duration = 1300;
      const start = performance.now();
      const pad = String(target).length;

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        el.textContent = String(value).padStart(pad, "0");
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = String(target);
      };

      requestAnimationFrame(tick);
    });
  };

  const stats = document.querySelector(".stats");

  if (stats) {
    if ("IntersectionObserver" in window) {
      const statsObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runCounters();
              statsObserver.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );
      statsObserver.observe(stats);
    } else {
      runCounters();
    }
  }

  /* ------------------------------------------------------------------------
     Estado abierto / cerrado (hora de Madrid)
     ---------------------------------------------------------------------- */

  const heroStatusText = document.querySelector(".hero__status [data-status-text]");
  const heroStatus = document.getElementById("openStatus");
  const topbarStatus = document.querySelector("[data-topbar-status]");
  const topbarNote = document.querySelector(".topbar__note");
  const pills = document.querySelectorAll(".status-pill");

  const updateOpenStatus = () => {
    let minutes = null;

    try {
      const formatter = new Intl.DateTimeFormat("es-ES", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
      const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
      minutes = hour * 60 + minute;
    } catch (error) {
      const now = new Date();
      minutes = now.getHours() * 60 + now.getMinutes();
    }

    const isOpen = minutes >= 8 * 60 && minutes < 22 * 60;

    if (heroStatusText) {
      heroStatusText.textContent = isOpen
        ? "Abierto ahora · último lavado 21:00"
        : "Cerrado ahora · abre a las 8:00";
    }

    if (heroStatus) heroStatus.toggleAttribute("data-closed", !isOpen);

    if (topbarStatus) {
      topbarStatus.textContent = isOpen
        ? "Abierto ahora · 8:00–22:00"
        : "Cerrado ahora · abre a las 8:00";
    }

    if (topbarNote) topbarNote.toggleAttribute("data-closed", !isOpen);

    pills.forEach((pill) => {
      const label = pill.querySelector("[data-status-text]");
      if (label) label.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
      pill.toggleAttribute("data-closed", !isOpen);
    });
  };

  updateOpenStatus();
  window.setInterval(updateOpenStatus, 60000);

  /* ------------------------------------------------------------------------
     Acordeón
     ---------------------------------------------------------------------- */

  const accordion = document.querySelector(".accordion");

  if (accordion) {
    const triggers = Array.from(accordion.querySelectorAll(".accordion__trigger"));

    const setPanel = (trigger, open) => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      trigger.setAttribute("aria-expanded", String(open));
      if (panel) panel.classList.toggle("is-open", open);
    };

    triggers.forEach((trigger) => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      if (panel && trigger.getAttribute("aria-expanded") === "true") {
        panel.classList.add("is-open");
      }

      trigger.addEventListener("click", () => {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        triggers.forEach((other) => setPanel(other, false));
        setPanel(trigger, !isOpen);
      });
    });
  }

  /* ------------------------------------------------------------------------
     Scroll spy
     ---------------------------------------------------------------------- */

  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length) {
    let spyTicking = false;

    const setActiveSection = () => {
      const marker = window.scrollY + 160;
      let currentId = sections[0] ? sections[0].id : "";

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top + window.scrollY <= marker) {
          currentId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      spyTicking = false;
    };

    const onSpyScroll = () => {
      if (spyTicking) return;
      spyTicking = true;
      window.requestAnimationFrame(setActiveSection);
    };

    window.addEventListener("scroll", onSpyScroll, { passive: true });
    window.addEventListener("resize", onSpyScroll, { passive: true });
    setActiveSection();
  }

  /* ------------------------------------------------------------------------
     Galería
     ---------------------------------------------------------------------- */

  const galleryGrid = document.getElementById("galleryGrid");
  const galleryFilters = Array.from(document.querySelectorAll("[data-filter]"));

  if (galleryGrid && galleryFilters.length) {
    const tiles = Array.from(galleryGrid.querySelectorAll("[data-sede]"));
    let currentFilter = "all";

    galleryFilters.forEach((button) => {
      const filter = button.dataset.filter;
      const count =
        filter === "all"
          ? tiles.length
          : tiles.filter((tile) => tile.dataset.sede === filter).length;
      const badge = button.querySelector("span");
      if (badge) badge.textContent = String(count);
    });

    const applyFilter = (value) => {
      if (value === currentFilter) return;
      currentFilter = value;

      let visibleIndex = 0;

      tiles.forEach((tile) => {
        const matches = value === "all" || tile.dataset.sede === value;
        tile.hidden = !matches;
        tile.classList.remove("is-anim");

        if (matches) {
          tile.style.setProperty("--i", String(visibleIndex));
          visibleIndex += 1;
          void tile.offsetWidth; // reinicia la animación de entrada
          tile.classList.add("is-anim");
        }
      });

      galleryFilters.forEach((button) => {
        const active = button.dataset.filter === value;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };

    galleryFilters.forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.filter));
    });
  }

  /* ------------------------------------------------------------------------
     Vídeos
     ---------------------------------------------------------------------- */

  const heroVideo = document.getElementById("heroVideo");

  const startHeroVideo = () => {
    if (!heroVideo || prefersReducedMotion) return;

    const connection = navigator.connection;
    if (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || ""))) {
      return;
    }

    const source = heroVideo.querySelector("source[data-src]");
    if (!source || heroVideo.dataset.loaded === "true") return;

    heroVideo.dataset.loaded = "true";
    source.src = source.dataset.src;
    heroVideo.load();

    const attempt = heroVideo.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.catch(() => {
        /* El póster sigue siendo válido si el navegador bloquea la reproducción. */
      });
    }
  };

  const scheduleHeroVideo = () => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(startHeroVideo, { timeout: 2500 });
    } else {
      window.setTimeout(startHeroVideo, 900);
    }
  };

  if (document.readyState === "complete") {
    scheduleHeroVideo();
  } else {
    window.addEventListener("load", scheduleHeroVideo, { once: true });
  }

  const ritualVideo = document.getElementById("ritualVideo");
  const videoToggle = document.getElementById("videoToggle");

  if (ritualVideo && videoToggle) {
    ritualVideo.muted = true;

    const setVideoState = (playing) => {
      videoToggle.classList.toggle("is-paused", !playing);
      videoToggle.setAttribute("aria-pressed", String(!playing));
      videoToggle.setAttribute("aria-label", playing ? "Pausar vídeo" : "Reproducir vídeo");
    };

    const playVideo = () => {
      const attempt = ritualVideo.play();
      if (attempt && typeof attempt.then === "function") {
        attempt
          .then(() => setVideoState(true))
          .catch(() => setVideoState(false));
      } else {
        setVideoState(true);
      }
    };

    if (!prefersReducedMotion) {
      if ("IntersectionObserver" in window) {
        const videoObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) playVideo();
              else ritualVideo.pause();
            });
          },
          { threshold: 0.4 }
        );
        videoObserver.observe(ritualVideo);
      } else {
        playVideo();
      }
    }

    videoToggle.addEventListener("click", () => {
      if (ritualVideo.paused) playVideo();
      else {
        ritualVideo.pause();
        setVideoState(false);
      }
    });

    ritualVideo.addEventListener("play", () => setVideoState(true));
    ritualVideo.addEventListener("pause", () => setVideoState(false));
    setVideoState(!ritualVideo.paused);
  }

  /* ------------------------------------------------------------------------
     Mapas (Leaflet + OpenStreetMap)
     ---------------------------------------------------------------------- */

  const mapConfigs = [
    {
      id: "mapEibar",
      name: "Garbitegia Ivan · Eibar",
      address: "Urkizu Pasealekua Ibilbidea, 20600 Eibar",
      coords: [43.1866689, -2.463282],
      link: "https://www.google.com/maps/dir/?api=1&destination=Urkizu+Pasealekua+Ibilbidea,+20600+Eibar,+Gipuzkoa",
    },
    {
      id: "mapErmua",
      name: "Garbitegia Ivan · Ermua",
      address: "San Isidro Kalea, 5, bajo 3, 48260 Ermua",
      coords: [43.1873227, -2.5016709],
      link: "https://www.google.com/maps/dir/?api=1&destination=San+Isidro+Kalea+5,+48260+Ermua,+Bizkaia",
    },
  ];

  /*
   * Teselas de OpenStreetMap, sin claves de API ni marca de agua. Si el primer
   * servidor no responde, se prueba el siguiente y, si ninguno lo hace, se
   * muestra un fallback útil con la dirección y el enlace a Google Maps.
   */
  const tileProviders = [
    {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      },
    },
    {
      url: "https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        subdomains: "abc",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · OSM Francia',
      },
    },
  ];

  const renderMapFallback = (el, config) => {
    el.innerHTML = `
      <div class="map-fallback">
        <span class="map-fallback__label">Mapa no disponible</span>
        <span>${config.address}</span>
        <a href="${config.link}" target="_blank" rel="noopener">Abrir en Google Maps</a>
      </div>`;
  };

  const mountMap = (el, config, providerIndex) => {
    const provider = tileProviders[providerIndex];
    let map;

    try {
      map = window.L.map(el, {
        center: config.coords,
        zoom: 17,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: true,
      });
    } catch (error) {
      renderMapFallback(el, config);
      return;
    }

    // La capa se añade después de registrar los eventos: si las teselas ya
    // están en caché, `tileload` puede dispararse antes de suscribirse.
    const layer = window.L.tileLayer(provider.url, provider.options);

    let tilesLoaded = 0;
    let tilesFailed = 0;
    let settled = false;
    let watchdog = 0;

    const giveUp = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(watchdog);
      try {
        map.remove();
      } catch (error) {
        /* la instancia ya no existe */
      }

      if (providerIndex + 1 < tileProviders.length) {
        mountMap(el, config, providerIndex + 1);
      } else {
        renderMapFallback(el, config);
      }
    };

    layer.on("tileload", () => {
      tilesLoaded += 1;
      if (tilesLoaded >= 2) {
        settled = true;
        window.clearTimeout(watchdog);
      }
    });

    layer.on("tileerror", () => {
      tilesFailed += 1;
      if (tilesFailed >= 4 && tilesLoaded === 0) giveUp();
    });

    layer.addTo(map);

    // Red que bloquea o deja colgadas las teselas: no llega ni un error.
    watchdog = window.setTimeout(() => {
      if (tilesLoaded === 0) giveUp();
    }, 12000);

    window.L.control.zoom({ position: "bottomright" }).addTo(map);

    const icon = window.L.divIcon({
      className: "",
      html: '<span class="map-marker"></span>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -18],
    });

    window.L.marker(config.coords, { icon, title: config.name })
      .addTo(map)
      .bindTooltip("Garbitegia Ivan", {
        permanent: true,
        direction: "top",
        offset: [0, -16],
        className: "map-tooltip",
      })
      .bindPopup(
        `<strong>${config.name}</strong>${config.address}<br><a href="${config.link}" target="_blank" rel="noopener">Cómo llegar →</a>`
      );

    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());

    window.setTimeout(() => {
      if (map.getContainer()) map.invalidateSize();
    }, 500);

    window.addEventListener("resize", () => {
      if (map.getContainer()) map.invalidateSize();
    });
  };

  let leafletPromise = null;

  const loadLeaflet = () => {
    if (typeof window.L !== "undefined") return Promise.resolve();
    if (leafletPromise) return leafletPromise;

    leafletPromise = new Promise((resolve, reject) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "assets/vendor/leaflet.css";

      const cssReady = new Promise((cssResolve) => {
        css.addEventListener("load", cssResolve, { once: true });
        css.addEventListener("error", cssResolve, { once: true });
      });

      document.head.appendChild(css);

      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = "https://tile.openstreetmap.org";
      document.head.appendChild(preconnect);

      const script = document.createElement("script");
      script.src = "assets/vendor/leaflet.js";
      script.async = true;
      script.addEventListener(
        "load",
        () => {
          cssReady.then(() => resolve());
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => reject(new Error("Leaflet no disponible")),
        { once: true }
      );
      document.head.appendChild(script);
    });

    return leafletPromise;
  };

  const initMaps = () => {
    loadLeaflet()
      .then(() => {
        mapConfigs.forEach((config) => {
          const el = document.getElementById(config.id);
          if (el) mountMap(el, config, 0);
        });
      })
      .catch(() => {
        mapConfigs.forEach((config) => {
          const el = document.getElementById(config.id);
          if (el) renderMapFallback(el, config);
        });
      });
  };

  let mapsStarted = false;

  const startMaps = () => {
    if (mapsStarted) return;
    mapsStarted = true;
    initMaps();
  };

  const mapTargets = [
    document.getElementById("sedes"),
    ...document.querySelectorAll(".loc-card__map"),
  ].filter(Boolean);

  if (mapTargets.length && "IntersectionObserver" in window) {
    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          startMaps();
          mapObserver.disconnect();
        });
      },
      { rootMargin: "700px 0px" }
    );
    mapTargets.forEach((target) => mapObserver.observe(target));
  } else {
    startMaps();
  }

  document
    .querySelectorAll('a[href="#sedes"], a[href="#eibar"], a[href="#ermua"]')
    .forEach((link) => {
      link.addEventListener("click", startMaps);
    });

  window.addEventListener("hashchange", () => {
    if (["#sedes", "#eibar", "#ermua"].includes(window.location.hash)) startMaps();
  });

  /* ------------------------------------------------------------------------
     Buscador de carga
     ---------------------------------------------------------------------- */

  const loadFinder = document.querySelector("[data-load-finder]");

  if (loadFinder) {
    const loads = {
      edredon: {
        kg: 16,
        fill: 0.9,
        title: "Lavadora de 16 kg",
        desc: "Edredón de matrimonio, nórdico o manta grande. Una sola tanda, sin apretar.",
        tip: "Programa para voluminosos y secado a temperatura media.",
      },
      cama: {
        kg: 12,
        fill: 0.72,
        title: "Lavadora de 12 kg",
        desc: "Juego de cama completo y cuatro toallas. Cabe holgado.",
        tip: "Separa sábanas de toallas si quieres un secado más rápido.",
      },
      semanal: {
        kg: 12,
        fill: 0.86,
        title: "Lavadora de 12 kg",
        desc: "Ropa de dos personas para una semana. Si llenas hasta arriba, pasa a la de 16 kg.",
        tip: "Llena el tambor sin apretar: la ropa necesita moverse.",
      },
      diario: {
        kg: 10,
        fill: 0.5,
        title: "Lavadora de 10 kg",
        desc: "Ropa de una persona para tres o cuatro días, más algo de ropa de casa.",
        tip: "Para poca ropa, elige el programa corto y ahorra tiempo.",
      },
      delicado: {
        kg: 10,
        fill: 0.4,
        title: "Lavadora de 10 kg",
        desc: "Camisas, punto, lana y prendas que piden un trato suave.",
        tip: "Usa una red para las prendas pequeñas y el programa delicado.",
      },
    };

    const options = Array.from(loadFinder.querySelectorAll("[data-load]"));
    const kgValue = loadFinder.querySelector("[data-load-kg]");
    const titleValue = loadFinder.querySelector("[data-load-title]");
    const descValue = loadFinder.querySelector("[data-load-desc]");
    const tipValue = loadFinder.querySelector("[data-load-tip]");
    const ring = loadFinder.querySelector("[data-load-ring]");
    const drum = loadFinder.querySelector("[data-load-drum]");
    const circumference = 2 * Math.PI * 60;

    const setLoad = (key) => {
      const data = loads[key];
      if (!data) return;

      options.forEach((button) => {
        const active = button.dataset.load === key;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      if (kgValue) kgValue.textContent = String(data.kg);
      if (titleValue) titleValue.textContent = data.title;
      if (descValue) descValue.textContent = data.desc;
      if (tipValue) tipValue.textContent = data.tip;

      if (ring) {
        ring.style.strokeDasharray = String(circumference);
        ring.style.strokeDashoffset = String(circumference * (1 - data.fill));
      }

      if (drum) drum.setAttribute("aria-label", `Capacidad recomendada: ${data.kg} kilos`);
    };

    options.forEach((button) => {
      button.addEventListener("click", () => setLoad(button.dataset.load));
    });

    const optionGroup = loadFinder.querySelector(".load-options");
    if (optionGroup) {
      optionGroup.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
          return;
        }

        event.preventDefault();
        const current = options.indexOf(document.activeElement);
        const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const next = options[(current + direction + options.length) % options.length];
        next.focus();
        next.click();
      });
    }

    setLoad("edredon");
  }

  /* ------------------------------------------------------------------------
     Copiar dirección
     ---------------------------------------------------------------------- */

  const toast = document.getElementById("toast");
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  };

  const copyText = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      /* Se intenta el método clásico a continuación. */
    }

    try {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.top = "-1000px";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(helper);
      return copied;
    } catch (error) {
      return false;
    }
  };

  const copyTimers = new WeakMap();

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const copied = await copyText(button.dataset.copy || "");

      if (!copied) {
        showToast("No se ha podido copiar. Puedes seleccionar la dirección.");
        return;
      }

      button.classList.add("is-copied");
      showToast("Dirección copiada");
      window.clearTimeout(copyTimers.get(button));
      copyTimers.set(
        button,
        window.setTimeout(() => button.classList.remove("is-copied"), 2200)
      );
    });
  });

  /* ------------------------------------------------------------------------
     Ocultar el botón flotante al llegar al pie
     ---------------------------------------------------------------------- */

  const whatsappFloat = document.querySelector(".whatsapp-float");
  const siteFooter = document.querySelector(".site-footer");

  if (whatsappFloat && siteFooter && "IntersectionObserver" in window) {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          whatsappFloat.classList.toggle("is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.08 }
    );
    footerObserver.observe(siteFooter);
  }

  /* ------------------------------------------------------------------------
     Año actual
     ---------------------------------------------------------------------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
