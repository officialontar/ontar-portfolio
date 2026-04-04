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
      } else if (phase === "typingTitle") {
        if (titleIndex < titleText.length) {
          titleEl.textContent += titleText[titleIndex++];
        } else {
          phase = "pause";
          return setTimeout(typeEffect, 2000);
        }
      } else if (phase === "pause") {
        phase = "deletingTitle";
      } else if (phase === "deletingTitle") {
        if (titleIndex > 0) {
          titleEl.textContent = titleText.substring(0, --titleIndex);
        } else {
          phase = "deletingName";
        }
      } else if (phase === "deletingName") {
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

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");

      const scrollLink = document.querySelector(
        '.nav-menu a[href*="' + sectionId + '"]'
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

    navLinks.forEach((link) => {
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
      const numberOfParticles = (canvas.width * canvas.height) / 10000;

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

    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });
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
      timeZone: "Asia/Dhaka",
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

  const attachmentInput = document.getElementById("attachment");
  const previewImage = document.getElementById("previewImage");

  if (attachmentInput && previewImage) {
    attachmentInput.addEventListener("change", function () {
      const file = this.files[0];

      if (!file) {
        previewImage.src = "";
        previewImage.style.display = "none";
        return;
      }

      // ✅ ADDED: 10MB file size limit check
      // এই জায়গায় file select করার সময়ই size check হচ্ছে
      const maxFileSize = 10 * 1024 * 1024; // 10MB

      if (file.size > maxFileSize) {
        alert("File size must be 10 MB or less.");
        this.value = "";
        previewImage.src = "";
        previewImage.style.display = "none";
        return;
      }

      if (!file.type.startsWith("image/")) {
        previewImage.src = "";
        previewImage.style.display = "none";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewImage.style.display = "block";
      };
      reader.readAsDataURL(file);
    });
  }

  /* ===============================
   🔟 SUCCESS POPUP WITH SLIDE EFFECT
================================ */

const successPopup = document.getElementById("successPopup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");

function showPopup() {
  if (!successPopup || !popupTitle || !popupMessage) return;

  const popupBox = successPopup.querySelector(".popup-box");
  popupBox?.classList.remove("error-popup");
  popupBox?.classList.add("success-popup");

  successPopup.classList.add("active");

  popupTitle.innerHTML = "🎉 Thank You!";
  popupMessage.innerHTML =
    "Your message has been submitted successfully. I will review your message and contact you very soon.";

  // ✅ আগে animation class remove
  popupTitle.classList.remove("popup-title-animate");
  popupMessage.classList.remove("popup-message-animate");

  // ✅ reflow trigger
  void popupTitle.offsetWidth;
  void popupMessage.offsetWidth;

  // ✅ নতুন করে animation class add
  popupTitle.classList.add("popup-title-animate");
  popupMessage.classList.add("popup-message-animate");
}

window.closePopup = function () {
  successPopup?.classList.remove("active");
};

if (successPopup) {
  successPopup.addEventListener("click", function (e) {
    if (e.target === successPopup) {
      closePopup();
    }
  });
}



  /* ===============================
     1️⃣1️⃣ Cloudinary + Firestore Submit
  ================================ */

  const form = document.getElementById("contactForm");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const bloodGroupInput = document.getElementById("blood_group");
  const messageInput = document.getElementById("message");
  const fullNameInput = document.getElementById("full_name");
  const subjectInput = document.getElementById("subject");

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const isPhoneValid = validatePhone();
      const isEmailValid = validateEmail();

      if (!isPhoneValid || !isEmailValid) {
        return;
      }

      const submitBtn = form.querySelector(".btn-submit");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Submitting...";
      }

      // ✅ ADDED: reCAPTCHA submit-এর ঠিক আগে check
      // এখানে reCAPTCHA missing বা expired হলে submit stop হবে
      if (typeof grecaptcha !== "undefined") {
        const recaptchaResponse = grecaptcha.getResponse();

        if (!recaptchaResponse) {
          alert("Please verify the reCAPTCHA checkbox again before submitting.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          return;
        }
      }

      if (typeof db === "undefined" || typeof firebase === "undefined") {
        alert("Firebase is not initialized. Please check Firebase CDN scripts.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        return;
      }

      try {
        const fullName = fullNameInput ? fullNameInput.value.trim() : "";
        const subject = subjectInput ? subjectInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const bloodGroup = bloodGroupInput ? bloodGroupInput.value : "";
        const message = messageInput ? messageInput.value.trim() : "";
        const file = attachmentInput ? attachmentInput.files[0] : null;
        const fullPhone = iti ? iti.getNumber() : "";
        const selectedCountry = iti ? iti.getSelectedCountryData() : null;

        let imageUrl = "";
        let attachmentData = null;

        // ✅ ADDED: submit-এর সময়ও 10MB file size limit check
        // file manually change হলে বা bypass হলেও এখানে আবার check হবে
        const maxFileSize = 10 * 1024 * 1024; // 10MB

        if (file && file.size > maxFileSize) {
          alert("File size must be 10 MB or less.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
          return;
        }

        if (file) {
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
          imageUrl = data.secure_url || "";

          if (!response.ok) {
            throw new Error(data?.error?.message || "Cloudinary upload failed");
          }

          attachmentData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: await fileToBase64(file),
          };
        }

        await db.collection("contacts").add({
          fullName,
          phone: fullPhone,
          email,
          subject,
          bloodGroup,
          message,
          imageUrl,
          country_code: selectedCountry?.dialCode || "",
          country_iso2: selectedCountry?.iso2 || "",
          country_name: selectedCountry?.name || "",
          attachment: attachmentData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        showPopup();
        form.reset();

        if (iti) {
          iti.setCountry("bd");
        }

        if (typeof grecaptcha !== "undefined") {
          grecaptcha.reset();
        }

        if (previewImage) {
          previewImage.src = "";
          previewImage.style.display = "none";
        }

        clearError(phoneInput, phoneError);
        clearError(emailInput, emailError);
      } catch (error) {
        console.error("Contact form submission error:", error);

        // ✅ ADDED: error alert একটু clear করে দেওয়া হয়েছে
        alert(
          "Submission failed. Please check reCAPTCHA, internet connection, Cloudinary upload, and file size, then try again."
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  /* ===============================
     1️⃣2️⃣ Email + International Phone Validation
  ================================ */

  const phoneError = document.getElementById("phoneError");
  const emailError = document.getElementById("emailError");

  let iti = null;

  if (phoneInput && window.intlTelInput) {
    iti = window.intlTelInput(phoneInput, {
      initialCountry: "bd",
      preferredCountries: ["bd", "us", "in", "gb", "sa", "ae"],
      separateDialCode: true,
      autoPlaceholder: "polite",
      formatOnDisplay: true,
      nationalMode: false,
      strictMode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@19.5.6/build/js/utils.js",
    });
  }

  function setError(input, errorEl, message) {
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
    if (input) {
      input.style.borderColor = "#ff6b6b";
      input.style.boxShadow = "0 0 0 3px rgba(255, 107, 107, 0.10)";
    }
  }

  function clearError(input, errorEl) {
    if (errorEl) {
      errorEl.style.display = "none";
      errorEl.textContent = "";
    }
    if (input) {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    }
  }

  function validateEmail() {
    if (!emailInput) return true;

    const emailValue = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!emailValue) {
      setError(emailInput, emailError, "Email address is required.");
      return false;
    }

    if (!emailRegex.test(emailValue)) {
      setError(emailInput, emailError, "Please enter a valid email address.");
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  function validatePhone() {
    if (!phoneInput || !iti) return true;

    const rawValue = phoneInput.value.trim();

    if (!rawValue) {
      setError(
        phoneInput,
        phoneError,
        "Phone number is required for the selected country."
      );
      return false;
    }

    if (!iti.isValidNumber()) {
      const countryData = iti.getSelectedCountryData();
      const countryName = countryData?.name || "the selected country";
      setError(
        phoneInput,
        phoneError,
        `Please enter a valid phone number for ${countryName}.`
      );
      return false;
    }

    clearError(phoneInput, phoneError);
    return true;
  }

  if (emailInput) {
    emailInput.addEventListener("input", validateEmail);
    emailInput.addEventListener("blur", validateEmail);
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", validatePhone);
    phoneInput.addEventListener("blur", validatePhone);
    phoneInput.addEventListener("countrychange", function () {
      if (phoneInput.value.trim()) {
        validatePhone();
      } else {
        clearError(phoneInput, phoneError);
      }
    });
  }
});