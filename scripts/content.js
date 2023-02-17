initGeneral();
async function initGeneral() {
  console.log(
    "%cINIT GENERAL",
    "font-size: 30px; color: tomato;",
    chrome.runtime.getURL("jeo.jpg")
  );

  if (/\/topic/.test(window.location.pathname)) initTopic();
}

function initTopic() {
  console.log("%cINIT TOPIC", "font-size: 30px; color: tomato;");
  document
    .querySelectorAll("div.cAuthorPane_photoWrap > a > img")
    .forEach((e) => (e.src = chrome.runtime.getURL("jeo.jpg")));
  onTopicLoad();

  return;
  document.querySelectorAll(".ipsEmbeddedOther > iframe").forEach((e) => {
    e.addEventListener("load", (el) => {
      console.log("TEST TEST TEST");
      return;
      if (e.src.includes("reddit")) {
        const link = e.src.match(/https:\/\/www\.reddit\.com.*/gm);
        const p = document.createDocumentFragment("p");
        p.innerHTML = `Reddit Link: ${link}`;
        e.closest("div.commentContent").appendChild(p);
        e.remove();
      }
    });
  });
}
function onTopicLoad() {
  console.log("%cDOM Content load", "font-size: 30px; color: tomato;");
  observePagination();
  iframeController({ delay: 200 });
  // gifController({ delay: 200 });
}
function addListenerToPagination() {
  const elList = Array.from(
    document.querySelectorAll("ul.ipsPagination > li > a")
  );
  for (let i = 0; i < elList.length; i++) {
    elList[i].addEventListener("click", paginationHandler, false);
    elList[i].setAttribute("data-listening", "true");
  }
}
async function iframeController({ delay }) {
  if (!!delay) await sleep(delay);
  document.querySelector("#comments").setAttribute("data-checkingIframe", true);
  let iframeList = Array.from(document.querySelectorAll("iframe"));

  // if (iframeList.length <= 0) return;
  const update = () => {
    const int = setInterval(() => {
      iframeList = Array.from(document.querySelectorAll("iframe"));

      for (let i = 0; i < iframeList.length; i++) {
        const src = !!iframeList[i].getAttribute("data-embed-src")
          ? iframeList[i].getAttribute("data-embed-src")
          : iframeList[i].src;
        if (src.includes("reddit")) {
          const link = src.match(/https:\/\/www\.reddit\.com.*/gm);
          const title = src.match(/\/comments\/[0-9a-z]+\/([a-z_]+)/i)[1];
          const p = document.createElement("p");
          p.id = "iframe-modified-content";
          p.innerHTML = `Reddit Link: <a target="_blank" href="${link}"><strong>${title}</strong></a>`;
          iframeList[i]
            .closest("div[data-role='commentContent']")
            .appendChild(p);
          iframeList[i].remove();
        }
      }
      if (
        !!Array.from(document.querySelectorAll("iframe")).find(
          (e) =>
            e.src.includes("reddit") ||
            (e.getAttribute("data-embed-src") &&
              e.getAttribute("data-embed-src").includes("reddit"))
        )
      ) {
        return;
      }
      document
        .querySelector("#comments")
        .removeAttribute("data-checkingIframe");
      clearInterval(int);
    }, 500);
  };
  update();
}

async function gifController({ delay }) {
  if (!!delay) await sleep(delay);
  const commentList = document.querySelectorAll(
    "div[data-role='commentContent']"
  );

  for (let i = 0; i < commentList.length; i++) {
    const imgList = commentList[i].querySelectorAll("a");

    imgList.forEach((e) => {
      if (e.href.includes(".gifv"))
        e.addEventListener("mouseover", () => {
          e.style.position = "relative";
        });
      e.addEventListener("mouseleave", () => {
        // document.querySelector("#tooltip-frame").remove();
      });
    });
  }
}

function observeIframe({ el, cb }) {
  const config = { attributes: true, childList: false, subtree: false };
  const obsCb = (mutationList, observer) => {
    for (const mutation of mutationList) {
    }
  };
  const observer = new MutationObserver(obsCb);
  observer.observe(el.closest("div[data-role='commentContent']"), config);
}

function observePagination() {
  const target = document.getElementById("comments");
  const config = { attributes: true, childList: true, subtree: false };
  const cb = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "animating"
      ) {
        const comments = document.querySelector("#comments");
        const s = comments.getAttribute("data-checkingIframe");
        if (!!!s) iframeController({ delay: 500 });
        gifController({ delay: 500 });
        return;
      }
    }
  };

  const observer = new MutationObserver(cb);
  observer.observe(target, config);

  // observer.disconnect();
}

/* Utils */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
