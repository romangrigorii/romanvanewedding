(function () {
  const PASSWORD = "RomanAndVaneLove";
  const STORAGE_KEY = "roman-vane-wedding-auth";
  const VALID_RSVP_CODE = "12341234"; // only this code is accepted for now
  // Set this after deploying Code.gs as a Web app (Deploy → New deployment → Web app).
  // Example: "https://script.google.com/macros/s/AKfycbx.../exec"
  const RSVP_SCRIPT_URL = ""; // leave empty or set your Web app URL

  const gate = document.getElementById("gate");
  const main = document.getElementById("main");
  const form = document.getElementById("login-form");
  const input = document.getElementById("password");
  const errorEl = document.getElementById("gate-error");

  function unlock() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
    gate.classList.add("hidden");
    main.classList.remove("hidden");
    initSlideshow();
    initRSVP();
  }

  function showError(msg) {
    errorEl.textContent = msg;
  }

  function clearError() {
    errorEl.textContent = "";
  }

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      unlock();
      return;
    }
  } catch (e) {}

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    const value = (input.value || "").trim();
    if (value === PASSWORD) {
      unlock();
    } else {
      showError("Incorrect password. Please try again.");
      input.value = "";
      input.focus();
    }
  });

  input.focus();

  // —— Photo slideshow ——
  function initSlideshow() {
    const PHOTO_COUNT = 105;
    const BASE = "wedding_photos";
    const photos = [];
    for (let i = 1; i <= PHOTO_COUNT; i++) photos.push(BASE + "/" + i + ".jpg");

    const slideImg = main.querySelector(".slider-slide");
    const currentEl = document.getElementById("slide-current");
    const totalEl = document.getElementById("slide-total");
    const btnPrev = main.querySelector(".slider-btn--prev");
    const btnNext = main.querySelector(".slider-btn--next");

    if (!slideImg || !totalEl) return;

    totalEl.textContent = photos.length;
    let index = 0;
    let autoTimer = null;

    function goTo(i) {
      index = (i + photos.length) % photos.length;
      slideImg.src = photos[index];
      slideImg.alt = "Wedding moment " + (index + 1);
      if (currentEl) currentEl.textContent = index + 1;
    }

    function next() {
      goTo(index + 1);
      resetAuto();
    }

    function prev() {
      goTo(index - 1);
      resetAuto();
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 4500);
    }

    if (btnPrev) btnPrev.addEventListener("click", prev);
    if (btnNext) btnNext.addEventListener("click", next);
    goTo(0);
    resetAuto();
  }

  // —— RSVP: multiple guests, submit to sheet ——
  function initRSVP() {
    const rsvpForm = document.getElementById("rsvp-form");
    const guestContainer = document.getElementById("guest-names");
    const addGuestBtn = document.getElementById("add-guest");
    const messageEl = document.getElementById("rsvp-message");
    const submitBtn = document.getElementById("rsvp-submit");

    if (!rsvpForm || !guestContainer) return;

    addGuestBtn.addEventListener("click", function () {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "guest[]";
      input.placeholder = "Full name";
      input.className = "guest-input";
      guestContainer.appendChild(input);
    });

    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      messageEl.textContent = "";
      messageEl.className = "rsvp-message";

      const codeInput = document.getElementById("rsvp-code");
      const code = (codeInput && codeInput.value || "").replace(/\D/g, "").slice(0, 8);
      if (code.length !== 8) {
        messageEl.textContent = "Please enter a valid 8-digit invite code.";
        messageEl.classList.add("error");
        return;
      }
      if (code !== VALID_RSVP_CODE) {
        messageEl.textContent = "Invalid invite code. Please check and try again.";
        messageEl.classList.add("error");
        return;
      }

      const guestInputs = guestContainer.querySelectorAll(".guest-input");
      const names = [];
      guestInputs.forEach(function (inp) {
        const name = (inp.value || "").trim();
        if (name) names.push(name);
      });
      if (names.length === 0) {
        messageEl.textContent = "Please add at least one guest name.";
        messageEl.classList.add("error");
        return;
      }

      if (!RSVP_SCRIPT_URL || (RSVP_SCRIPT_URL + "").trim() === "") {
        messageEl.textContent = "Thank you! (RSVP is not connected to the sheet yet—add your Web app URL in main.js; see README.)";
        messageEl.classList.add("success");
        rsvpForm.reset();
        if (codeInput) codeInput.value = "";
        while (guestContainer.children.length > 1) guestContainer.removeChild(guestContainer.lastChild);
        if (guestContainer.querySelector(".guest-input")) guestContainer.querySelector(".guest-input").value = "";
        return;
      }

      submitBtn.disabled = true;
      messageEl.textContent = "Sending…";

      const payload = JSON.stringify({ code: code, names: names });

      fetch(RSVP_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: payload
      }).then(function () {
        messageEl.textContent = "Thank you! Your RSVP has been received.";
        messageEl.classList.add("success");
        rsvpForm.reset();
        if (codeInput) codeInput.value = "";
        while (guestContainer.children.length > 1) guestContainer.removeChild(guestContainer.lastChild);
        if (guestContainer.querySelector(".guest-input")) guestContainer.querySelector(".guest-input").value = "";
      }).catch(function () {
        messageEl.textContent = "Something went wrong. Please try again or contact us.";
        messageEl.classList.add("error");
      }).finally(function () {
        submitBtn.disabled = false;
      });
    });
  }
})();
