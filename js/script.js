/* =================================================================
   SAINI GARDENS — JavaScript
   Handles: calendar, booking form, lightbox, nav scroll, reveal,
   video modal, smooth scroll. Vanilla JS — no frameworks besides
   Bootstrap 5 bundle for modal / carousel / collapse behavior.
   ================================================================= */

(function () {
  'use strict';

  /* =====================================================
     1. BOOKED DATES — Replace/extend with server data later
     ===================================================== */
  const bookedDates = [
    '2026-05-10',
    '2026-05-15',
    '2026-05-22',
    '2026-06-05',
    '2026-06-18',
    '2026-07-02',
    '2026-12-12',
  ];

  /* =====================================================
     2. UTILITIES
     ===================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const pad = (n) => String(n).padStart(2, '0');
  const toISO = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /* =====================================================
     3. NAVBAR SCROLL EFFECT
     ===================================================== */
  const siteNav = $('#siteNav');
  const onScroll = () => {
    if (window.scrollY > 40) siteNav.classList.add('scrolled');
    else siteNav.classList.remove('scrolled');

    // Active link highlighting based on scroll position
    const sections = $$('section[id], header[id]');
    const scrollY = window.scrollY + 140;
    let currentId = 'home';
    sections.forEach((s) => {
      if (s.offsetTop <= scrollY) currentId = s.id;
    });
    $$('.navbar-nav .nav-link').forEach((link) => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${currentId}`
      );
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =====================================================
     4. SMOOTH SCROLL FOR ANCHOR LINKS
     ===================================================== */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      // Close mobile menu if open
      const navCollapse = $('#mainNav');
      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }

      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =====================================================
     5. REVEAL ON SCROLL (IntersectionObserver)
     ===================================================== */
  const revealTargets = [
    '.section-head',
    '.about__media',
    '.amenity-card',
    '.event-card',
    '.calendar-card',
    '.services-panel',
    '.gallery-item',
    '.video-frame',
    '.contact-wrap',
  ];

  revealTargets.forEach((sel) => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      el.dataset.delay = Math.min(i % 5, 5);
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    $$('.reveal').forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in-view'));
  }

  /* =====================================================
     6. CALENDAR
     ===================================================== */
  const calendarGrid = $('#calendarGrid');
  const calMonthEl = $('#calMonth');
  const calYearEl = $('#calYear');
  const prevBtn = $('#prevMonth');
  const nextBtn = $('#nextMonth');

  // Start in current month
  let viewDate = new Date();
  viewDate.setDate(1);

  // Track selected date
  let selectedDateISO = null;

  function buildCalendar() {
    if (!calendarGrid) return;

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    calMonthEl.textContent = MONTH_NAMES[month];
    calYearEl.textContent = year;

    // Clear previous
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Today (midnight for comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty leading cells
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day cal-day--empty';
      calendarGrid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      cellDate.setHours(0, 0, 0, 0);
      const iso = toISO(cellDate);

      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-date', iso);

      const isPast = cellDate < today;
      const isToday = cellDate.getTime() === today.getTime();
      const isBooked = bookedDates.includes(iso);

      if (isBooked) {
        cell.classList.add('cal-day--booked');
        cell.setAttribute('aria-label', `${iso} — already booked`);
        cell.setAttribute('tabindex', '-1');
      } else if (isPast) {
        cell.classList.add('cal-day--past');
        cell.setAttribute('tabindex', '-1');
      } else {
        cell.classList.add('cal-day--available');
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('aria-label', `${iso} — available to book`);
        cell.addEventListener('click', () => selectDate(cell, iso));
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDate(cell, iso);
          }
        });
      }

      if (isToday) cell.classList.add('cal-day--today');
      if (iso === selectedDateISO) cell.classList.add('cal-day--selected');

      calendarGrid.appendChild(cell);
    }
  }

  function selectDate(cell, iso) {
    // Remove previous selection
    $$('.cal-day--selected', calendarGrid).forEach((el) =>
      el.classList.remove('cal-day--selected')
    );
    cell.classList.add('cal-day--selected');
    selectedDateISO = iso;

    // Open booking modal with date pre-filled
    const dateInput = $('#bDate');
    if (dateInput) {
      const d = new Date(iso);
      dateInput.value = d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      dateInput.dataset.iso = iso;
    }

    const modalEl = $('#bookingModal');
    if (modalEl && window.bootstrap) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    }
  }

  function changeMonth(delta) {
    viewDate.setMonth(viewDate.getMonth() + delta);
    buildCalendar();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));

  // Keyboard nav on month buttons
  if (calendarGrid) buildCalendar();

  /* =====================================================
     7. BOOKING FORM
     ===================================================== */
  const bookingForm = $('#bookingForm');
  const bookingSubmit = $('#bookingSubmit');
  const bookingSuccess = $('#bookingSuccess');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate
      let valid = true;
      $$('input, select', bookingForm).forEach((field) => {
        if (field.id === 'bDate') return; // readonly
        if (!field.checkValidity()) {
          field.classList.add('is-invalid');
          valid = false;
        } else {
          field.classList.remove('is-invalid');
        }
      });

      if (!selectedDateISO && !$('#bDate').value) {
        alert('Please select a date from the calendar first.');
        valid = false;
      }

      if (!valid) return;

      // Show spinner
      bookingSubmit.classList.add('loading');
      bookingSubmit.disabled = true;

      // Simulate submit (swap with fetch to real endpoint later)
      setTimeout(() => {
        const enquiry = {
          id: Date.now(),
          name: $('#bName').value.trim(),
          phone: $('#bPhone').value.trim(),
          eventType: $('#bEventType').value,
          date: selectedDateISO || $('#bDate').dataset.iso || $('#bDate').value,
          message: $('#bMessage').value.trim(),
          createdAt: new Date().toISOString(),
        };

        // Persist to localStorage
        try {
          const existing = JSON.parse(
            localStorage.getItem('saini_bookings') || '[]'
          );
          existing.push(enquiry);
          localStorage.setItem('saini_bookings', JSON.stringify(existing));
        } catch (err) {
          /* storage unavailable — ignore */
        }

        // Reset UI
        bookingSubmit.classList.remove('loading');
        bookingSubmit.disabled = false;

        // Show success
        bookingSuccess.classList.add('show');

        // Close modal after delay
        setTimeout(() => {
          const modalEl = $('#bookingModal');
          if (modalEl && window.bootstrap) {
            bootstrap.Modal.getInstance(modalEl)?.hide();
          }
          bookingForm.reset();
          bookingSuccess.classList.remove('show');
          // Keep date pre-filled if still on same selection
          if (selectedDateISO) {
            const d = new Date(selectedDateISO);
            $('#bDate').value = d.toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
          }
        }, 2400);
      }, 800);
    });

    // Remove invalid state on input
    $$('input, select, textarea', bookingForm).forEach((f) => {
      f.addEventListener('input', () => f.classList.remove('is-invalid'));
      f.addEventListener('change', () => f.classList.remove('is-invalid'));
    });
  }

  /* =====================================================
     8. VIDEO MODAL — Load/unload iframe src on show/hide
     ===================================================== */
  const videoModal = $('#videoModal');
  const videoFrame = $('#videoFrame');
  // Sample ambient YouTube embed — swap for the venue's actual tour video
  const VIDEO_URL =
    'https://www.youtube.com/embed/ScMzIvxBSi4?autoplay=1&mute=1&rel=0&modestbranding=1';

  if (videoModal && videoFrame) {
    videoModal.addEventListener('show.bs.modal', () => {
      videoFrame.src = VIDEO_URL;
    });
    videoModal.addEventListener('hidden.bs.modal', () => {
      videoFrame.src = '';
    });
  }

  /* =====================================================
     9. GALLERY LIGHTBOX
     ===================================================== */
  const galleryItems = $$('.gallery-item');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightboxImage');
  const lightboxCounter = $('#lightboxCounter');
  const lightboxClose = $('.lightbox__close');
  const lightboxPrev = $('.lightbox__prev');
  const lightboxNext = $('.lightbox__next');

  let currentLightboxIndex = 0;

  // Gallery images are CSS-painted gradients; we'll clone the background for the lightbox
  const galleryBgs = galleryItems.map((item) => {
    const inner = $('.gallery-image', item);
    const cls = Array.from(inner.classList).find((c) => c.startsWith('gallery-image--'));
    return cls;
  });

  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function updateLightbox() {
    const cls = galleryBgs[currentLightboxIndex];
    lightboxImage.className = 'lightbox__image ' + cls;
    lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryItems.length}`;
  }

  function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navLightbox(dir) {
    currentLightboxIndex =
      (currentLightboxIndex + dir + galleryItems.length) % galleryItems.length;
    updateLightbox();
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(i);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => navLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => navLightbox(1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox__stage')) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  /* =====================================================
     10. FOOTER YEAR
     ===================================================== */
  const footerYear = $('#footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* =====================================================
     11. KICKOFF
     ===================================================== */
  onScroll();
})();
