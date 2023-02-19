chrome.tabs.onCreated.addListener(() => {
  console.log("new tab is created");
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  console.log("Host URL: ", details.url);
  chrome.tabs.query({ url: "https://forum.paticik.com/*" }, async (tabs) => {
    const selector = await chrome.storage.sync.get("paticikTheme");
    tabs.forEach((tab) => {
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: [`styles/${selector.paticikTheme}.css`, "styles/all.css"],
      });
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: [`scripts/content.js`],
      });
    });
  });
});

chrome.webNavigation.onDOMContentLoaded.addListener(async (details) => {
  chrome.tabs.query({ url: "https://forum.paticik.com/*" }, async (tabs) => {
    const selector = await chrome.storage.sync.get("paticikTheme");
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        func: () => {
          document.querySelectorAll(".fa").forEach((e) => {
            e.classList.remove("fa");
            e.classList.add("fa-solid");
          });
        },
      });
    });
  });
});
