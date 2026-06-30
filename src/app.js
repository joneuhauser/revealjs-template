const slides = document.querySelector(".slides");
const slideTemplate = document.querySelector("#slides-template");

slides.append(slideTemplate.content.cloneNode(true));

if (new URLSearchParams(window.location.search).has("grid")) {
  document.documentElement.classList.add("show-kit-grid");
}

if (new URLSearchParams(window.location.search).has("presenter")) {
  document.documentElement.classList.add("kit-presenter-view");
}

document.querySelectorAll("[data-title-logo]").forEach((section) => {
  section.insertAdjacentHTML(
    "afterbegin",
    `<span class="kit-logo" data-kit-logo="${section.dataset.titleLogo}"></span>`
  );
});

document.querySelectorAll("[data-title-graphic]").forEach((section) => {
  section.insertAdjacentHTML(
    "afterbegin",
    '<img class="title-graphic" src="template/assets/beamericononline.svg" alt="">'
  );
});

document.querySelectorAll("[data-institute-logo]").forEach((section) => {
  section.insertAdjacentHTML(
    "afterbegin",
    '<img class="institute-logo" src="template/assets/beamericonarticle.svg" alt="Institute logo">'
  );
});

document.querySelectorAll("[data-final-logo]").forEach((section) => {
  section.insertAdjacentHTML(
    "afterbegin",
    '<span class="kit-logo" data-kit-logo="default"></span>'
  );
});

document.querySelectorAll("[data-kit-logo]").forEach((el) => {
  el.innerHTML = KIT.logo(el.dataset.kitLogo);
});

document.querySelectorAll("[data-kit-icon]").forEach((el) => {
  el.innerHTML = KIT.icon(el.dataset.kitIcon, {
    fg: el.dataset.fg,
    bg: el.dataset.bg,
  });
});

document.querySelectorAll("[data-kit-panel-chevron]").forEach((el) => {
  el.innerHTML = KIT.panelChevron();
});

document.querySelectorAll(".slides > section").forEach((section, index) => {
  if (!section.id) section.id = `slide-${index + 1}`;
});

const tocList = document.querySelector("[data-toc-list]");
if (tocList) {
  const tocSections = [];
  let currentSection = null;

  Array.from(document.querySelectorAll(".slides > section"))
    .filter((section) => !section.matches(".kit-toc, .no-footer"))
    .forEach((slide) => {
      if (slide.dataset.section) {
        currentSection = {
          slide,
          title: slide.dataset.section,
          subsections: [],
        };
        tocSections.push(currentSection);
      }

      if (slide.dataset.subsection && currentSection) {
        currentSection.subsections.push({
          slide,
          title: slide.dataset.subsection,
        });
      }
    });

  tocList.innerHTML = tocSections.map(({ slide, title, subsections }) => `
    <li>
      <a href="#/${slide.id}">${title}</a>
      ${subsections.length ? `<ol>${subsections.map((subsection) => `
        <li><a href="#/${subsection.slide.id}">${subsection.title}</a></li>
      `).join("")}</ol>` : ""}
    </li>
  `).join("");
}

document.querySelectorAll("code.language-cpp").forEach((code) => {
  const escape = (value) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  code.innerHTML = escape(code.textContent)
    .replace(/"([^"]*)"/g, '<span class="str">"$1"</span>')
    .replace(/\b(100|2|0|1)\b/g, '<span class="num">$1</span>')
    .replace(/\b(int|void|bool)\b/g, '<span class="type">$1</span>')
    .replace(/\b(for|if|return)\b/g, '<span class="kw">$1</span>');
});

document.querySelectorAll(".kit-frame").forEach((section) => {
  const children = Array.from(section.children);
  const headingNodes = children.filter((child) => child.matches("h2, h3"));
  const contentNodes = children.filter((child) => !child.matches("h2, h3"));

  const shell = document.createElement("div");
  shell.className = "kit-shell";

  const heading = document.createElement("div");
  heading.className = "kit-heading";
  headingNodes.forEach((node) => heading.appendChild(node));

  const content = document.createElement("div");
  content.className = "kit-content";
  contentNodes.forEach((node) => content.appendChild(node));

  shell.append(heading, content);
  section.append(shell);
});

function kitGridOverlay() {
  const slideWidth = 1920;
  const slideHeight = 1080;
  const pptGuideToPx = (pos) => pos / 4;
  const emuToPx = (emu) => emu / 6350;

  const horizontalGuides = [
    232, 867, 1003, 1638, 1774, 2409, 2546, 3181, 3317, 3952,
  ].map(pptGuideToPx);
  const verticalGuides = [
    234, 1323, 1459, 1935, 2071, 2547, 2683, 3772, 3908, 4997,
    5133, 5609, 5745, 6221, 6357, 7446,
  ].map(pptGuideToPx);
  const boxes = [
    { x: 371475, y: 368907, w: 11449050, h: 1007455 },
    { x: 371475, y: 1592262, w: 11449050, h: 4681538 },
  ].map((box) => ({
    x: emuToPx(box.x),
    y: emuToPx(box.y),
    w: emuToPx(box.w),
    h: emuToPx(box.h),
  }));

  return `
    <svg class="kit-grid-overlay" viewBox="0 0 ${slideWidth} ${slideHeight}" aria-hidden="true" focusable="false">
      ${horizontalGuides.map((y) => `<line class="guide" x1="0" y1="${y}" x2="${slideWidth}" y2="${y}"/>`).join("")}
      ${verticalGuides.map((x) => `<line class="guide" x1="${x}" y1="0" x2="${x}" y2="${slideHeight}"/>`).join("")}
      ${boxes.map((box) => `<rect class="box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}"/>`).join("")}
    </svg>`;
}

if (document.documentElement.classList.contains("show-kit-grid")) {
  document.querySelectorAll(".slides > section").forEach((section) => {
    section.insertAdjacentHTML("beforeend", kitGridOverlay());
  });
}

document.querySelectorAll(".slides > section").forEach((section, index) => {
  if (section.classList.contains("no-footer")) return;
  const footer = document.createElement("div");
  footer.className = `kit-footer${section.hasAttribute("data-white-logo") ? " white" : ""}`;
  footer.innerHTML = `
    <span>${index + 1}</span>
    <span>17/03/25</span>
    <span class="title">F. N. Name – Short title</span>
    <span class="kit-logo">${KIT.logo(section.hasAttribute("data-white-logo") ? "white" : "default")}</span>
  `;
  section.appendChild(footer);
});

function openPresenterView() {
  const url = new URL(window.location.href);
  url.searchParams.set("presenter", "1");
  window.open(url.href, "kit-presenter", "width=1280,height=800");
}

const runtimeBase = "vendor/reveal-runtime";

async function assetExists(path) {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function loadOptionalScript(path) {
  if (!(await assetExists(path))) return false;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = path;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.append(script);
  });
}

async function loadOptionalStylesheet(path) {
  if (!(await assetExists(path))) return false;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = path;
  document.head.append(link);
  return true;
}

async function loadRevealPlugins() {
  await Promise.all([
    loadOptionalStylesheet(`${runtimeBase}/plugin/chalkboard/chalkboard.css`),
    loadOptionalScript(`${runtimeBase}/plugin/math/math.js`),
    loadOptionalScript(`${runtimeBase}/plugin/notes/notes.js`),
    loadOptionalScript(`${runtimeBase}/plugin/chalkboard/chalkboard.js`),
  ]);
}

function revealPlugins() {
  return [
    window.RevealMath?.MathJax3,
    window.RevealNotes,
    window.RevealChalkboard,
  ].filter(Boolean);
}

function setupChalkboardSync() {
  const source =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const channelName = "kit-chalkboard-sync";
  const storageKey = `${channelName}-message`;
  const channel =
    "BroadcastChannel" in window ? new BroadcastChannel(channelName) : null;
  let lastStorageMessage = "";

  const replay = (content) => {
    if (content?.sender !== "chalkboard-plugin") return;
    const event = new CustomEvent("received");
    event.content = content;
    document.dispatchEvent(event);
  };

  const readStorageMessage = () => {
    const value = localStorage.getItem(storageKey);
    if (!value || value === lastStorageMessage) return;
    lastStorageMessage = value;
    try {
      const message = JSON.parse(value);
      if (message.source !== source) replay(message.content);
    } catch {
      // Ignore stale or malformed sync messages.
    }
  };

  const publish = (content) => {
    if (content?.sender !== "chalkboard-plugin") return;
    const message = { source, time: Date.now(), content };
    const serialized = JSON.stringify(message);
    lastStorageMessage = serialized;
    localStorage.setItem(storageKey, serialized);
    return message;
  };

  document.addEventListener("broadcast", (event) => {
    const message = publish(event.content);
    if (message && channel) {
      channel.postMessage(message);
    }
  });

  if (channel) {
    channel.addEventListener("message", (event) => {
      if (event.data?.source === source) return;
      replay(event.data?.content);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) readStorageMessage();
  });
  window.setInterval(readStorageMessage, 100);
}

function setupChalkboardControls() {
  const controls = document.createElement("div");
  controls.className = "chalkboard-controls";
  controls.setAttribute("aria-label", "Chalkboard controls");
  controls.innerHTML = `
    <button type="button" data-chalkboard-action="notes" title="Annotate slide (C)" aria-label="Annotate slide">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17.5 16.8 4.7a2.1 2.1 0 0 1 3 3L7 20.5H4v-3Z"/><path d="m14.8 6.7 2.5 2.5"/></svg>
    </button>
    <button type="button" data-chalkboard-action="board" title="Open whiteboard (B)" aria-label="Open whiteboard">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h16v11H4z"/><path d="M9 20h6M12 16.5V20"/></svg>
    </button>
    <button type="button" data-chalkboard-action="clear" title="Clear annotations (Del)" aria-label="Clear annotations">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12"/><path d="M9 7V4.8h6V7"/><path d="M8 10v8h8v-8"/><path d="M11 11.5v5M14 11.5v5"/></svg>
    </button>
  `;
  document.querySelector(".reveal").appendChild(controls);

  if (!window.RevealChalkboard) {
    controls.setAttribute("hidden", "");
    return;
  }

  controls.classList.add("is-enabled");

  const syncControls = () => {
    const currentSlide = Reveal.getCurrentSlide();
    controls.hidden = currentSlide?.classList.contains("no-footer") ?? false;
    controls.querySelector('[data-chalkboard-action="notes"]').classList.toggle(
      "is-active",
      document.querySelector("#notescanvas")?.style.pointerEvents === "auto"
    );
    controls.querySelector('[data-chalkboard-action="board"]').classList.toggle(
      "is-active",
      document.querySelector("#chalkboard")?.style.visibility === "visible" &&
        document.querySelector("#chalkboard")?.style.opacity !== "0"
    );
  };

  const syncControlsSoon = () => {
    [0, 50, 150].forEach((delay) => window.setTimeout(syncControls, delay));
  };

  controls.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (button.dataset.chalkboardAction === "clear") {
        window.RevealChalkboard.clear();
      } else if (button.dataset.chalkboardAction === "notes") {
        window.RevealChalkboard.toggleNotesCanvas();
      } else {
        window.RevealChalkboard.toggleChalkboard();
      }

      syncControlsSoon();
    });
  });

  Reveal.on("ready", syncControls);
  Reveal.on("slidechanged", syncControls);
  window.addEventListener("keyup", (event) => {
    if (["b", "B", "c", "C"].includes(event.key)) syncControlsSoon();
  });
  syncControls();
}

function enablePresenterFallback(deck) {
  Reveal.addKeyBinding({ keyCode: 83, key: "S", description: "Open presenter view" }, openPresenterView);

  Reveal.on("slidechanged", () => {
    if (document.documentElement.classList.contains("kit-presenter-view")) return;
    localStorage.setItem("kit-presenter-state", JSON.stringify(Reveal.getState()));
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== "kit-presenter-state") return;
    if (!document.documentElement.classList.contains("kit-presenter-view")) return;
    try {
      Reveal.setState(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed state from stale presenter windows.
    }
  });

  if (document.documentElement.classList.contains("kit-presenter-view")) {
    Promise.resolve(deck).then(() => {
      const state = localStorage.getItem("kit-presenter-state");
      try {
        if (state) Reveal.setState(JSON.parse(state));
      } catch {
        // Ignore stale presenter state from older deck revisions.
      }
    });
  }
}

async function initializeDeck() {
  await loadRevealPlugins();
  setupChalkboardSync();

  const deck = Reveal.initialize({
    hash: true,
    history: true,
    hashOneBasedIndex: true,
    width: 1920,
    height: 1080,
    margin: 0,
    controls: false,
    progress: false,
    center: false,
    transition: "none",
    chalkboard: {
      theme: "whiteboard",
      transition: 1,
      background: [
        "rgba(0,150,130,0.035)",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f2f2f2'/%3E%3C/svg%3E",
      ],
      grid: {
        color: "rgba(168,185,196,0.28)",
        distance: 48,
        width: 1,
      },
      boardmarkers: [
        { color: "#6d7173", cursor: "auto" },
        { color: "#009682", cursor: "auto" },
        { color: "#d30015", cursor: "auto" },
        { color: "#23a1e0", cursor: "auto" },
        { color: "#8cb63c", cursor: "auto" },
        { color: "#df9b1b", cursor: "auto" },
        { color: "#a3107c", cursor: "auto" },
        { color: "#000000", cursor: "auto" },
      ],
      chalks: [
        { color: "#6d7173", cursor: "auto" },
        { color: "#009682", cursor: "auto" },
        { color: "#d30015", cursor: "auto" },
        { color: "#23a1e0", cursor: "auto" },
        { color: "#8cb63c", cursor: "auto" },
        { color: "#df9b1b", cursor: "auto" },
        { color: "#a3107c", cursor: "auto" },
        { color: "#000000", cursor: "auto" },
      ],
    },
    plugins: revealPlugins(),
  });

  setupChalkboardControls();
  if (!window.RevealNotes) enablePresenterFallback(deck);
}

initializeDeck();
