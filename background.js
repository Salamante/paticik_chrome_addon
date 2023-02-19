chrome.tabs.onCreated.addListener(() => {
  console.log("new tab is created");
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  console.log("Host URL: ", details);
  if (details.frameId != 0) return;
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
  if (details.frameId != 0) return;
  chrome.tabs.query({ url: "https://forum.paticik.com/*" }, async (tabs) => {
    const selector = await chrome.storage.sync.get("paticikTheme");
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: [`scripts/onLoad.js`],
      });
    });
  });
});
