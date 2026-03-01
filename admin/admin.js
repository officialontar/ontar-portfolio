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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/* -------------------- DOM -------------------- */
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const clearLoginBtn = document.getElementById("clearLoginBtn");
const loginError = document.getElementById("loginError");

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

/* View Modal */
const viewModal = document.getElementById("viewModal");
const closeViewBtn = document.getElementById("closeViewBtn");
const doneViewBtn = document.getElementById("doneViewBtn");
const editFromViewBtn = document.getElementById("editFromViewBtn");
const deleteFromViewBtn = document.getElementById("deleteFromViewBtn");
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
const editMessage = document.getElementById("editMessage");

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

/* Cache resolved image URL by docId */
const imageCache = new Map();

/* -------------------- Helpers -------------------- */
function openModal(m){ m.classList.add("open"); }
function closeModal(m){ m.classList.remove("open"); }

function safe(v){ return (v ?? "").toString().trim(); }
function lower(v){ return safe(v).toLowerCase(); }

/* === FORMAT CREATED DATE === */
function formatDate(timestamp){
  if(!timestamp?.seconds) return "—";

  const date = new Date(timestamp.seconds * 1000);

  return date.toLocaleString("en-GB", {
    day:"2-digit",
    month:"short",
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hour12:true
  });
}

function formatFullDate(timestamp){
  if(!timestamp?.seconds) return "—";

  const date = new Date(timestamp.seconds * 1000);

  return date.toLocaleString("en-GB", {
    day:"2-digit",
    month:"long",   // 🔥 এখানে long
    year:"numeric",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hour12:true
  });
}

function getCreatedSeconds(x){

  if (x?.createdAt?.seconds) return x.createdAt.seconds;
  return 0;
}

/* Universal field mapping (আপনার DB field নাম যাই থাকুক) */
function normalize(item){
  const name = item.name || item.fullName || item.full_name || "";
  const phone = item.phone || item.mobile || item.mobileNumber || item.mobile_number || "";
  const email = item.email || "";
  const subject = item.subject || "";
  const blood = item.blood || item.bloodGroup || item.blood_group || "";
  const message = item.message || item.msg || "";
  const imageRaw = item.image || item.imageUrl || item.profile_pic || item.file || item.fileUrl || item.photo || "";
  return { name, phone, email, subject, blood, message, imageRaw };
}

/* ---- Image URL Resolver (http/https OR gs:// OR path) ---- */
async function resolveImageUrl(docId, imageRaw){
  const raw = safe(imageRaw);
  if (!raw) return "";

  // cache
  if (imageCache.has(docId)) return imageCache.get(docId);

  // if already http(s) / data url
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) {
    imageCache.set(docId, raw);
    return raw;
  }

  // if gs:// OR storage path
  try{
    const url = await getDownloadURL(ref(storage, raw));
    imageCache.set(docId, url);
    return url;
  }catch(e){
    // fallback: no image
    imageCache.set(docId, "");
    return "";
  }
}

/* ---- Try delete storage file when delete doc ---- */
async function tryDeleteStorageFile(imageRaw){
  const raw = safe(imageRaw);
  if (!raw) return;

  // If imageRaw is http(s) download url -> we cannot easily delete unless you saved storage path
  // If imageRaw is gs:// or path -> can delete
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return;

  try{
    await deleteObject(ref(storage, raw));
  }catch(e){
    // ignore (file may not exist / permission)
  }
}

/* -------------------- Auth (Must login every time) -------------------- */
await setPersistence(auth, browserSessionPersistence);

// Force logout on each page open/reload (you requested)
try { await signOut(auth); } catch(e){}

/* Login form */
loginForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  loginError.style.display = "none";
  try{
    await signInWithEmailAndPassword(auth, email.value, password.value);
  }catch(err){
    loginError.style.display = "block";
  }
});

clearLoginBtn.addEventListener("click", ()=>{
  email.value = "";
  password.value = "";
  loginError.style.display = "none";
});

logoutBtn.addEventListener("click", async ()=>{
  await signOut(auth);
});

onAuthStateChanged(auth, (user)=>{
  if(user){
    loginSection.style.display = "none";
    dashboard.style.display = "block";
    startRealtime();
  }else{
    loginSection.style.display = "block";
    dashboard.style.display = "none";
  }
});

/* -------------------- Firestore realtime -------------------- */
function startRealtime(){
  metaText.textContent = "Realtime enabled • loading…";
  onSnapshot(collection(db, "contacts"), (snap)=>{
    allData = [];
    imageCache.clear();

    snap.forEach(d=>{
      allData.push({ id: d.id, ...d.data() });
    });

    metaText.textContent = `Realtime enabled • ${allData.length} total submissions`;
    render();
  }, ()=>{
    metaText.textContent = "Failed to load. Check Firestore rules/auth.";
  });
}

/* -------------------- Render + Search/Filter/Sort -------------------- */
function render(){
  const q = lower(searchInput.value);
  const blood = safe(bloodFilter.value);
  const ns = safe(nameSort.value); // az / za
  const ds = safe(dateSort.value); // new / old

  let list = [...allData];

  // filter by search (name/email/phone/blood/subject)
  if(q){
    list = list.filter(item=>{
      const n = normalize(item);
      const hay = `${lower(n.name)} ${lower(n.email)} ${lower(n.phone)} ${lower(n.blood)} ${lower(n.subject)}`;
      return hay.includes(q);
    });
  }

  // filter blood
  if(blood){
    list = list.filter(item=>{
      const n = normalize(item);
      return safe(n.blood) === blood;
    });
  }

  /* ✅ FIX: date sort first, name sort last
     কারণ আগে name sort করার পরে date sort আবার override করে দিচ্ছিল
     এজন্য Z→A ঠিকভাবে কাজ করত না */
  if(ds === "new"){
    list.sort((a,b)=>getCreatedSeconds(b) - getCreatedSeconds(a));
  }else if(ds === "old"){
    list.sort((a,b)=>getCreatedSeconds(a) - getCreatedSeconds(b));
  }

  // sort name (case-insensitive, stable)
  if(ns === "az"){
    list.sort((a,b)=>{
      const an = (normalize(a).name || "").toLowerCase();
      const bn = (normalize(b).name || "").toLowerCase();
      return an.localeCompare(bn, undefined, { sensitivity: "base" });
    });
  }
  else if(ns === "za"){
    list.sort((a,b)=>{
      const an = (normalize(a).name || "").toLowerCase();
      const bn = (normalize(b).name || "").toLowerCase();
      return bn.localeCompare(an, undefined, { sensitivity: "base" });
    });
  }

  tableBody.innerHTML = "";

  if(list.length === 0){
    noResults.style.display = "block";
    return;
  }
  noResults.style.display = "none";

  // Render rows
  for(const item of list){
    const n = normalize(item);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(n.name) || "—"}</td>
      <td>${escapeHtml(n.email) || "—"}</td>
      <td>${escapeHtml(n.phone) || "—"}</td>
      <td>${formatDate(item.createdAt)}</td>
      <td>${escapeHtml(n.blood) || "—"}</td>
      <td>
        <img class="thumb" id="img_${item.id}" style="display:none;" alt="img">
        <span id="imgtxt_${item.id}" style="color:rgba(255,255,255,0.6);">—</span>
      </td>
      <td>
        <div class="actions">
          <button class="primary" data-act="view" data-id="${item.id}">View</button>
          <button class="warning" data-act="edit" data-id="${item.id}">Edit</button>
          <button class="danger" data-act="delete" data-id="${item.id}">Delete</button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);

    // async image resolve
    (async ()=>{
      const url = await resolveImageUrl(item.id, n.imageRaw);
      const img = document.getElementById(`img_${item.id}`);
      const txt = document.getElementById(`imgtxt_${item.id}`);
      if(url){
        img.src = url;
        img.style.display = "inline-block";
        txt.style.display = "none";
      }else{
        img.style.display = "none";
        txt.style.display = "inline";
      }
    })();
  }
}

/* Escape HTML to avoid issues */
function escapeHtml(str){
  return safe(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* Events for search/filter/sort/clear */
searchInput.addEventListener("input", render);
bloodFilter.addEventListener("change", render);
nameSort.addEventListener("change", render);
dateSort.addEventListener("change", render);

clearBtn.addEventListener("click", ()=>{
  searchInput.value = "";
  bloodFilter.value = "";
  nameSort.value = "";
  dateSort.value = "new";
  render();
});

/* Table action delegation */
tableBody.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;

  const act = btn.dataset.act;
  const id = btn.dataset.id;
  if(!act || !id) return;

  if(act === "view") openView(id);
  if(act === "edit") openEdit(id);
  if(act === "delete") askDelete(id);
});

/* -------------------- View Modal -------------------- */
async function openView(id){
  const item = allData.find(x=>x.id===id);
  if(!item) return;

  selectedId = id;
  selectedItem = item;

  const n = normalize(item);
  const imgUrl = await resolveImageUrl(id, n.imageRaw);

  if(imgUrl){
    viewImg.src = imgUrl;
    viewImg.style.display = "block";
  }else{
    viewImg.src = "";
    viewImg.style.display = "none";
  }

  const rows = [
    ["Name", n.name || "—"],
    ["Email", n.email || "—"],
    ["Phone", n.phone || "—"],
    ["Subject", n.subject || "—"],
    ["Blood", n.blood || "—"],
    ["Created Date", formatFullDate(item.createdAt)],
  ];

  viewGrid.innerHTML = rows.map(([k,v])=>`
    <div class="kv">
      <div class="k">${escapeHtml(k)}</div>
      <div class="v">${escapeHtml(v)}</div>
    </div>
  `).join("");

  viewMessage.textContent = n.message || "—";

  openModal(viewModal);
}

function closeView(){
  closeModal(viewModal);
}

/* ✅ FIX: close button ensure always works */
closeViewBtn.addEventListener("click", closeView);
doneViewBtn.addEventListener("click", closeView);
viewModal.addEventListener("click",(e)=>{ if(e.target === viewModal) closeView(); });

/* ✅ ADD: ESC key to close view modal (extra smooth, doesn’t break anything) */
document.addEventListener("keydown",(e)=>{
  if(e.key === "Escape" && viewModal.classList.contains("open")){
    closeView();
  }
});

editFromViewBtn.addEventListener("click", ()=>{
  if(!selectedId) return;
  closeView();
  openEdit(selectedId);
});

deleteFromViewBtn.addEventListener("click", ()=>{
  if(!selectedId) return;
  closeView();
  askDelete(selectedId);
});

/* -------------------- Edit Modal -------------------- */
function openEdit(id){
  const item = allData.find(x=>x.id===id);
  if(!item) return;

  selectedId = id;
  selectedItem = item;

  const n = normalize(item);

  editName.value = safe(n.name);
  editPhone.value = safe(n.phone);
  editEmail.value = safe(n.email);
  editSubject.value = safe(n.subject);
  editBlood.value = safe(n.blood);
  editMessage.value = safe(n.message);
  editImage.value = safe(n.imageRaw);

  openModal(editModal);
}

function closeEdit(){
  closeModal(editModal);
}
closeEditBtn.addEventListener("click", closeEdit);
cancelEditBtn.addEventListener("click", closeEdit);
editModal.addEventListener("click",(e)=>{ if(e.target === editModal) closeEdit(); });

editForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  if(!selectedId) return;

  // We save normalized standard keys (Best Practice)
  const payload = {
    name: safe(editName.value),
    phone: safe(editPhone.value),
    email: safe(editEmail.value),
    subject: safe(editSubject.value),
    blood: safe(editBlood.value),
    message: safe(editMessage.value),
    image: safe(editImage.value),
  };

  try{
    await updateDoc(doc(db, "contacts", selectedId), payload);
    closeEdit();
  }catch(err){
    alert("Update failed. Check Firestore rules.");
  }
});

/* -------------------- Delete Confirm -------------------- */
function askDelete(id){
  const item = allData.find(x=>x.id===id);
  if(!item) return;

  deleteTargetId = id;
  const n = normalize(item);
  confirmText.textContent = `${n.name || "Unknown"} • ${n.email || ""}`;
  openModal(confirmModal);
}

function closeConfirm(){
  closeModal(confirmModal);
  deleteTargetId = null;
}

closeConfirmBtn.addEventListener("click", closeConfirm);
cancelDeleteBtn.addEventListener("click", closeConfirm);
confirmModal.addEventListener("click",(e)=>{ if(e.target === confirmModal) closeConfirm(); });

confirmDeleteBtn.addEventListener("click", async ()=>{
  if(!deleteTargetId) return;

  const item = allData.find(x=>x.id===deleteTargetId);
  const n = item ? normalize(item) : null;

  try{
    await deleteDoc(doc(db, "contacts", deleteTargetId));
    if(n) await tryDeleteStorageFile(n.imageRaw);
    closeConfirm();
  }catch(err){
    alert("Delete failed. Check Firestore/Storage rules.");
  }
});

/* -------------------- CSV Export -------------------- */
exportBtn.addEventListener("click", ()=>{
  // export current filtered view (based on current UI filters)
  const q = lower(searchInput.value);
  const blood = safe(bloodFilter.value);

  let list = [...allData];

  if(q){
    list = list.filter(item=>{
      const n = normalize(item);
      const hay = `${lower(n.name)} ${lower(n.email)} ${lower(n.phone)} ${lower(n.blood)} ${lower(n.subject)}`;
      return hay.includes(q);
    });
  }
  if(blood){
    list = list.filter(item=>{
      const n = normalize(item);
      return safe(n.blood) === blood;
    });
  }

  let csv = "Name,Email,Phone,Subject,Blood,Message,Image\n";
  for(const item of list){
    const n = normalize(item);
    const row = [
      n.name, n.email, n.phone, n.subject, n.blood, n.message, n.imageRaw
    ].map(v => `"${safe(v).replaceAll('"','""')}"`).join(",");
    csv += row + "\n";
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "contact_submissions.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});