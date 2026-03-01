document.addEventListener("DOMContentLoaded", function () {

  // Prevent double execution if script loads twice
  if (window.__ONTAR_SCRIPT_INIT__) return;
  window.__ONTAR_SCRIPT_INIT__ = true;

  /* ===============================
     1️⃣ Typing Effect (Hero)
  ================================ */

  const nameText = "MD. ANISUJJAMAN ONTAR";
  const titleText = "AI-focused Backend Developer";

  const nameEl = document.getElementById("name");
  const titleEl = document.getElementById("title");

  if (nameEl && titleEl) {

    nameEl.textContent = "";
    titleEl.textContent = "";

    let nameIndex = 0;
    let titleIndex = 0;
    let phase = "typingName";

    function typeEffect() {

      if (phase === "typingName") {
        if (nameIndex < nameText.length) {
          nameEl.textContent += nameText[nameIndex++];
        } else {
          phase = "typingTitle";
          return setTimeout(typeEffect, 500);
        }
      }

      else if (phase === "typingTitle") {
        if (titleIndex < titleText.length) {
          titleEl.textContent += titleText[titleIndex++];
        } else {
          phase = "pause";
          return setTimeout(typeEffect, 2000);
        }
      }

      else if (phase === "pause") {
        phase = "deletingTitle";
      }

      else if (phase === "deletingTitle") {
        if (titleIndex > 0) {
          titleEl.textContent = titleText.substring(0, --titleIndex);
        } else {
          phase = "deletingName";
        }
      }

      else if (phase === "deletingName") {
        if (nameIndex > 0) {
          nameEl.textContent = nameText.substring(0, --nameIndex);
        } else {
          phase = "typingName";
        }
      }

      setTimeout(typeEffect, 70);
    }

    typeEffect();
  }

  /* ===============================
     2️⃣ Active Scroll Link
  ================================ */

  const sections = document.querySelectorAll("section[id]");

  function scrollActive() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {

      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");

      const scrollLink = document.querySelector(
        ".nav-menu a[href*=" + sectionId + "]"
      );

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        scrollLink?.classList.add("active-link");
      } else {
        scrollLink?.classList.remove("active-link");
      }
    });
  }

  window.addEventListener("scroll", scrollActive);

  /* ===============================
     3️⃣ Theme Toggle
  ================================ */

  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (themeBtn) {

    const icon = themeBtn.querySelector("i");

    if (localStorage.getItem("theme") === "light") {
      body.classList.add("light-mode");
      icon?.classList.replace("fa-moon", "fa-sun");
    }

    themeBtn.addEventListener("click", function () {

      body.classList.toggle("light-mode");

      if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        icon?.classList.replace("fa-moon", "fa-sun");
      } else {
        localStorage.setItem("theme", "dark");
        icon?.classList.replace("fa-sun", "fa-moon");
      }
    });
  }

  /* ===============================
     4️⃣ Mobile Menu Toggle
  ================================ */

  const navToggle = document.querySelector(".nav-toggle-btn");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (navToggle && navMenu) {

    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("active");
      navMenu.classList.toggle("show-menu");
    });

    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show-menu");
        navToggle.classList.remove("active");
      });
    });
  }

  /* ===============================
     5️⃣ Particle Background
  ================================ */

  const canvas = document.getElementById("canvas1");

  if (canvas) {

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    function getParticleColor() {
      return document.body.classList.contains("light-mode")
        ? "rgba(0, 123, 255, 0.2)"
        : "rgba(0, 255, 195, 0.2)";
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }

      draw() {
        ctx.fillStyle = getParticleColor().replace("0.2", "0.8");
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      particlesArray = [];
      let numberOfParticles = (canvas.width * canvas.height) / 10000;

      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }

      requestAnimationFrame(animate);
    }

    init();
    animate();
  }

  /* ===============================
     6️⃣ Footer Year
  ================================ */

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ===============================
     7️⃣ Live Time (Bangladesh)
  ================================ */

  const liveEl = document.getElementById("liveTime");

  function updateTime() {
    if (!liveEl) return;

    const now = new Date();

    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Dhaka"
    };

    liveEl.textContent =
      new Intl.DateTimeFormat("en-US", options).format(now) +
      " (Bangladesh Standard Time)";
  }

  updateTime();
  setInterval(updateTime, 1000);

  /* ===============================
     8️⃣ Moving Text Restart
  ================================ */

  const movingSpan = document.querySelector(".moving-text span");
  if (movingSpan) {
    movingSpan.style.animation = "none";
    movingSpan.offsetHeight;
    movingSpan.style.animation = "";
  }

  /* ===============================
     9️⃣ Image Preview Before Upload
  ================================ */

  const fileInput = document.getElementById("attachment");
  const previewImage = document.getElementById("previewImage");

  if (fileInput && previewImage) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewImage.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        previewImage.style.display = "none";
      }
    });
  }

  /* ===============================
     🔟 SUCCESS POPUP WITH TYPING
  ================================ */

  function showPopup() {
    const popup = document.getElementById("successPopup");
    const titleEl = document.getElementById("popupTitle");
    const messageEl = document.getElementById("popupMessage");

    if (!popup) return;

    popup.classList.add("active");

    const titleText = "🎉 Thank You!";
    const messageText = "Your message has been successfully submitted. I will contact you very soon.";

    titleEl.textContent = "";
    messageEl.textContent = "";

    let i = 0;
    let j = 0;

    function typeTitle() {
      if (i < titleText.length) {
        titleEl.textContent += titleText[i++];
        setTimeout(typeTitle, 60);
      } else {
        setTimeout(typeMessage, 300);
      }
    }

    function typeMessage() {
      if (j < messageText.length) {
        messageEl.textContent += messageText[j++];
        setTimeout(typeMessage, 30);
      }
    }

    typeTitle();
  }

  window.closePopup = function () {
    document.getElementById("successPopup")?.classList.remove("active");
  };

 /* ===============================
   1️⃣1️⃣ Cloudinary + Firestore Submit
================================ */

const form = document.getElementById("contactForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // ✅ reCAPTCHA validation
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      alert("Please verify that you are not a robot.");
      return;
    }


    const fullName = document.getElementById("full_name").value.trim();
    const phoneInput = document.getElementById("phone");
    const emailInput = document.getElementById("email");

    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const subject = document.getElementById("subject").value.trim();
    const bloodGroup = document.getElementById("blood_group").value;
    const message = document.getElementById("message").value.trim();
    const file = document.getElementById("attachment").files[0];

    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");

    // ✅ Email Validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!emailOk) {
      if (emailError) emailError.style.display = "block";
      alert("Please enter a valid email address.");
      return;
    } else {
      if (emailError) emailError.style.display = "none";
    }

    // ✅ Phone Validation (intl-tel-input required)
    if (typeof iti === "undefined" || !iti.isValidNumber()) {
      if (phoneError) phoneError.style.display = "block";
      alert("Please enter a valid phone number.");
      return;
    } else {
      if (phoneError) phoneError.style.display = "none";
    }

    const fullPhone = iti.getNumber(); // Global E.164 format

    if (!file) {
      alert("Please select a file.");
      return;
    }

    if (typeof db === "undefined" || typeof firebase === "undefined") {
      alert("Firebase is not initialized. Please check Firebase CDN scripts.");
      return;
    }

    try {

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ontar_unsigned");

      const cloudName = "dfshwrf62";

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const imageUrl = data.secure_url;

      if (!response.ok || !imageUrl) {
        throw new Error(data?.error?.message || "Cloudinary upload failed");
      }

      await db.collection("contacts").add({
        fullName,
        phone: fullPhone,
        email,
        subject,
        bloodGroup,
        message,
        imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      showPopup();
      form.reset();

      if (previewImage) {
        previewImage.style.display = "none";
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    }
  });
}

  /* ===============================
     1️⃣2️⃣ Email + International Phone Validation
  ================================ */

  const phoneInput = document.querySelector("#phone");
  const emailInput = document.querySelector("#email");
  const phoneError = document.getElementById("phoneError");
  const emailError = document.getElementById("emailError");

  let iti = null;

  if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "auto",
      geoIpLookup: function (callback) {
        fetch("https://ipapi.co/json")
          .then(res => res.json())
          .then(data => callback(data.country_code))
          .catch(() => callback("us"));
      },
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js",
      separateDialCode: true
    });
  }

});