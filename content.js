const STORAGE_KEY = "vortex_saved_accounts";

function getCurrentUser() {
  const avatarImg = document.querySelector(".navbar-avatar-img");
  if (!avatarImg) return null;

  const username = avatarImg.getAttribute("alt") || "User";
  const avatar   = avatarImg.getAttribute("src") || "";
  const uid      = avatarImg.getAttribute("data-uid") || username;

  return { uid, username, avatar };
}

function captureLocalStorage() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return data;
}

function restoreLocalStorage(data) {
  if (!data) return;
  localStorage.clear();
  for (const [key, value] of Object.entries(data)) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
}

function captureSessionStorage() {
  const data = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    data[key] = sessionStorage.getItem(key);
  }
  return data;
}

function restoreSessionStorage(data) {
  if (!data) return;
  sessionStorage.clear();
  for (const [key, value] of Object.entries(data)) {
    try { sessionStorage.setItem(key, value); } catch (e) {}
  }
}

function createModalHtml() {
  const modalDiv = document.createElement("div");
  modalDiv.className  = "vx-overlay";
  modalDiv.id         = "vortex-switch-overlay";
  modalDiv.innerHTML  = `
    <div class="vx-modal">
      <div class="vx-header">
        <div class="vx-title">
          <i class="fa-solid fa-arrows-rotate"></i>
          <span>Switch Account</span>
        </div>
        <button class="vx-close" id="vx-modal-close">✕</button>
      </div>

      <div class="vx-section-label">Current Account</div>
      <div class="vx-current-card" id="vx-current-card">
        <div class="vx-user-info">
          <img class="vx-avatar" id="vx-curr-avatar" src="" alt="">
          <span class="vx-username" id="vx-curr-username">Loading...</span>
        </div>
        <span class="vx-badge-active">Active</span>
      </div>

      <div class="vx-section-label">Saved Accounts</div>
      <div class="vx-accounts-list" id="vx-accounts-list"></div>

      <button class="vx-btn vx-btn-primary vx-btn-full" id="vx-add-account-btn">
        <i class="fa-solid fa-plus"></i>
        <span>+ Add Account</span>
      </button>
    </div>
  `;
  document.body.appendChild(modalDiv);
}

function updateCurrentAccountUI(currentUser) {
  const avatarEl = document.getElementById("vx-curr-avatar");
  const nameEl   = document.getElementById("vx-curr-username");
  const currCard = document.getElementById("vx-current-card");

  if (currentUser) {
    avatarEl.src     = currentUser.avatar;
    nameEl.textContent = currentUser.username;
    currCard.style.display = "flex";
  } else {
    currCard.style.display = "none";
  }
}

async function renderSavedAccounts(currentUser) {
  const listContainer = document.getElementById("vx-accounts-list");
  listContainer.innerHTML = "";

  const storageData    = await chrome.storage.local.get([STORAGE_KEY]);
  const savedAccounts  = storageData[STORAGE_KEY] || [];
  const otherAccounts  = savedAccounts.filter(acc => !currentUser || acc.uid !== currentUser.uid);

  if (otherAccounts.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; color:#6A5A8A; font-size:12px; padding:14px;">
        No other accounts saved yet.
      </div>
    `;
    return;
  }

  otherAccounts.forEach(acc => {
    const item = document.createElement("div");
    item.className = "vx-account-item";
    item.innerHTML = `
      <div class="vx-user-info">
        <img class="vx-avatar" src="${acc.avatar}" alt="${acc.username}">
        <span class="vx-username">${acc.username}</span>
      </div>
      <div class="vx-actions">
        <button class="vx-btn vx-btn-outline vx-switch-to-btn" data-uid="${acc.uid}">Switch</button>
        <button class="vx-btn vx-btn-danger vx-delete-btn" data-uid="${acc.uid}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    item.querySelector(".vx-switch-to-btn").addEventListener("click", () => switchAccount(acc));
    item.querySelector(".vx-delete-btn").addEventListener("click",     () => deleteAccount(acc.uid));

    listContainer.appendChild(item);
  });
}

async function saveCurrentAccountState() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const response = await chrome.runtime.sendMessage({ action: "GET_COOKIES" });
  if (!response || !response.cookies) return;

  const storageData   = await chrome.storage.local.get([STORAGE_KEY]);
  let savedAccounts   = storageData[STORAGE_KEY] || [];
  const existingIdx   = savedAccounts.findIndex(acc => acc.uid === currentUser.uid);

  const accountData = {
    uid:            currentUser.uid,
    username:       currentUser.username,
    avatar:         currentUser.avatar,
    cookies:        response.cookies,
    localStorage:   captureLocalStorage(),
    sessionStorage: captureSessionStorage()
  };

  if (existingIdx >= 0) {
    savedAccounts[existingIdx] = accountData;
  } else {
    savedAccounts.push(accountData);
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: savedAccounts });
}

async function switchAccount(targetAccount) {
  await saveCurrentAccountState();

  restoreLocalStorage(targetAccount.localStorage || {});
  restoreSessionStorage(targetAccount.sessionStorage || {});

  const res = await chrome.runtime.sendMessage({
    action:  "SWITCH_ACCOUNT",
    account: targetAccount
  });

  if (res && res.success) {
    window.location.href = "https://playvortex.io/home";
  }
}

async function deleteAccount(uid) {
  const storageData  = await chrome.storage.local.get([STORAGE_KEY]);
  let savedAccounts  = storageData[STORAGE_KEY] || [];

  savedAccounts = savedAccounts.filter(acc => acc.uid !== uid);
  await chrome.storage.local.set({ [STORAGE_KEY]: savedAccounts });

  renderSavedAccounts(getCurrentUser());
}

async function handleAddAccount() {
  await saveCurrentAccountState();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.click();
  } else {
    await chrome.runtime.sendMessage({ action: "ADD_ACCOUNT" });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "https://playvortex.io/";
  }
}

function toggleModal(show) {
  const overlay = document.getElementById("vortex-switch-overlay");
  if (!overlay) return;

  if (show) {
    const currentUser = getCurrentUser();
    updateCurrentAccountUI(currentUser);
    renderSavedAccounts(currentUser);
    overlay.classList.add("vx-show");
  } else {
    overlay.classList.remove("vx-show");
  }
}

function injectSwitcherButton() {
  const navbarActions = document.querySelector(".navbar-actions");
  if (!navbarActions || document.getElementById("vortex-switcher-btn")) return;

  const logoutBtn = document.getElementById("logout-btn");

  const switchBtn = document.createElement("button");
  switchBtn.className = "navbar-icon-btn vortex-switch-btn";
  switchBtn.id        = "vortex-switcher-btn";
  switchBtn.title     = "Switch Account";
  switchBtn.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i>`;

  if (logoutBtn) {
    navbarActions.insertBefore(switchBtn, logoutBtn);
  } else {
    navbarActions.appendChild(switchBtn);
  }

  switchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleModal(true);
  });
}

function init() {
  createModalHtml();
  injectSwitcherButton();

  document.getElementById("vx-modal-close").addEventListener("click",  () => toggleModal(false));
  document.getElementById("vx-add-account-btn").addEventListener("click", handleAddAccount);

  document.getElementById("vortex-switch-overlay").addEventListener("click", (e) => {
    if (e.target.id === "vortex-switch-overlay") toggleModal(false);
  });

  const currentUser = getCurrentUser();
  if (currentUser) saveCurrentAccountState();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
