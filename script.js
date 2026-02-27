document.addEventListener("DOMContentLoaded", function () {

  /* ===============================
     1️⃣ Typing Effect
  =============================== */

  const nameText = "MD. ANISUJJAMAN ONTAR";
  const titleText = "AI-focused Backend Developer";

  const nameEl = document.getElementById("name");
  const titleEl = document.getElementById("title");

  if (nameEl && titleEl) {
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
  =============================== */

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
  =============================== */

  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;

  if (themeBtn) {
    const icon = themeBtn.querySelector("i");

    if (localStorage.getItem("theme") === "light") {
      body.classList.add("light-mode");
      icon.classList.replace("fa-moon", "fa-sun");
    }

    themeBtn.addEventListener("click", function () {
      body.classList.toggle("light-mode");

      if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        icon.classList.replace("fa-moon", "fa-sun");
      } else {
        localStorage.setItem("theme", "dark");
        icon.classList.replace("fa-sun", "fa-moon");
      }
    });
  }


  /* ===============================
     4️⃣ Mobile Menu Toggle (FIXED)
  =============================== */

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
  =============================== */

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
        const color = getParticleColor().replace("0.2", "0.8");
        const blurColor = getParticleColor().replace("0.2", "1");

        ctx.fillStyle = color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = blurColor;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
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

      const lineColor = getParticleColor();

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        for (let j = i; j < particlesArray.length; j++) {

          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor.replace(
              "0.2",
              `${0.1 - distance / 1500}`
            );
            ctx.lineWidth = 0.5;
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });
  }


  /* ===============================
     6️⃣ Footer Year
  =============================== */

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ===============================
     7️⃣ Live Time (Bangladesh)
  =============================== */

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
     8️⃣ Moving Text Effect (Contact Me paragraph)
     (CSS animation works, but this ensures smooth restart if needed)
  =============================== */

  const movingSpan = document.querySelector(".moving-text span");
  if (movingSpan) {
    movingSpan.style.animation = "none";
    // Force reflow
    movingSpan.offsetHeight;
    movingSpan.style.animation = "";
  }


  /* ===============================
     9️⃣ Full Contact Form Validation
  =============================== */

  const form = document.getElementById("contactForm");

  if (form) {

    form.addEventListener("submit", function (e) {

      const name = document.getElementById("full_name")?.value.trim();
      const email = document.getElementById("email")?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const subject = document.getElementById("subject")?.value.trim();
      const blood = document.getElementById("blood_group")?.value;
      const message = document.getElementById("message")?.value.trim();
      const file = document.getElementById("attachment")?.files.length;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[0-9+\s()-]{7,20}$/;

      if (!name || !email || !phone || !subject || !blood || !message || !file) {
        e.preventDefault();
        alert("Please fill up all fields before submitting.");
        return;
      }

      if (!emailRegex.test(email)) {
        e.preventDefault();
        alert("Please enter a valid email address.");
        return;
      }

      if (!phoneRegex.test(phone)) {
        e.preventDefault();
        alert("Please enter a valid phone number.");
        return;
      }

    });
  }

});