const STORAGE_KEY = "vortex_saved_accounts";

async function loadPopupUI() {
  const listContainer = document.getElementById("popup-accounts-list");
  const avatarEl      = document.getElementById("popup-curr-avatar");
  const nameEl        = document.getElementById("popup-curr-username");
  const currCard      = document.getElementById("popup-current-card");

  listContainer.innerHTML = "";

  const storageData   = await chrome.storage.local.get([STORAGE_KEY]);
  const savedAccounts = storageData[STORAGE_KEY] || [];
  const [tab]         = await chrome.tabs.query({ active: true, currentWindow: true });

  let activeAccount = null;

  if (savedAccounts.length > 0) {
    activeAccount     = savedAccounts[savedAccounts.length - 1];
    avatarEl.src      = activeAccount.avatar;
    nameEl.textContent = activeAccount.username;
  } else {
    currCard.style.display = "none";
  }

  const otherAccounts = savedAccounts.filter(acc => !activeAccount || acc.uid !== activeAccount.uid);

  if (otherAccounts.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; color:#6A5A8A; font-size:11px; padding:10px;">
        No saved accounts.
      </div>
    `;
  } else {
    otherAccounts.forEach(acc => {
      const item = document.createElement("div");
      item.className      = "vx-account-item";
      item.style.padding  = "8px 10px";
      item.innerHTML = `
        <div class="vx-user-info">
          <img class="vx-avatar" src="${acc.avatar}" style="width:28px; height:28px;">
          <span class="vx-username" style="font-size:12px;">${acc.username}</span>
        </div>
        <button class="vx-btn vx-btn-outline vx-switch-to-btn" style="padding:4px 10px; font-size:11px;">
          Switch
        </button>
      `;

      item.querySelector(".vx-switch-to-btn").addEventListener("click", async () => {
        await chrome.runtime.sendMessage({ action: "SWITCH_ACCOUNT", account: acc });

        if (tab && tab.url && tab.url.includes("playvortex.io")) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (lsData, ssData) => {
              localStorage.clear();
              for (const [k, v] of Object.entries(lsData || {})) {
                try { localStorage.setItem(k, v); } catch (e) {}
              }
              sessionStorage.clear();
              for (const [k, v] of Object.entries(ssData || {})) {
                try { sessionStorage.setItem(k, v); } catch (e) {}
              }
            },
            args: [acc.localStorage || {}, acc.sessionStorage || {}]
          }).then(() => {
            chrome.tabs.update(tab.id, { url: "https://playvortex.io/home" });
          });
        } else {
          chrome.tabs.create({ url: "https://playvortex.io/home" });
        }

        window.close();
      });

      listContainer.appendChild(item);
    });
  }
}

document.getElementById("popup-add-account-btn").addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ action: "ADD_ACCOUNT" });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.update(tab.id, { url: "https://playvortex.io/" });
  } else {
    chrome.tabs.create({ url: "https://playvortex.io/" });
  }
  window.close();
});

document.addEventListener("DOMContentLoaded", loadPopupUI);
