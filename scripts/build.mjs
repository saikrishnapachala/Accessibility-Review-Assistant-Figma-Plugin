import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(projectRoot, "dist");

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

await build({
  bundle: true,
  entryPoints: [resolve(projectRoot, "src/plugin/main.ts")],
  format: "iife",
  outfile: resolve(outputDirectory, "code.js"),
  platform: "browser",
  target: "es2022",
});

const uiBuild = await build({
  bundle: true,
  entryPoints: [resolve(projectRoot, "src/ui/main.ts")],
  format: "iife",
  platform: "browser",
  target: "es2022",
  write: false,
});

const uiJavaScript = uiBuild.outputFiles[0]?.text;
if (uiJavaScript === undefined) {
  throw new Error("The UI bundle did not produce JavaScript output.");
}

const uiTemplate = await readFile(
  resolve(projectRoot, "src/ui/index.html"),
  "utf8",
);
const uiHtml = uiTemplate.replace(
  "<!-- UI_SCRIPT -->",
  `<script>${uiJavaScript.replaceAll("</script", "<\\/script")}</script>`,
);

await writeFile(resolve(outputDirectory, "ui.html"), uiHtml, "utf8");
