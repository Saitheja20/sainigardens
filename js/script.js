(function () {
  "use strict";

  const bookedDates = [
    "2026-03-06",
    "2026-03-14",
    "2026-03-22",
    "2026-04-05",
    "2026-05-10",
    "2026-05-15",
    "2026-06-18",
  ];

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const pad = (number) => String(number).padStart(2, "0");
  const toISO = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const siteNav = $("#siteNav");
  const currentPage = document.body.dataset.page || "home";

  function onScroll() {
    if (siteNav) {
      siteNav.classList.toggle("scrolled", window.scrollY > 40);
    }
    $$(".navbar-nav .nav-link").forEach((link) => {
      link.classList.toggle("active", link.dataset.page === currentPage);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* ==============================
     MOBILE MENU – FORCE CLOSE INSTANTLY
     Removes Bootstrap collapse classes immediately so the
     menu vanishes before the browser navigates to a new page.
  ============================== */
  (function () {
    var navEl = document.getElementById("mainNav");
    if (!navEl) return;

    function forceCloseMenu() {
      if (!navEl.classList.contains("show")) return;
      navEl.classList.remove("show", "collapsing");
      navEl.removeAttribute("style");
      var toggler = document.querySelector(".navbar-toggler");
      if (toggler) toggler.setAttribute("aria-expanded", "false");
    }

    /* Nav links: close → tiny delay → navigate */
    navEl.querySelectorAll(".navbar-nav .nav-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        forceCloseMenu();
        if (href && href !== "#" && !href.startsWith("#")) {
          e.preventDefault();
          setTimeout(function () { window.location.href = href; }, 50);
        }
      });
    });

    /* Book Now button */
    var bookBtn = navEl.querySelector(".btn-book");
    if (bookBtn) {
      bookBtn.addEventListener("click", function (e) {
        var href = bookBtn.getAttribute("href");
        forceCloseMenu();
        if (href && href !== "#" && !href.startsWith("#")) {
          e.preventDefault();
          setTimeout(function () { window.location.href = href; }, 50);
        }
      });
    }

    /* Tap the ✕ pseudo-element (top-right 60×60 zone) */
    navEl.addEventListener("click", function (e) {
      var r = navEl.getBoundingClientRect();
      if (e.clientX >= r.right - 60 && e.clientX <= r.right &&
          e.clientY >= r.top && e.clientY <= r.top + 60) {
        forceCloseMenu();
      }
    });
  })();

  /* ==============================
     SMOOTH SCROLL for # links
  ============================== */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();

      const navCollapse = $("#mainNav");
      if (navCollapse && navCollapse.classList.contains("show") && window.bootstrap) {
        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
      }

      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ==============================
     REVEAL ANIMATIONS
  ============================== */
  const revealTargets = [
    ".about-title", ".about-overlap", ".amenity-card-simple", ".video-wrapper",
    ".host-card", ".calendar-card", ".services-list", ".service-feature-card",
    ".gallery-tile", ".testimonial-card", ".voice-card", ".split-image",
    ".stat-card", ".contact-card", ".contact-form-card", ".image-panel",
    ".feature-list__item", ".event-category-card", ".process-card",
    ".faq-card", ".visit-card",
  ];

  revealTargets.forEach((selector) => {
    $$(selector).forEach((element) => element.classList.add("reveal"));
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    $$(".reveal").forEach((element) => observer.observe(element));
  } else {
    $$(".reveal").forEach((element) => element.classList.add("in-view"));
  }

  /* ==============================
     BOOKING CALENDAR
  ============================== */
  const calendarGrid = $("#calendarGrid");
  const calMonthEl = $("#calMonth");
  const calYearEl = $("#calYear");
  const prevBtn = $("#prevMonth");
  const nextBtn = $("#nextMonth");

  let viewDate = new Date(2026, 2, 1);
  let selectedDateISO = null;

  function buildCalendar() {
    if (!calendarGrid || !calMonthEl || !calYearEl) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    calMonthEl.textContent = MONTH_NAMES[month];
    calYearEl.textContent = year;
    calendarGrid.innerHTML = "";

    for (let index = 0; index < firstDay; index += 1) {
      const empty = document.createElement("div");
      empty.className = "cal-day cal-day--empty";
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const iso = toISO(cellDate);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cal-day";
      cell.textContent = day;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("data-date", iso);

      const isToday = cellDate.getTime() === today.getTime();
      const isBooked = bookedDates.includes(iso);

      if (isBooked) {
        cell.classList.add("cal-day--booked");
        cell.disabled = true;
        cell.setAttribute("aria-label", `${iso} already booked`);
      } else {
        cell.classList.add("cal-day--available");
        cell.setAttribute("aria-label", `${iso} available to book`);
        cell.addEventListener("click", () => selectDate(cell, iso));
      }

      if (isToday) cell.classList.add("cal-day--today");
      if (iso === selectedDateISO) cell.classList.add("cal-day--selected");

      calendarGrid.appendChild(cell);
    }
  }

  function selectDate(cell, iso) {
    if (!calendarGrid) return;

    $$(".cal-day--selected", calendarGrid).forEach((selected) =>
      selected.classList.remove("cal-day--selected")
    );
    cell.classList.add("cal-day--selected");
    selectedDateISO = iso;

    const dateInput = $("#bDate");
    if (dateInput) {
      const selected = new Date(iso);
      dateInput.value = selected.toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
      dateInput.dataset.iso = iso;
    }

    const modalEl = $("#bookingModal");
    if (modalEl && window.bootstrap) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  function changeMonth(delta) {
    viewDate.setMonth(viewDate.getMonth() + delta);
    buildCalendar();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => changeMonth(1));
  buildCalendar();

   /* ==============================
      BOOKING FORM - (Now handled by PHP)
   ============================== */
   const bookingForm = $("#bookingForm");
   const bookingSuccess = $("#bookingSuccess");
   const bookingError = $("#bookingError");
   const bookingModal = $("#bookingModal");

   if (bookingForm && bookingModal) {
     // Handle displaying success/error messages after PHP redirect
     const urlParams = new URLSearchParams(window.location.search);
     if (urlParams.get("status") === "success") {
       if (bookingSuccess) {
         bookingSuccess.style.display = "flex";
         const bsModal = new bootstrap.Modal(bookingModal);
         bsModal.show();
         window.setTimeout(() => {
           bsModal.hide();
           bookingSuccess.style.display = "none";
           // Clear URL params
           window.history.replaceState({}, document.title, window.location.pathname);
         }, 3000);
       }
     } else if (urlParams.get("status") === "error") {
       if (bookingError) {
         bookingError.style.display = "flex";
         const bsModal = new bootstrap.Modal(bookingModal);
         bsModal.show();
         window.setTimeout(() => {
           bsModal.hide();
           bookingError.style.display = "none";
           // Clear URL params
           window.history.replaceState({}, document.title, window.location.pathname);
         }, 3000);
       }
     }

     // Basic client-side validation display (optional, can be improved)
     bookingForm.addEventListener("submit", (event) => {
       if (!bookingForm.checkValidity()) {
         event.preventDefault();
         event.stopPropagation();
         bookingForm.classList.add("was-validated");
       } else {
         bookingForm.classList.remove("was-validated");
       }
     });

     // Clear validation state when modal is hidden
     bookingModal.addEventListener("hidden.bs.modal", () => {
        bookingForm.classList.remove("was-validated");
        bookingForm.reset();
        // Also hide success/error messages if modal is closed manually
        if (bookingSuccess) bookingSuccess.style.display = "none";
        if (bookingError) bookingError.style.display = "none";
     });
   }

  /* ==============================
     VIDEO MODAL
  ============================== */
  const videoModal = $("#videoModal");
  const videoFrame = $("#videoFrame");
  const VIDEO_URL = "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&rel=0&modestbranding=1";

  if (videoModal && videoFrame) {
    videoModal.addEventListener("show.bs.modal", () => { videoFrame.src = VIDEO_URL; });
    videoModal.addEventListener("hidden.bs.modal", () => { videoFrame.src = ""; });
  }

  /* ==============================
     LIGHTBOX GALLERY
  ============================== */
  const galleryItems = $$(".gallery-tile");
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightboxImage");
  const lightboxCounter = $("#lightboxCounter");
  const lightboxClose = $(".lightbox__close");
  const lightboxPrev = $(".lightbox__prev");
  const lightboxNext = $(".lightbox__next");
  let currentLightboxIndex = 0;

  const galleryClasses = galleryItems.map((item) => {
    const image = $(".gallery-image", item);
    return Array.from(image.classList).find((className) =>
      className.startsWith("gallery-image--")
    );
  });

  function updateLightbox() {
    if (!lightboxImage || !lightboxCounter) return;
    lightboxImage.className = `lightbox__image ${galleryClasses[currentLightboxIndex]}`;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add("show");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function navLightbox(direction) {
    currentLightboxIndex = (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(index);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => navLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => navLightbox(1));

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.classList.contains("show")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") navLightbox(-1);
    if (event.key === "ArrowRight") navLightbox(1);
  });

  onScroll();
})();