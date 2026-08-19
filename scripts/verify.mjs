const baseUrl = process.env.VERIFY_URL || "http://127.0.0.1:5173/";
const viewportWidths = [320, 375, 390, 414, 768, 1024, 1280, 1440, 1920];

const version = await fetch("http://127.0.0.1:9222/json/version").then((response) => response.json());
const socket = new WebSocket(version.webSocketDebuggerUrl);
let nextId = 1;
const callbacks = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && callbacks.has(message.id)) {
    const { resolve, reject } = callbacks.get(message.id);
    callbacks.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
});

await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));

function send(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => callbacks.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }

  return result.result.value;
}

await send("Target.setDiscoverTargets", { discover: true });
const target = await send("Target.createTarget", { url: "about:blank" });
const session = await send("Target.attachToTarget", { targetId: target.targetId, flatten: true });
const sessionId = session.sessionId;

function pageSend(method, params = {}) {
  const id = nextId++;
  socket.send(JSON.stringify({ id, sessionId, method, params }));
  return new Promise((resolve, reject) => callbacks.set(id, { resolve, reject }));
}

const consoleMessages = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.sessionId !== sessionId || message.method !== "Runtime.consoleAPICalled") return;
  consoleMessages.push(message.params.type);
});

await pageSend("Runtime.enable");
await pageSend("Page.enable");

const results = [];

for (const width of viewportWidths) {
  await pageSend("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768
  });
  await pageSend("Page.navigate", { url: baseUrl });
  await new Promise((resolve) => {
    const listener = (event) => {
      const message = JSON.parse(event.data);
      if (message.sessionId === sessionId && message.method === "Page.loadEventFired") {
        socket.removeEventListener("message", listener);
        resolve();
      }
    };
    socket.addEventListener("message", listener);
  });

  await new Promise((resolve) => setTimeout(resolve, 800));
  const data = await pageSend("Runtime.evaluate", {
    expression: `(async () => {
      const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
      const brokenAnchors = anchors.map((link) => link.getAttribute('href')).filter((href) => href !== '#' && !document.querySelector(href));
      const ids = Array.from(document.querySelectorAll('[id]')).map((node) => node.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const filter = document.querySelector('[data-filter="video-editing"]');
      if (filter) filter.click();
      await new Promise((resolve) => setTimeout(resolve, 400));
      const visibleVideoCards = Array.from(document.querySelectorAll('.project-card')).filter((card) => !card.hidden).length;
      const menuToggle = document.getElementById('menuToggle');
      if (menuToggle) menuToggle.click();
      const menuExpanded = menuToggle ? menuToggle.getAttribute('aria-expanded') : null;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      const menuClosed = menuToggle ? menuToggle.getAttribute('aria-expanded') === 'false' : true;
      const form = document.getElementById('contactForm');
      if (form) form.requestSubmit();
      const hasFormError = Boolean(document.querySelector('.form-error:not(.hidden)'));
      return {
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        brokenAnchors,
        duplicateIds,
        projectCards: document.querySelectorAll('.project-card').length,
        videoCards: document.querySelectorAll('[data-video-id]').length,
        masonryItems: document.querySelectorAll('#masonryGrid > div').length,
        visibleVideoCards,
        menuExpanded,
        menuClosed,
        hasFormError
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  results.push(data.result.value);
}

const failures = [];
for (const result of results) {
  if (result.scrollWidth > result.width + 1) failures.push(`Horizontal overflow at ${result.width}px (${result.scrollWidth}px)`);
  if (result.brokenAnchors.length) failures.push(`Broken anchors at ${result.width}px: ${result.brokenAnchors.join(", ")}`);
  if (result.duplicateIds.length) failures.push(`Duplicate IDs at ${result.width}px: ${result.duplicateIds.join(", ")}`);
  if (result.projectCards !== 8) failures.push(`Expected 8 project cards at ${result.width}px, found ${result.projectCards}`);
  if (result.videoCards !== 3) failures.push(`Expected 3 video cards at ${result.width}px, found ${result.videoCards}`);
  if (result.masonryItems !== 6) failures.push(`Expected 6 masonry items at ${result.width}px, found ${result.masonryItems}`);
  if (result.visibleVideoCards !== 2) failures.push(`Video filter expected 2 visible cards at ${result.width}px, found ${result.visibleVideoCards}`);
  if (result.menuExpanded !== "true") failures.push(`Mobile menu did not open at ${result.width}px`);
  if (!result.menuClosed) failures.push(`ESC did not close menu at ${result.width}px`);
  if (!result.hasFormError) failures.push(`Empty contact form did not show validation at ${result.width}px`);
}

if (consoleMessages.some((type) => type === "error")) {
  failures.push("Browser console errors were emitted");
}

console.log(JSON.stringify({ baseUrl, consoleMessages, results, failures }, null, 2));
socket.close();

if (failures.length) process.exit(1);
