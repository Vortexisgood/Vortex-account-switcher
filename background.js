const VORTEX_DOMAIN = "playvortex.io";
const VORTEX_URL = "https://playvortex.io/";

async function getVortexCookies() {
  const cookies = await chrome.cookies.getAll({ domain: VORTEX_DOMAIN });
  return cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    expirationDate: c.expirationDate
  }));
}

async function clearVortexCookies() {
  const cookies = await chrome.cookies.getAll({ domain: VORTEX_DOMAIN });
  for (const cookie of cookies) {
    const protocol = cookie.secure ? "https:" : "http:";
    const cookieUrl = `${protocol}//${cookie.domain.replace(/^\./, "")}${cookie.path}`;
    await chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
  }
}

async function setVortexCookies(cookiesList) {
  await clearVortexCookies();
  for (const cookie of cookiesList) {
    const protocol = cookie.secure ? "https:" : "http:";
    const domain = cookie.domain.replace(/^\./, "");
    const cookieUrl = `${protocol}//${domain}${cookie.path}`;
    
    const details = {
      url: cookieUrl,
      name: cookie.name,
      value: cookie.value,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite
    };
    
    if (cookie.expirationDate) {
      details.expirationDate = cookie.expirationDate;
    }
    
    try {
      await chrome.cookies.set(details);
    } catch (e) {
      console.error(e);
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "GET_COOKIES") {
    getVortexCookies().then(cookies => sendResponse({ cookies }));
    return true;
  }

  if (message.action === "SWITCH_ACCOUNT") {
    (async () => {
      await setVortexCookies(message.account.cookies);
      sendResponse({ success: true });
    })();
    return true;
  }

  if (message.action === "ADD_ACCOUNT") {
    (async () => {
      await clearVortexCookies();
      sendResponse({ success: true });
    })();
    return true;
  }
});
