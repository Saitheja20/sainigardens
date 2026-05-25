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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const revealTargets = [
    ".about-title",
    ".about-overlap",
    ".amenity-card-simple",
    ".video-wrapper",
    ".host-card",
    ".calendar-card",
    ".services-list",
    ".gallery-tile",
    ".testimonial-card",
    ".contact-card",
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
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
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

  const bookingForm = $("#bookingForm");
  const bookingSubmit = $("#bookingSubmit");
  const bookingSuccess = $("#bookingSuccess");

  if (bookingForm && bookingSubmit && bookingSuccess) {
    bookingForm.addEventListener("submit", (event) => {
      event.preventDefault();

      let valid = true;
      $$("input, select", bookingForm).forEach((field) => {
        if (field.id === "bDate") return;

        if (!field.checkValidity()) {
          field.classList.add("is-invalid");
          valid = false;
        } else {
          field.classList.remove("is-invalid");
        }
      });

      if (!$("#bDate")?.value) {
        valid = false;
      }

      if (!valid) return;

      bookingSubmit.classList.add("loading");
      bookingSubmit.disabled = true;

      window.setTimeout(() => {
        try {
          const existing = JSON.parse(localStorage.getItem("saini_bookings") || "[]");
          existing.push({
            id: Date.now(),
            name: $("#bName").value.trim(),
            phone: $("#bPhone").value.trim(),
            eventType: $("#bEventType").value,
            date: selectedDateISO || $("#bDate").dataset.iso || $("#bDate").value,
            message: $("#bMessage").value.trim(),
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("saini_bookings", JSON.stringify(existing));
        } catch (error) {
          /* Storage can be unavailable in private browsing. */
        }

        bookingSubmit.classList.remove("loading");
        bookingSubmit.disabled = false;
        bookingSuccess.classList.add("show");

        window.setTimeout(() => {
          bootstrap.Modal.getInstance($("#bookingModal"))?.hide();
          bookingForm.reset();
          bookingSuccess.classList.remove("show");
        }, 1800);
      }, 700);
    });

    $$("input, select, textarea", bookingForm).forEach((field) => {
      field.addEventListener("input", () => field.classList.remove("is-invalid"));
      field.addEventListener("change", () => field.classList.remove("is-invalid"));
    });
  }

  const videoModal = $("#videoModal");
  const videoFrame = $("#videoFrame");
  const VIDEO_URL =
    "https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&rel=0&modestbranding=1";

  if (videoModal && videoFrame) {
    videoModal.addEventListener("show.bs.modal", () => {
      videoFrame.src = VIDEO_URL;
    });
    videoModal.addEventListener("hidden.bs.modal", () => {
      videoFrame.src = "";
    });
  }

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
    currentLightboxIndex =
      (currentLightboxIndex + direction + galleryItems.length) % galleryItems.length;
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
