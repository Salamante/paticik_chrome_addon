document.querySelectorAll("button").forEach((e) => {
  e.addEventListener("click", () => {
    document.querySelectorAll("button").forEach((btn) => {
      if (btn == e) return;
      btn.classList.remove("btn-active");
    });
    if (!e.classList.contains("btn-active")) e.classList.add("btn-active");

    chrome.storage.sync.set({ paticikTheme: e.getAttribute("value") });
    chrome.tabs.query({ url: "https://forum.paticik.com/*" }, async (tabs) => {
      tabs.forEach((tab) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            window.location.reload();
          },
        });
      });
    });
  });
});

chrome.storage.sync.get("paticikTheme").then((res) => {
  const active = Array.from(document.querySelectorAll("button")).find(
    (e) => e.value == res.paticikTheme
  );
  active.classList.add("btn-active");
});
