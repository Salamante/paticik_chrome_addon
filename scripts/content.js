init();

async function init() {
  const that = this;
  const topic_page = /\/topic/.test(window.location.pathname);
  const discover_page = /\/discover/.test(window.location.pathname);
  const home_page = /\/home/.test(window.location.pathname);

  const _topic = {
    init() {
      const a = document.body.getAttribute("_topic-initialized");

      document.body.setAttribute("_topic-initialized", true);
      this.observeHydration();
      this.replaceAvatar();
      this.replaceEditorIcons();
    },

    observeHydration() {
      const target = document.getElementById("comments");
      const config = { attributes: true, childList: true, subtree: true };
      const cb = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName != "data-checkingiframe"
          ) {
            const comments = document.querySelector("#comments");
            const s = comments.getAttribute("data-checkingIframe");
            if (!!s) return;
            else this.iframeController({ delay: 500 });
          }
        }
      };

      const observer = new MutationObserver(cb);
      observer.observe(target, config);
    },

    async iframeController(delay) {
      if (!!delay) await that.sleep(delay);

      const comments = document.querySelector("#comments");

      comments.setAttribute("data-checkingIframe", true);
      let iframeList = Array.from(document.querySelectorAll("iframe"));

      // if (iframeList.length <= 0) return;
      const update = () => {
        const int = setInterval(() => {
          iframeList = Array.from(document.querySelectorAll("iframe"));
          const redditList = iframeList.filter(
            (e) =>
              e.src.includes("reddit") ||
              (!!e.getAttribute("data-embed-src") &&
                e.getAttribute("data-embed-src").includes("reddit"))
          );
          if (redditList.length <= 0) {
            comments.removeAttribute("data-checkingIframe");
            clearInterval(int);
            return;
          }

          for (let i = 0; i < redditList.length; i++) {
            const src = !!redditList[i].getAttribute("data-embed-src")
              ? redditList[i].getAttribute("data-embed-src")
              : redditList[i].src;
            const link = src.match(/https:\/\/www\.reddit\.com.*/gm);
            let title = src.match(/\/comments\/[0-9a-z]+\/([a-z_]+)/i);

            if (!!title && title.length > 0) title = title[1];
            else if (
              !!redditList[i].contentWindow.document.body.querySelector("a")
            ) {
              title =
                redditList[i].contentWindow.document.body.querySelector(
                  "a"
                ).innerText;
            } else title = "Some reddit post";
            const p = document.createElement("p");
            p.id = "iframe-modified-content";
            p.innerHTML = `Reddit Link: <a target="_blank" href="${link}"><strong>${title}</strong></a>`;
            redditList[i]
              .closest("div[data-role='commentContent']")
              .appendChild(p);
            redditList[i].remove();
          }
        }, 500);
      };
      update();
    },

    replaceAvatar() {
      const newImg = chrome.runtime.getURL("avatar.jpg");
      const arr = Array.from(
        document.querySelectorAll(
          "div.cAuthorPane_photoWrap > a.ipsUserPhoto > img"
        )
      );
      arr.forEach((e) => (e.src = newImg));
    },

    replaceEditorIcons() {
      const int = setInterval(() => {
        if (!!!document.querySelector("#cke_1_top")) return;
        document.querySelector("#cke_1_top").classList.remove("cke_reset_all");
        const s = [
          "cke_15",
          "cke_16",
          "cke_17",
          "cke_18",
          "cke_19",
          "cke_20",
          "cke_21",
          "cke_22",
          "cke_23",
          "cke_24",
          "cke_25",
        ];
        const fa = [
          "fa-link",
          "fa-quote-right",
          "fa-code",
          "fa-face-grin",
          "fa-list",
          "fa-list-ol",
          "fa-align-left",
          "fa-align-justify",
          "fa-palette",
          "fa-eye-slash",
          "fa-eye",
        ];
        for (let i = 0; i < s.length; i++) {
          const el = document.getElementById(s[i]);
          if (!!!el || el.classList.contains("n-flex-center")) continue;
          el.classList.add("n-flex-center");
          const p = document.createElement("i");
          p.classList.add("fa-solid", fa[i], "fa-lg", "n-text-color");
          el.querySelector("span:nth-child(1)").remove();
          el.prepend(p);
        }
        // const cke_15 = document.querySelector("#cke_15");
        // cke_15.classList.add("n-flex-center");
        // const p = document.createElement("i");
        // p.classList.add("fa-solid", "fa-link", "fa-lg", "n-text-color");
        // cke_15.querySelector("span:nth-child(1)").remove();
        // cke_15.prepend(p);

        clearInterval(int);
      }, 500);
    },
  };

  if (topic_page) _topic.init();
}

/* Utils */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
