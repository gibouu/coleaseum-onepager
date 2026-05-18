import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const read = (path) => readFileSync(join(root, path), "utf8");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const index = read("index.html");
const gitignore = read(".gitignore");
const guidanceFiles = ["CLAUDE.md", "AGENTS.md"].filter((path) => existsSync(join(root, path)));
const guidance = guidanceFiles.map(read).join("\n");

check(!existsSync(join(root, "assets/scripts/main.js")), "unused carousel script should be removed");
check(!existsSync(join(root, "clarity/clarity.js")), "unused clarity JavaScript should be removed");
check(!/assets\/scripts\/main\.js|slide-menu|\.slider|prev_btn|next_btn/i.test(guidance), "guidance should not document removed carousel DOM contracts");
check(gitignore.includes(".clawpatch/"), ".gitignore should ignore Clawpatch state");
check(gitignore.includes(".Codex/"), ".gitignore should ignore Codex session state");
check(read("CNAME").trim() === "www.coleaseum.com", "CNAME should configure the GitHub Pages custom domain");
check(!/https?:\/\/[^"']+\.(?:js|css)|<script[^>]+src=["']https?:\/\//.test(index), "page should not load third-party executable/style assets from CDNs");
check(!/clarity\/clarity\.js/.test(index), "page should not load unused clarity JavaScript");
check(/<meta name="twitter:card" content="summary_large_image">/.test(index), "twitter:card should use a valid image-card type");
check(/<meta name="twitter:image" content="https:\/\/www\.coleaseum\.com\/assets\/figures\/slogo\.png">/.test(index), "twitter:image should be absolute");
check(/<meta content="https:\/\/www\.coleaseum\.com\/assets\/figures\/slogo\.png" property="og:image">/.test(index), "og:image should match the social preview image");

const imageRefs = [...index.matchAll(/<(?:img|meta|link)\b[^>]*(?:src|content|href)=["']([^"']+\.(?:png|webp|jpe?g))["']/gi)]
  .map((match) => match[1])
  .filter((src) => !src.startsWith("http"));

const imageTags = [...index.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
for (const tag of imageTags.slice(2)) {
  check(/\sloading="lazy"/.test(tag), `non-hero image should be lazy-loaded: ${tag}`);
  check(/\sdecoding="async"/.test(tag), `non-hero image should decode async: ${tag}`);
}

const signatures = {
  ".png": (bytes) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  ".webp": (bytes) => bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP",
  ".jpg": (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  ".jpeg": (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
};

for (const src of imageRefs) {
  const path = src.split(/[?#]/)[0];
  const ext = extname(path).toLowerCase();
  const file = join(root, path);
  check(existsSync(file), `referenced image is missing: ${path}`);
  if (existsSync(file) && signatures[ext]) {
    check(signatures[ext](readFileSync(file)), `image payload does not match extension: ${path}`);
  }
}

check(/sass assets\/stylesheets\/main\.scss assets\/stylesheets\/main_free\.css/.test(guidance), "guidance should document the main_free.css Sass command");
check(!/when in doubt, edit `main_free\.scss`/i.test(guidance), "guidance should not point edits at the wrapper SCSS file");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Static site verification passed (${imageRefs.length} image references checked).`);
