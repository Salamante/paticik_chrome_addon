const onContentLoad = {
  init() {
    this._icon();
    this._date();
  },
  _icon() {
    document.querySelectorAll(".fa").forEach((e) => {
      e.classList.remove("fa");
      e.classList.add("fa-solid");
    });
  },
  _date() {
    const path = window.location.pathname;
    if (!path.includes("/topic")) return;

    document.querySelectorAll("time").forEach((e) => {
      if (!!e.title && e.title.split(" ").length > 0)
        e.title = e.title.split(" ")[1];
    });
  },
};

onContentLoad.init();
