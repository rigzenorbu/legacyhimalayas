/* Legacy Himalayas: site interactions */
(function () {
  "use strict";

  // Contact details used by the enquiry form
  var WHATSAPP_NUMBER = "919797166422";
  var ENQUIRY_EMAIL = "hello@legacyhimalayas.com";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  var waFloat = document.querySelector(".wa-float");

  /* ---------- Header state + floating WhatsApp ---------- */
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-solid", y > 60);
    if (waFloat && hero) waFloat.classList.toggle("is-visible", y > hero.offsetHeight * 0.7);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    if (open) header.classList.add("is-solid"); else onScroll();
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* ---------- Hero video ---------- */
  var video = document.querySelector(".hero-video");
  var vBtn = document.querySelector(".video-toggle");
  function setVideo(play) {
    if (play) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    else video.pause();
    vBtn.dataset.state = play ? "playing" : "paused";
    vBtn.setAttribute("aria-label", play ? "Pause background video" : "Play background video");
  }
  if (video && vBtn) {
    video.muted = true; // some browsers only allow muted autoplay when set via the property
    // Safari blocks autoplay in Low Power Mode: start on the first interaction instead
    // Only real gestures count as permission to play in Safari (scrolling does not)
    var kickEvents = ["click", "touchend", "keydown"];
    var stopKick = function () { kickEvents.forEach(function (ev) { window.removeEventListener(ev, kick); }); };
    var kick = function (e) {
      if (e.target && e.target.closest && e.target.closest(".video-toggle")) return; // the button handles itself
      stopKick();
      setVideo(true);
    };
    if (reduceMotion) setVideo(false);
    else {
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () {
        vBtn.dataset.state = "paused";
        vBtn.setAttribute("aria-label", "Play background video");
        kickEvents.forEach(function (ev) { window.addEventListener(ev, kick, { passive: true }); });
      });
    }
    vBtn.addEventListener("click", function () { stopKick(); setVideo(video.paused); });
    // Pause when the hero is off-screen to save battery
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (vBtn.dataset.state !== "playing") return;
        if (entries[0].isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
        else video.pause();
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up stats ---------- */
  var nums = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = +el.dataset.count, start = null, dur = 1600;
        function step(t) {
          if (!start) start = t;
          var k = Math.min((t - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString("en-IN");
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { co.observe(n); });
  }

  /* ---------- Journey filters ---------- */
  var chips = document.querySelectorAll(".chip");
  var journeys = document.querySelectorAll(".journey");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", String(on));
      });
      journeys.forEach(function (j) {
        j.classList.toggle("is-hidden", f !== "all" && j.dataset.cat !== f);
        j.classList.add("is-in");
      });
    });
  });

  /* ---------- Parallax quote ---------- */
  var pBg = document.querySelector(".parallax-bg");
  if (pBg && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = pBg.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          pBg.style.transform = "translate3d(0," + (progress * -80).toFixed(1) + "px,0)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Pre-select journey in the form ---------- */
  var tripSelect = document.getElementById("f-trip");
  document.querySelectorAll("[data-trip]").forEach(function (el) {
    el.addEventListener("click", function () {
      var name = el.dataset.trip;
      Array.prototype.forEach.call(tripSelect.options, function (o) { if (o.text === name) tripSelect.value = o.value; });
    });
  });

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById("enquiry-form");
  var status = form.querySelector(".form-status");

  function collect() {
    var d = new FormData(form);
    return {
      name: (d.get("name") || "").trim(),
      email: (d.get("email") || "").trim(),
      phone: (d.get("phone") || "").trim(),
      trip: d.get("trip"),
      month: d.get("month"),
      travellers: d.get("travellers"),
      budget: d.get("budget"),
      message: (d.get("message") || "").trim()
    };
  }
  function summary(v) {
    return [
      "Julley! I'd like to plan a trip to Ladakh.",
      "",
      "Name: " + v.name,
      "Email: " + v.email,
      v.phone ? "Phone: " + v.phone : null,
      "Journey: " + v.trip,
      v.month ? "Travel month: " + v.month : null,
      "Travellers: " + v.travellers,
      "Budget: " + v.budget,
      v.message ? "\nNotes: " + v.message : null
    ].filter(function (l) { return l !== null; }).join("\n");
  }
  function validate(v) {
    var ok = true;
    [["f-name", v.name], ["f-email", /^\S+@\S+\.\S+$/.test(v.email) ? v.email : ""]].forEach(function (pair) {
      var field = document.getElementById(pair[0]).parentElement;
      field.classList.toggle("has-error", !pair[1]);
      if (!pair[1]) ok = false;
    });
    status.classList.toggle("error", !ok);
    status.textContent = ok ? "" : "Please add your name and a valid email.";
    return ok;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = collect();
    if (!validate(v)) return;
    // No backend yet: hand the enquiry to the visitor's email client.
    window.location.href = "mailto:" + ENQUIRY_EMAIL +
      "?subject=" + encodeURIComponent("Ladakh enquiry: " + v.trip) +
      "&body=" + encodeURIComponent(summary(v));
    status.textContent = "Thank you. Your email app should now open with the details filled in.";
  });

  document.getElementById("send-whatsapp").addEventListener("click", function () {
    var v = collect();
    if (!validate(v)) return;
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(summary(v)), "_blank", "noopener");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
