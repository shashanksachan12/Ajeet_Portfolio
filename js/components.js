const PLACEHOLDER_TEXT_CLASS = "font-mono text-[11px] uppercase tracking-[0.15em] text-silver";

function appendClasses(element, className) {
  element.className = className;
  return element;
}

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function createIcon(name, className) {
  const icon = document.createElement("i");
  icon.dataset.lucide = name;
  icon.className = className;
  icon.setAttribute("aria-hidden", "true");
  return icon;
}

function renderFallback(frame, label) {
  frame.classList.add("placeholder-frame");
  frame.dataset.placeholder = label;
  if (frame.querySelector(".media-fallback-label")) return;

  const fallbackLabel = document.createElement("span");
  fallbackLabel.className = "media-fallback-label";
  fallbackLabel.textContent = label;
  frame.append(fallbackLabel);
}

function renderImage(frame, source, alt, placeholder) {
  if (!hasValue(source)) {
    renderFallback(frame, placeholder);
    return;
  }

  const image = document.createElement("img");
  image.src = source;
  image.alt = alt;
  image.loading = "lazy";
  image.decoding = "async";
  image.className = "absolute inset-0 h-full w-full object-cover";
  image.addEventListener("error", () => {
    image.remove();
    renderFallback(frame, placeholder);
  }, { once: true });
  frame.append(image);
}

function renderVideo(frame, item, placeholder) {
  if (!hasValue(item.video)) {
    renderImage(frame, item.thumbnail, `${item.title} thumbnail`, placeholder);
    return;
  }

  const video = document.createElement("video");
  video.src = item.video;
  video.poster = item.thumbnail || item.poster || "";
  video.preload = "metadata";
  video.playsInline = true;
  video.muted = true;
  video.loop = true;
  video.controls = true;
  video.className = "absolute inset-0 h-full w-full object-cover";
  video.addEventListener("error", () => {
    video.remove();
    renderImage(frame, item.thumbnail, `${item.title} thumbnail`, placeholder);
  }, { once: true });
  frame.append(video);
}

function addPlayOverlay(frame) {
  const overlay = appendClasses(document.createElement("div"), "absolute inset-0 flex items-center justify-center");
  const buttonShape = appendClasses(document.createElement("div"), "w-14 h-14 rounded-full bg-acid/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300");
  buttonShape.append(createIcon("play", "w-5 h-5 text-obsidian fill-obsidian ml-0.5"));
  overlay.append(buttonShape);
  frame.append(overlay);
}

export function renderShowreel(showreel) {
  const frame = document.getElementById("showreelFrame");
  if (!frame) return;

  if (hasValue(showreel.embedUrl)) {
    const iframe = document.createElement("iframe");
    iframe.src = showreel.embedUrl;
    iframe.title = showreel.title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.className = "absolute inset-0 h-full w-full";
    frame.append(iframe);
    return;
  }

  renderVideo(frame, showreel, showreel.placeholder || showreel.id);
  const gradient = appendClasses(document.createElement("div"), "absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/10 to-transparent");
  const content = appendClasses(document.createElement("div"), "absolute inset-0 flex flex-col items-center justify-center gap-4");
  const play = appendClasses(document.createElement("div"), "w-20 h-20 md:w-24 md:h-24 rounded-full bg-acid/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-300");
  const label = appendClasses(document.createElement("span"), "font-mono text-[11px] uppercase tracking-[0.2em] text-silver");
  play.append(createIcon("play", "w-8 h-8 text-obsidian fill-obsidian ml-1"));
  label.textContent = showreel.title;
  content.append(play, label);
  frame.append(gradient, content);
}

export function renderProjectGrid(projects) {
  const grid = document.getElementById("projectGrid");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  projects.forEach((project) => {
    const article = appendClasses(
      document.createElement("article"),
      `project-card cursor-hover ${project.layoutClass} group relative rounded-xl overflow-hidden card-hairline transition-all duration-300`
    );
    article.dataset.category = project.category;
    article.dataset.projectId = project.id;
    article.tabIndex = 0;
    article.setAttribute("aria-label", `${project.title} - ${project.label}`);

    const media = appendClasses(document.createElement("div"), "absolute inset-0");
    if (project.type === "video") {
      renderVideo(media, project, project.placeholder);
    } else {
      renderImage(media, project.thumbnail, `${project.title} project preview`, project.placeholder);
    }

    const gradient = appendClasses(document.createElement("div"), "absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/10 to-transparent");
    const label = appendClasses(document.createElement("div"), "absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.15em] text-silver bg-obsidian/60 border border-white/10 rounded-full px-3 py-1");
    label.textContent = project.label;

    const footer = appendClasses(document.createElement("div"), "absolute bottom-0 left-0 right-0 p-5");
    const title = appendClasses(document.createElement("h3"), `font-display ${project.titleClass} text-white`);
    title.textContent = project.title;
    footer.append(title);

    article.append(media, gradient, label, footer);
    fragment.append(article);
  });

  grid.replaceChildren(fragment);
}

export function renderVideoShowcase(videoProjects) {
  const grid = document.getElementById("videoShowcase");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  videoProjects.forEach((videoProject) => {
    const wrapper = appendClasses(document.createElement("div"), "reveal cursor-hover group");
    wrapper.dataset.videoId = videoProject.id;

    const frame = appendClasses(document.createElement("div"), "relative aspect-video rounded-xl overflow-hidden card-hairline placeholder-frame");
    frame.dataset.placeholder = videoProject.placeholder;

    if (hasValue(videoProject.embedUrl)) {
      const iframe = document.createElement("iframe");
      iframe.src = videoProject.embedUrl;
      iframe.title = videoProject.title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.className = "absolute inset-0 h-full w-full";
      frame.append(iframe);
    } else {
      renderVideo(frame, videoProject, videoProject.placeholder);
      addPlayOverlay(frame);
    }

    const meta = appendClasses(document.createElement("div"), "mt-4 flex items-start justify-between gap-4");
    const copy = document.createElement("div");
    const title = appendClasses(document.createElement("h3"), "font-display text-lg text-white");
    title.textContent = videoProject.title;
    const tools = appendClasses(document.createElement("p"), "font-mono text-[11px] uppercase tracking-[0.1em] text-silver mt-1");
    tools.textContent = videoProject.tools.join(" / ");
    copy.append(title, tools);

    const link = appendClasses(document.createElement("a"), "cursor-hover flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-acid inline-flex items-center gap-1 hover:opacity-70 transition-opacity");
    link.href = videoProject.url || "#work";
    link.textContent = "View";
    link.append(createIcon("arrow-right", "w-3.5 h-3.5"));
    meta.append(copy, link);
    wrapper.append(frame, meta);
    fragment.append(wrapper);
  });

  grid.replaceChildren(fragment);
}

export function renderMasonry(items) {
  const grid = document.getElementById("masonryGrid");
  if (!grid) return;

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const frame = appendClasses(
      document.createElement("div"),
      `break-inside-avoid mb-4 ${item.aspectClass} rounded-xl placeholder-frame card-hairline relative flex items-end p-4 overflow-hidden`
    );
    frame.dataset.placeholder = item.placeholder;
    renderImage(frame, item.image, `${item.label} preview`, item.placeholder);

    const label = appendClasses(document.createElement("span"), PLACEHOLDER_TEXT_CLASS);
    label.textContent = item.label;
    frame.append(label);
    fragment.append(frame);
  });

  grid.replaceChildren(fragment);
}

export function renderSocialLinks(socialLinks) {
  document.querySelectorAll("[data-social-links]").forEach((container) => {
    const keys = container.dataset.socialLinks.split(",").map((key) => key.trim());
    const fragment = document.createDocumentFragment();

    keys.forEach((key) => {
      const link = document.createElement("a");
      link.href = socialLinks[key] || "#contact";
      link.className = "cursor-hover hover:text-acid transition-colors";
      link.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      if (socialLinks[key]) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      fragment.append(link);
    });

    container.replaceChildren(fragment);
  });

  const email = socialLinks.email || "";
  document.querySelectorAll("[data-profile-email]").forEach((node) => {
    node.textContent = email || "[INSERT EMAIL ADDRESS]";
  });
  document.querySelectorAll("[data-contact-email]").forEach((link) => {
    link.href = email ? `mailto:${email}` : "mailto:kanahiyaojha3@gmail.com";
    const label = link.querySelector("span");
    if (label) label.textContent = email || "[INSERT EMAIL ADDRESS]";
  });
}
