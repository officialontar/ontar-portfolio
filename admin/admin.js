import { auth, db, storage } from "../firebase-init.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  ref,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* -------------------- DOM -------------------- */
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const clearLoginBtn = document.getElementById("clearLoginBtn");
const loginError = document.getElementById("loginError");
const email = document.getElementById("email");
const password = document.getElementById("password");

const logoutBtn = document.getElementById("logoutBtn");
const exportBtn = document.getElementById("exportBtn");
const metaText = document.getElementById("metaText");

const searchInput = document.getElementById("searchInput");
const bloodFilter = document.getElementById("bloodFilter");
const nameSort = document.getElementById("nameSort");
const dateSort = document.getElementById("dateSort");
const clearBtn = document.getElementById("clearBtn");

const tableBody = document.getElementById("tableBody");
const noResults = document.getElementById("noResults");

/* Login popup */
const loginPopupOverlay = document.getElementById("loginPopupOverlay");
const loginPopupIcon = document.getElementById("loginPopupIcon");
const loginPopupTitle = document.getElementById("loginPopupTitle");
const loginPopupMessage = document.getElementById("loginPopupMessage");
const loginPopupCloseBtn = document.getElementById("loginPopupCloseBtn");

/* View Modal */
const viewModal = document.getElementById("viewModal");
const closeViewBtn = document.getElementById("closeViewBtn");
const doneViewBtn = document.getElementById("doneViewBtn");
const editFromViewBtn = document.getElementById("editFromViewBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const viewImgWrap = document.getElementById("viewImgWrap");
const viewImg = document.getElementById("viewImg");
const viewGrid = document.getElementById("viewGrid");
const viewMessage = document.getElementById("viewMessage");

/* Edit Modal */
const editModal = document.getElementById("editModal");
const closeEditBtn = document.getElementById("closeEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const editForm = document.getElementById("editForm");
const editName = document.getElementById("editName");
const editPhone = document.getElementById("editPhone");
const editEmail = document.getElementById("editEmail");
const editSubject = document.getElementById("editSubject");
const editBlood = document.getElementById("editBlood");
const editImage = document.getElementById("editImage");
const editImageFile = document.getElementById("editImageFile");
const editMessage = document.getElementById("editMessage");
const editPreview = document.getElementById("editPreview");
const editPreviewEmpty = document.getElementById("editPreviewEmpty");

/* Confirm Modal */
const confirmModal = document.getElementById("confirmModal");
const closeConfirmBtn = document.getElementById("closeConfirmBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const confirmText = document.getElementById("confirmText");

/* -------------------- State -------------------- */
let allData = [];
let selectedId = null;
let selectedItem = null;
let deleteTargetId = null;
let unsubscribeContacts = null;
let pendingLoginPopupUser = null;

const imageCache = new Map();

/* -------------------- Helpers -------------------- */
function openModal(modal) {
  modal.classList.add("open");
}

function closeModal(modal) {
  modal.classList.remove("open");
}

function safe(value) {
  return (value ?? "").toString().trim();
}

function lower(value) {
  return safe(value).toLowerCase();
}

function escapeHtml(str) {
  return safe(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(timestamp) {
  if (!timestamp?.seconds) return "—";

  const date = new Date(timestamp.seconds * 1000);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatFullDate(timestamp) {
  if (!timestamp?.seconds) return "—";

  const date = new Date(timestamp.seconds * 1000);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function getCreatedSeconds(item) {
  if (item?.createdAt?.seconds) return item.createdAt.seconds;
  return 0;
}

function normalize(item) {
  const name = item.name || item.fullName || item.full_name || "";
  const subject = item.subject || "";
  const phone =
    item.phone || item.mobile || item.mobileNumber || item.mobile_number || "";
  const email = item.email || "";
  const blood = item.blood || item.bloodGroup || item.blood_group || "";
  const message = item.message || item.msg || "";
  const imageRaw =
    item.image ||
    item.imageUrl ||
    item.profile_pic ||
    item.file ||
    item.fileUrl ||
    item.photo ||
    "";

  return { name, subject, phone, email, blood, message, imageRaw };
}

async function resolveImageUrl(docId, imageRaw) {
  const raw = safe(imageRaw);
  if (!raw) return "";

  if (imageCache.has(docId)) return imageCache.get(docId);

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    imageCache.set(docId, raw);
    return raw;
  }

  try {
    const url = await getDownloadURL(ref(storage, raw));
    imageCache.set(docId, url);
    return url;
  } catch (error) {
    imageCache.set(docId, "");
    return "";
  }
}

async function tryDeleteStorageFile(imageRaw) {
  const raw = safe(imageRaw);
  if (!raw) return;

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return;
  }

  try {
    await deleteObject(ref(storage, raw));
  } catch (error) {
    /* ignore */
  }
}

function setEditPreview(url) {
  if (url) {
    editPreview.src = url;
    editPreview.style.display = "block";
    editPreviewEmpty.style.display = "none";
  } else {
    editPreview.src = "";
    editPreview.style.display = "none";
    editPreviewEmpty.style.display = "flex";
  }
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(element, text, speed = 22) {
  if (!element) return;
  element.textContent = "";
  for (const ch of text) {
    element.textContent += ch;
    await delay(speed);
  }
}

async function showLoginPopup({
  title = "Login Successful!",
  message = "You have successfully logged in to the admin panel. Click close to open your dashboard.",
  icon = "🎉",
  titleColor = "#14f1c2",
}) {
  if (
    !loginPopupOverlay ||
    !loginPopupIcon ||
    !loginPopupTitle ||
    !loginPopupMessage ||
    !loginPopupCloseBtn
  ) {
    return;
  }

  loginPopupIcon.textContent = icon;
  loginPopupTitle.textContent = title;
  loginPopupTitle.style.color = titleColor;
  loginPopupMessage.textContent = "";
  loginPopupOverlay.classList.add("open");

  await typeText(loginPopupMessage, message, 22);

  return new Promise((resolve) => {
    const handleClose = () => {
      loginPopupOverlay.classList.remove("open");
      loginPopupCloseBtn.removeEventListener("click", handleClose);
      resolve();
    };

    loginPopupCloseBtn.addEventListener("click", handleClose);
  });
}



/* -------------------- Auth -------------------- */
await setPersistence(auth, browserSessionPersistence);

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.style.display = "none";

  // login button click করার সাথেসাথেই flag set
  sessionStorage.setItem("justLoggedIn", "true");

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      safe(email.value),
      password.value
    );

    pendingLoginPopupUser = credential.user;
  } catch (error) {
    loginError.style.display = "block";

    // login fail হলে flag remove
    sessionStorage.removeItem("justLoggedIn");
    pendingLoginPopupUser = null;

    await showLoginPopup({
      title: "Login Failed!",
      message:
        "Wrong email or password. Please check your credentials and try again.",
      icon: "❌",
      titleColor: "#ff6b6b",
    });
  }
});

clearLoginBtn.addEventListener("click", () => {
  email.value = "";
  password.value = "";
  loginError.style.display = "none";
});

logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    /* ignore */
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (sessionStorage.getItem("justLoggedIn") === "true") {
      loginSection.style.display = "none";
      dashboard.style.display = "none";

      await showLoginPopup({
        title: "Login Successful!",
        message:
          "You have successfully logged in to the admin panel. Click close to open your dashboard.",
        icon: "🎉",
        titleColor: "#14f1c2",
      });

      dashboard.style.display = "block";
      startRealtime();

      pendingLoginPopupUser = null;
      sessionStorage.removeItem("justLoggedIn");
    } else {
      loginSection.style.display = "none";
      dashboard.style.display = "block";
      startRealtime();
    }
  } else {
    loginSection.style.display = "block";
    dashboard.style.display = "none";
    pendingLoginPopupUser = null;
    sessionStorage.removeItem("justLoggedIn");

    if (unsubscribeContacts) {
      unsubscribeContacts();
      unsubscribeContacts = null;
    }
  }
});




/* -------------------- Firestore Realtime -------------------- */
function startRealtime() {
  if (unsubscribeContacts) {
    unsubscribeContacts();
    unsubscribeContacts = null;
  }

  metaText.textContent = "Realtime enabled • loading…";

  unsubscribeContacts = onSnapshot(
    collection(db, "contacts"),
    (snap) => {
      allData = [];
      imageCache.clear();

      snap.forEach((d) => {
        allData.push({ id: d.id, ...d.data() });
      });

      metaText.textContent = `Realtime enabled • ${allData.length} total submissions`;
      render();
    },
    () => {
      metaText.textContent = "Failed to load. Check Firestore rules/auth.";
    }
  );
}

/* -------------------- Render -------------------- */
function render() {
  const q = lower(searchInput.value);
  const blood = safe(bloodFilter.value);
  const ns = safe(nameSort.value);
  const ds = safe(dateSort.value);

  let list = [...allData];

  if (q) {
    list = list.filter((item) => {
      const n = normalize(item);
      const haystack = `${lower(n.name)} ${lower(n.email)} ${lower(
        n.phone
      )} ${lower(n.blood)} ${lower(n.subject)}`;
      return haystack.includes(q);
    });
  }

  if (blood) {
    list = list.filter((item) => {
      const n = normalize(item);
      return safe(n.blood) === blood;
    });
  }

  if (ds === "new") {
    list.sort((a, b) => getCreatedSeconds(b) - getCreatedSeconds(a));
  } else if (ds === "old") {
    list.sort((a, b) => getCreatedSeconds(a) - getCreatedSeconds(b));
  }

  if (ns === "az") {
    list.sort((a, b) => {
      const an = lower(normalize(a).name);
      const bn = lower(normalize(b).name);
      return an.localeCompare(bn, undefined, { sensitivity: "base" });
    });
  } else if (ns === "za") {
    list.sort((a, b) => {
      const an = lower(normalize(a).name);
      const bn = lower(normalize(b).name);
      return bn.localeCompare(an, undefined, { sensitivity: "base" });
    });
  }

  tableBody.innerHTML = "";

  if (list.length === 0) {
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";

  for (const item of list) {
    const n = normalize(item);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="name-cell">${escapeHtml(n.name) || "—"}</td>
      <td class="email-cell">${escapeHtml(n.email) || "—"}</td>
      <td class="center-cell">${escapeHtml(n.phone) || "—"}</td>
      <td class="center-cell">${formatDate(item.createdAt)}</td>
      <td class="center-cell">${escapeHtml(n.blood) || "—"}</td>
      <td class="image-cell">
        <img class="thumb" id="img_${item.id}" style="display:none;" alt="img" />
        <span id="imgtxt_${item.id}" style="color:rgba(255,255,255,0.6);">—</span>
      </td>
      <td class="actions-cell">
        <div class="actions">
          <button class="primary" data-act="view" data-id="${item.id}">View</button>
          <button class="warning" data-act="edit" data-id="${item.id}">Edit</button>
          <button class="danger" data-act="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);

    (async () => {
      const url = await resolveImageUrl(item.id, n.imageRaw);
      const img = document.getElementById(`img_${item.id}`);
      const txt = document.getElementById(`imgtxt_${item.id}`);

      if (!img || !txt) return;

      if (url) {
        img.src = url;
        img.style.display = "inline-block";
        txt.style.display = "none";
      } else {
        img.style.display = "none";
        txt.style.display = "inline";
      }
    })();
  }
}

/* -------------------- Filters -------------------- */
searchInput.addEventListener("input", render);
bloodFilter.addEventListener("change", render);
nameSort.addEventListener("change", render);
dateSort.addEventListener("change", render);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  bloodFilter.value = "";
  nameSort.value = "";
  dateSort.value = "new";
  render();
});

/* -------------------- Table Action Delegation -------------------- */
tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const act = btn.dataset.act;
  const id = btn.dataset.id;
  if (!act || !id) return;

  if (act === "view") openView(id);
  if (act === "edit") openEdit(id);
  if (act === "delete") askDelete(id);
});

/* -------------------- View Modal -------------------- */
async function openView(id) {
  const item = allData.find((x) => x.id === id);
  if (!item) return;

  selectedId = id;
  selectedItem = item;

  const n = normalize(item);
  const imgUrl = await resolveImageUrl(id, n.imageRaw);

  if (imgUrl) {
    viewImg.src = imgUrl;
    viewImgWrap.style.display = "flex";
  } else {
    viewImg.src = "";
    viewImgWrap.style.display = "none";
  }

  const rows = [
    ["Name", n.name || "—"],
    ["Subject", n.subject || "—"],
    ["Email", n.email || "—"],
    ["Phone", n.phone || "—"],
    ["Blood", n.blood || "—"],
    ["Created Date", formatFullDate(item.createdAt)],
  ];

  viewGrid.innerHTML = rows
    .map(
      ([k, v]) => `
        <div class="kv">
          <div class="k">${escapeHtml(k)}</div>
          <div class="v">${escapeHtml(v)}</div>
        </div>
      `
    )
    .join("");

  viewMessage.textContent = n.message || "—";

  openModal(viewModal);
}

function closeView() {
  closeModal(viewModal);
}

closeViewBtn.addEventListener("click", closeView);
doneViewBtn.addEventListener("click", closeView);

viewModal.addEventListener("click", (e) => {
  if (e.target === viewModal) closeView();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (viewModal.classList.contains("open")) closeView();
    if (editModal.classList.contains("open")) closeEdit();
    if (confirmModal.classList.contains("open")) closeConfirm();
  }
});

editFromViewBtn.addEventListener("click", () => {
  if (!selectedId) return;
  closeView();
  openEdit(selectedId);
});

/* -------------------- PDF DOWNLOAD -------------------- */
downloadPdfBtn.addEventListener("click", async () => {
  if (!selectedItem) return;

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const n = normalize(selectedItem);

    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, 210, 297, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Contact Submission Profile", 14, 20);

    const imgUrl = await resolveImageUrl(selectedItem.id, n.imageRaw);

    const details = [
      ["Name", n.name || "—"],
      ["Subject", n.subject || "—"],
      ["Email", n.email || "—"],
      ["Phone", n.phone || "—"],
      ["Blood", n.blood || "—"],
      ["Created Date", formatFullDate(selectedItem.createdAt)],
      ["Message", n.message || "—"],
    ];

    const leftX = 14;
    const valueX = 48;
    const rightImageX = 122;
    const imageY = 34;
    const imageBoxW = 72;
    const imageBoxH = 72;

    if (imgUrl) {
      try {
        const prepared = await preparePdfImage(imgUrl, imageBoxW, imageBoxH);

        pdf.setDrawColor(200, 205, 212);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(rightImageX, imageY, imageBoxW, imageBoxH, 4, 4);

        pdf.addImage(
          prepared.dataUrl,
          prepared.format,
          rightImageX + prepared.offsetX,
          imageY + prepared.offsetY,
          prepared.drawW,
          prepared.drawH
        );
      } catch (error) {
        console.error("PDF image prepare failed:", error);
      }
    }

    let y = 46;

    pdf.setFontSize(12.5);

    for (const [label, value] of details.slice(0, 6)) {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(17, 24, 39);
      pdf.text(`${label}:`, leftX, y);

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(31, 41, 55);

      const lines = pdf.splitTextToSize(String(value), 62);
      pdf.text(lines, valueX, y);
      y += Math.max(13, lines.length * 6 + 2);
    }

    y += 10;

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text("Message:", leftX, y);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(31, 41, 55);

    const msgLines = pdf.splitTextToSize(n.message || "—", 176);
    pdf.text(msgLines, valueX, y);

    pdf.save(`${safe(n.name || "profile").replace(/\s+/g, "_")}_profile.pdf`);
  } catch (error) {
    console.error(error);
  }
});

async function preparePdfImage(url, maxW, maxH) {
  const img = await loadImage(url);

  const mime = getSafeImageMime(url);
  const format = mime === "image/png" ? "PNG" : "JPEG";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const cleanDataUrl = canvas.toDataURL(mime, 0.95);

  const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
  const drawW = canvas.width * ratio;
  const drawH = canvas.height * ratio;

  return {
    dataUrl: cleanDataUrl,
    format,
    drawW,
    drawH,
    offsetX: (maxW - drawW) / 2,
    offsetY: (maxH - drawH) / 2,
  };
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function getSafeImageMime(url) {
  const lowerUrl = String(url).toLowerCase();
  if (lowerUrl.includes(".png") || lowerUrl.startsWith("data:image/png")) {
    return "image/png";
  }
  return "image/jpeg";
}

/* -------------------- Edit Modal -------------------- */
async function openEdit(id) {
  const item = allData.find((x) => x.id === id);
  if (!item) return;

  selectedId = id;
  selectedItem = item;

  const n = normalize(item);

  editName.value = safe(n.name);
  editSubject.value = safe(n.subject);
  editPhone.value = safe(n.phone);
  editEmail.value = safe(n.email);
  editBlood.value = safe(n.blood);
  editMessage.value = safe(n.message);
  editImage.value = safe(n.imageRaw);
  editImageFile.value = "";

  const oldPreviewUrl = await resolveImageUrl(id, n.imageRaw);
  setEditPreview(oldPreviewUrl);

  openModal(editModal);
}

function closeEdit() {
  closeModal(editModal);
}

closeEditBtn.addEventListener("click", closeEdit);
cancelEditBtn.addEventListener("click", closeEdit);

editModal.addEventListener("click", (e) => {
  if (e.target === editModal) closeEdit();
});

editImage.addEventListener("input", async () => {
  const raw = safe(editImage.value);

  if (!raw) {
    setEditPreview("");
    return;
  }

  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    setEditPreview(raw);
    return;
  }

  try {
    const url = await getDownloadURL(ref(storage, raw));
    setEditPreview(url);
  } catch (error) {
    setEditPreview("");
  }
});

editImageFile.addEventListener("change", async () => {
  const file = editImageFile.files?.[0];

  if (!file) {
    const currentRaw = safe(editImage.value);

    if (!currentRaw) {
      setEditPreview("");
      return;
    }

    if (
      currentRaw.startsWith("http://") ||
      currentRaw.startsWith("https://") ||
      currentRaw.startsWith("data:")
    ) {
      setEditPreview(currentRaw);
      return;
    }

    try {
      const url = await getDownloadURL(ref(storage, currentRaw));
      setEditPreview(url);
    } catch (error) {
      setEditPreview("");
    }

    return;
  }

  try {
    const dataUrl = await readFileAsDataURL(file);
    setEditPreview(dataUrl);
  } catch (error) {
    setEditPreview("");
  }
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedId || !selectedItem) return;

  const previousImageRaw = normalize(selectedItem).imageRaw;
  let finalImageValue = safe(editImage.value);

  try {
    const file = editImageFile.files?.[0];

    if (file) {
      const storagePath = `contacts/${selectedId}/${Date.now()}_${file.name.replace(
        /\s+/g,
        "_"
      )}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      finalImageValue = storagePath;

      if (previousImageRaw && previousImageRaw !== finalImageValue) {
        await tryDeleteStorageFile(previousImageRaw);
      }
    }

    const payload = {
      name: safe(editName.value),
      subject: safe(editSubject.value),
      phone: safe(editPhone.value),
      email: safe(editEmail.value),
      blood: safe(editBlood.value),
      message: safe(editMessage.value),
      image: finalImageValue,
    };

    await updateDoc(doc(db, "contacts", selectedId), payload);

    imageCache.delete(selectedId);
    closeEdit();
  } catch (error) {
    console.error(error);
  }
});

/* -------------------- Delete Confirm -------------------- */
function askDelete(id) {
  const item = allData.find((x) => x.id === id);
  if (!item) return;

  deleteTargetId = id;
  const n = normalize(item);
  confirmText.textContent = `${n.name || "Unknown"} • ${n.email || "No Email"}`;

  openModal(confirmModal);
}

function closeConfirm() {
  closeModal(confirmModal);
  deleteTargetId = null;
}

closeConfirmBtn.addEventListener("click", closeConfirm);
cancelDeleteBtn.addEventListener("click", closeConfirm);

confirmModal.addEventListener("click", (e) => {
  if (e.target === confirmModal) closeConfirm();
});

confirmDeleteBtn.addEventListener("click", async () => {
  if (!deleteTargetId) return;

  const item = allData.find((x) => x.id === deleteTargetId);
  if (!item) {
    closeConfirm();
    return;
  }

  try {
    const n = normalize(item);

    await tryDeleteStorageFile(n.imageRaw);
    await deleteDoc(doc(db, "contacts", deleteTargetId));

    imageCache.delete(deleteTargetId);
    closeConfirm();
  } catch (error) {
    console.error(error);
  }
});



/* -------------------- Excel Export -------------------- */
exportBtn.addEventListener("click", async () => {
  try {
    if (!allData.length) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Contact Submissions");

    worksheet.columns = [
      { header: "Name", key: "name", width: 24 },
      { header: "Subject", key: "subject", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Blood", key: "blood", width: 12 },
      { header: "Created Date", key: "createdDate", width: 28 },
      { header: "Message", key: "message", width: 28 },
      { header: "Image", key: "image", width: 18 },
    ];

    /* Header Style */
    const headerRow = worksheet.getRow(1);
    headerRow.height = 24;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F4E78" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "D9D9D9" } },
        left: { style: "thin", color: { argb: "D9D9D9" } },
        bottom: { style: "thin", color: { argb: "D9D9D9" } },
        right: { style: "thin", color: { argb: "D9D9D9" } },
      };
    });

    for (let i = 0; i < allData.length; i++) {
      const item = allData[i];
      const n = normalize(item);
      const imageUrl = await resolveImageUrl(item.id, n.imageRaw);

      const row = worksheet.addRow({
        name: n.name || "",
        subject: n.subject || "",
        email: n.email || "",
        phone: n.phone || "",
        blood: n.blood || "",
        createdDate: formatFullDate(item.createdAt),
        message: n.message || "",
        image: "",
      });

      row.height = 78;

      const currentRowNumber = row.number;

      /* Text formatting */
      worksheet.getCell(`D${currentRowNumber}`).value = n.phone ? String(n.phone) : "";
      worksheet.getCell(`D${currentRowNumber}`).numFmt = "@";

      worksheet.getCell(`F${currentRowNumber}`).value = formatFullDate(item.createdAt) || "";
      worksheet.getCell(`F${currentRowNumber}`).numFmt = "@";

      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: colNumber === 7 ? "left" : "center",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin", color: { argb: "D9D9D9" } },
          left: { style: "thin", color: { argb: "D9D9D9" } },
          bottom: { style: "thin", color: { argb: "D9D9D9" } },
          right: { style: "thin", color: { argb: "D9D9D9" } },
        };

        cell.font = {
          size: 11,
          color: { argb: "1F2937" },
        };
      });

      /* Image thumbnail with orientation fix + center alignment */
      if (imageUrl) {
        try {
          const prepared = await fetchFixedImageForExcel(imageUrl);

          if (prepared && prepared.base64) {
            const imageId = workbook.addImage({
              base64: prepared.base64,
              extension: prepared.extension,
            });

            const imageColIndex = 7; // H column -> zero based index
            const cellWidthPx = 126; // H column width 18 ≈ around 126px
            const cellHeightPx = 104; // row height 78pt ≈ around 104px
            const maxImageWidth = 72;
            const maxImageHeight = 72;

            const fit = getContainSize(
              prepared.width,
              prepared.height,
              maxImageWidth,
              maxImageHeight
            );

            const offsetX = (cellWidthPx - fit.width) / 2;
            const offsetY = (cellHeightPx - fit.height) / 2;

            worksheet.addImage(imageId, {
              tl: {
                col: imageColIndex + offsetX / cellWidthPx,
                row: (currentRowNumber - 1) + offsetY / cellHeightPx,
              },
              ext: {
                width: fit.width,
                height: fit.height,
              },
              editAs: "oneCell",
            });
          } else {
            worksheet.getCell(`H${currentRowNumber}`).value = imageUrl;
            worksheet.getCell(`H${currentRowNumber}`).font = {
              color: { argb: "0563C1" },
              underline: true,
            };
            worksheet.getCell(`H${currentRowNumber}`).alignment = {
              vertical: "middle",
              horizontal: "center",
              wrapText: true,
            };
          }
        } catch (error) {
          worksheet.getCell(`H${currentRowNumber}`).value = imageUrl;
          worksheet.getCell(`H${currentRowNumber}`).font = {
            color: { argb: "0563C1" },
            underline: true,
          };
          worksheet.getCell(`H${currentRowNumber}`).alignment = {
            vertical: "middle",
            horizontal: "center",
            wrapText: true,
          };
        }
      }
    }

    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "contact_submissions.xlsx"
    );
  } catch (error) {
    console.error("Excel export failed:", error);
  }
});

async function fetchFixedImageForExcel(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);

    const mime = blob.type && blob.type.includes("png") ? "image/png" : "image/jpeg";
    const base64 = canvas.toDataURL(mime, 0.95);

    return {
      base64,
      extension: mime === "image/png" ? "png" : "jpeg",
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    return null;
  }
}

function getContainSize(originalWidth, originalHeight, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
  return {
    width: Math.max(1, Math.round(originalWidth * ratio)),
    height: Math.max(1, Math.round(originalHeight * ratio)),
  };
}