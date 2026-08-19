# Ajeet Ojha Portfolio

Production-ready static portfolio for a graphic designer and video editor. The site uses Tailwind CSS, vanilla JavaScript modules, centralized project data, and placeholder-safe media rendering.

## Run Locally

Install dependencies once:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Add A New Image Project

1. Add the image to `assets/images/`.
2. Open `data/projects.js`.
3. Add a new object to the `projects` array:

```js
{
  id: "project-09",
  title: "Poster Series",
  category: "graphic-design",
  label: "Graphic Design",
  type: "image",
  year: "2026",
  client: "",
  description: "",
  thumbnail: "./assets/images/poster-series.webp",
  video: "",
  tools: ["Photoshop", "Illustrator"],
  featured: true,
  url: "",
  placeholder: "PLACEHOLDER_PROJECT_09_IMAGE",
  layoutClass: "col-span-2 md:col-span-3",
  titleClass: "text-xl"
}
```

## Add A New Video Project

1. Add the video to `assets/videos/`.
2. Add a poster image to `assets/images/`.
3. Add a new object to `projects` or `videoProjects` in `data/projects.js`:

```js
{
  id: "project-10",
  title: "Campaign Edit",
  category: "video-editing",
  label: "Video Editing",
  type: "video",
  year: "2026",
  client: "",
  description: "",
  thumbnail: "./assets/images/campaign-edit-poster.webp",
  video: "./assets/videos/campaign-edit.mp4",
  tools: ["Premiere Pro", "DaVinci Resolve"],
  featured: true,
  url: "",
  placeholder: "PLACEHOLDER_VIDEO_10",
  layoutClass: "col-span-2 md:col-span-3",
  titleClass: "text-xl"
}
```

Videos use `preload="metadata"` and are paused automatically when they leave the viewport.

## Replace The Showreel

Open `data/projects.js` and update the `showreel` object:

```js
export const showreel = {
  id: "showreel-2026",
  title: "Showreel 2026",
  type: "video",
  poster: "./assets/images/showreel-poster.webp",
  video: "./assets/videos/showreel.mp4",
  embedUrl: "",
  placeholder: "PLACEHOLDER_SHOWREEL_EMBED_URL"
};
```

Use either `video` for a local MP4 or `embedUrl` for a YouTube/Vimeo embed.

## Replace The Profile Image

The intro and about portrait placeholders are in `index.html`:

- `PLACEHOLDER_INTRO_PHOTO`
- `PLACEHOLDER_ABOUT_PORTRAIT`

Replace those placeholder frames with an optimized image from `assets/images/` when the final portraits are ready.

## Update Social Links And Email

Open `data/projects.js` and edit `socialLinks`:

```js
export const socialLinks = {
  instagram: "https://instagram.com/your-profile",
  linkedin: "https://linkedin.com/in/your-profile",
  email: "you@example.com"
};
```

Leave any value blank to keep it as a safe placeholder.

## Contact Form

The form validates name, email, project type, and message on the frontend. It does not send email yet.

Connect a real service in `js/main.js` at this marker:

```js
// TODO: Connect Formspree / EmailJS / custom API.
```

Do not place secret API keys in frontend JavaScript.

## Change Colors

Brand colors live in two places:

- `tailwind.config.js`
- `src/styles.css`

Update `obsidian`, `matte`, `silver`, or `acid`, then run:

```bash
npm run build:css
```

## Favicon

The placeholder favicon is `assets/icons/favicon.svg`. Replace it with your final logo or export additional PNG/ICO versions when your branding is final.

## Deploy

Run:

```bash
npm run build
```

Deploy the generated `dist/` folder to Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static hosting provider. Before deployment, update the canonical URL and Open Graph URLs in `index.html`.
