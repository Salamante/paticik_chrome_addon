init();

async function init() {
  const that = this;
  const topic_page = /\/topic/.test(window.location.pathname);
  const forum_page = /\/forum/.test(window.location.pathname);
  const discover_page = /\/discover/.test(window.location.pathname);
  const home_page = window.location.pathname === "/";

  const _home = {
    init() {
      this.reArrange();

      const btnList = document.querySelectorAll(
        "li.cForumRow > div.ipsDataItem_icon"
      );
      console.log("🚀 ~ file: content.js:17 ~ init ~ btnList:", btnList);
      btnList.forEach((el) => {
        el.style = "cursor: pointer";
        const target = !!el.querySelector("a")
          ? el.querySelector("a")
          : el.querySelector("span");
        // if (!!target.getAttribute("is-favorite")) return;
        target.addEventListener("click", (e) => {
          e.preventDefault();

          if (e.target.closest("li").getAttribute("is-favorite")) {
            e.target.closest("li").removeAttribute("is-favorite");
            const id = e.target.closest("li").getAttribute("data-forumid");
            const l = JSON.parse(localStorage.getItem("favorite_list"));
            l.splice(l.indexOf(id), 1);
            localStorage.setItem("favorite_list", JSON.stringify(l));
            window.location.reload();
            return;
          } else {
            e.target.closest("li").setAttribute("is-favorite", true);

            const d = e.target.closest("li").getAttribute("data-forumid");
            const list = localStorage.getItem("favorite_list");
            if (!!!list) {
              localStorage.setItem("favorite_list", `[${d}]`);
            } else {
              const l = JSON.parse(list);
              if (!l.includes(d)) {
                l.push(d);
                localStorage.setItem("favorite_list", JSON.stringify(l));
              }
            }
          }
          this.reArrange();
        });
      });
    },

    reArrange() {
      let fav = localStorage.getItem("favorite_list");
      if (!!fav && fav.length > 0)
        fav = JSON.parse(localStorage.getItem("favorite_list"));
      else return;

      let sub;
      let ol;
      let h2;
      if (!!!document.querySelector("#favorite-list")) {
        sub = document.createElement("li");
        sub.classList.add(
          "cForumRow",
          "ipsBox",
          "ipsSpacer_bottom",
          "ipsResponsive_pull"
        );
        sub.setAttribute("data-categoryid", 1);
        sub.setAttribute("id", "favorite-list");
        sub.setAttribute("is-favorite", true);

        h2 = document.createElement("h2");
        const a1 = document.createElement("a");
        a1.href = "#";
        a1.classList.add(
          "ipsPos_right",
          "ipsJS_show",
          "ipsType_noUnderline",
          "cForumToggle"
        );
        a1.setAttribute("data-action", "toggleCategory");
        const a2 = document.createElement("a");
        a2.innerText = "Favori Kategoriler";
        h2.classList.add(
          "ipsType_sectionTitle",
          "ipsType_reset",
          "cForumTitle"
        );
        h2.appendChild(a2);
        h2.appendChild(a1);
        sub.prepend(h2);

        const ol = document.createElement("ol");
        ol.classList.add(
          "ipsDataList",
          "ipsDataList_large",
          "ipsDataList_zebra"
        );
        ol.setAttribute("data-role", "forums");
        sub.appendChild(ol);
      } else sub = document.querySelector("#favorite-list");
      console.log("🚀 ~ file: content.js:67 ~ reArrange ~ sub:", sub);

      fav.forEach((e) => {
        const el = document.querySelector(`li[data-forumid='${e}']`);
        el.setAttribute("is-favorite", true);
        sub.querySelector("ol").appendChild(el);
      });

      document.querySelector("ol.cForumList").prepend(sub);
    },
  };

  const _topic = {
    init() {
      const a = document.body.getAttribute("_topic-initialized");

      document.body.setAttribute("_topic-initialized", true);
      this.replaceEditorIcons();
      this.observeHydration();
      this.replaceAvatar();
      this.replaceEditorIcons();
      // this.imgPreviewModal();

      document.body.addEventListener("beforeunload", () => {
        alert("UNLOAD EVENT IS FIRED");
      });
    },

    observeHydration() {
      const target = document.getElementById("comments");
      const config = { attributes: true, childList: true, subtree: true };
      const cb = (mutationList, observer) => {
        this.avatarController();
        for (const mutation of mutationList) {
          if (document.querySelectorAll(".fa").length > 0)
            document.querySelectorAll(".fa").forEach((e) => {
              e.classList.remove("fa");
              e.classList.add("fa-solid");
            });
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
          const twitterList = iframeList.filter(
            (e) =>
              e.getAttribute("data-embed-src")?.includes("twitter") ||
              e.src?.includes("twitter")
          );
          console.log(
            "🚀 ~ file: content.js:180 ~ int ~ twitterList:",
            twitterList
          );
          if (redditList.length <= 0 && twitterList.length <= 0) {
            comments.removeAttribute("data-checkingIframe");
            clearInterval(int);
            return;
          }

          // update reddit embeds
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

          // update twitter embeds
          for (let i = 0; i < twitterList.length; i++) {
            const src_norender = twitterList[i].getAttribute("data-embed-src");
            const src_render = twitterList[i].src;
            const link =
              (!!src_norender &&
                new URLSearchParams(src_norender).get("url")) ||
              src_render;

            const p = document.createElement("p");
            p.innerHTML = `Twitter link: <a target="_blank" href="${link}"><strong>Tweet</strong></a>`;
            twitterList[i].closest("div[data-role='commentContent']").append(p);
            twitterList[i].remove();
          }
        }, 500);
      };
      update();
    },

    avatarController() {
      if (window.isCheckingAvatar) return;

      window.isCheckingAvatar = true;
      const arr = Array.from(
        document.querySelectorAll(
          "div.cAuthorPane_photoWrap > a.ipsUserPhoto > img"
        )
      );
      if (arr.length <= 0) {
        window.isCheckingAvatar = false;
        return;
      }
      const any = arr.find((e) => !e.src.includes("chome-extension"));
      if (!!any) this.replaceAvatar();
      setTimeout(() => {
        window.isCheckingAvatar = false;
      }, 50);
    },
    twitterController() {
      document;
    },

    replaceAvatar() {
      let selector = "";
      chrome.storage.sync.get("paticikTheme").then((res) => {
        selector =
          res.paticikTheme == "pati-hello-kitty" ? "kitty.jpg" : "avatar.jpg";
        const newImg = chrome.runtime.getURL(selector);
        const arr = Array.from(
          document.querySelectorAll(
            "div.cAuthorPane_photoWrap > a.ipsUserPhoto > img"
          )
        );
        arr.forEach((e) => (e.src = newImg));
      });
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
    imgPreviewModal() {
      const comments = document.querySelector("#comments");
      comments.querySelectorAll("img").forEach((e) => {
        const attr = e.getAttribute("is-listening");
        if (attr) return;

        e.addEventListener("click", (event) => {
          e.setAttribute("is-listening", true);
          event.preventDefault();
          event.stopPropagation();
          e.style.scale = "2";
        });
      });
      if (document.querySelectorAll(".fa").length > 0)
        document.querySelectorAll(".fa").forEach((e) => {
          e.classList.remove("fa");
          e.classList.add("fa-solid");
        });
    },
  };

  const _forum = {
    init() {
      this.observeHydration();
    },
    observeHydration() {
      const target = document.querySelector("div.ipsPageHeader > header");
      const config = { attributes: true, childList: true, subtree: true };
      const cb = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (document.querySelectorAll(".fa").length > 0)
            document.querySelectorAll(".fa").forEach((e) => {
              e.classList.remove("fa");
              e.classList.add("fa-solid");
            });
        }
      };

      const observer = new MutationObserver(cb);
      observer.observe(target, config);
    },
  };

  if (home_page) _home.init();
  if (topic_page) _topic.init();
  if (forum_page) _forum.init();
}

/* Utils */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
