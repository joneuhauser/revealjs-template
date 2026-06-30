import { copyFile, cp, mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(root, "vendor");
const runtimeDir = join(vendorDir, "reveal-runtime");
const stagingRuntimeDir = join(vendorDir, ".setup-runtime");
const revealSrcDir = join(vendorDir, "reveal-src");
const pluginSrcDir = join(vendorDir, "reveal-plugins-src");

const revealVersion = process.env.REVEAL_VERSION ?? "6.0.1";
const chalkboardVersion = process.env.CHALKBOARD_VERSION ?? "4.6.0";
const revealRepo = "https://github.com/hakimel/reveal.js.git";
const pluginRepo = "https://github.com/rajgoel/reveal.js-plugins.git";

const mode = process.argv[2];

if (mode !== "npm") {
  console.error("Usage: node tools/setup-reveal.mjs npm");
  process.exit(1);
}

await rm(stagingRuntimeDir, { recursive: true, force: true });
await mkdir(stagingRuntimeDir, { recursive: true });

try {
  await setupNpm();

  await rm(runtimeDir, { recursive: true, force: true });
  await rename(stagingRuntimeDir, runtimeDir);
  console.log(`Reveal runtime staged in ${relative(runtimeDir)}`);
} catch (error) {
  await rm(stagingRuntimeDir, { recursive: true, force: true });
  throw error;
}

async function setupNpm() {
  await cloneAtRef(revealRepo, revealSrcDir, revealVersion);
  run("npm", ["install"], { cwd: revealSrcDir });
  await stageReveal(revealSrcDir);

  await cloneAtRef(pluginRepo, pluginSrcDir, chalkboardVersion);
  await stageChalkboard(pluginSrcDir);
}

async function stageReveal(sourceRoot) {
  await mkdir(join(stagingRuntimeDir, "dist"), { recursive: true });
  await copyFirst(
    [join(sourceRoot, "dist", "reveal.css")],
    join(stagingRuntimeDir, "dist", "reveal.css"),
    true
  );
  await copyFirst(
    [join(sourceRoot, "dist", "reveal.js")],
    join(stagingRuntimeDir, "dist", "reveal.js"),
    true
  );
  await copyFirst(
    [
      join(sourceRoot, "plugin", "math", "math.js"),
      join(sourceRoot, "dist", "plugin", "math.js"),
    ],
    join(stagingRuntimeDir, "plugin", "math", "math.js"),
    false
  );
  await copyFirst(
    [
      join(sourceRoot, "plugin", "notes", "notes.js"),
      join(sourceRoot, "dist", "plugin", "notes.js"),
    ],
    join(stagingRuntimeDir, "plugin", "notes", "notes.js"),
    false
  );
}

async function stageChalkboard(sourceRoot) {
  const source = join(sourceRoot, "chalkboard");
  if (!(await exists(source))) {
    console.warn(`Skipping chalkboard: ${relative(source)} does not exist`);
    return;
  }

  const target = join(stagingRuntimeDir, "plugin", "chalkboard");
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });

  const js = await findFirst(target, ["plugin.js", "chalkboard.js"]);
  const css = await findFirst(target, ["style.css", "chalkboard.css"]);

  if (js) await copyFile(js, join(target, "chalkboard.js"));
  if (css) await copyFile(css, join(target, "chalkboard.css"));

  if (!js) console.warn("Chalkboard JavaScript was not found in the plugin checkout.");
  if (!css) console.warn("Chalkboard CSS was not found in the plugin checkout.");
}

async function cloneAtRef(repo, target, ref) {
  await rm(target, { recursive: true, force: true });
  run("git", ["clone", "--depth", "1", "--branch", ref, repo, target]);
}

async function copyFirst(candidates, destination, required) {
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(candidate, destination);
      return true;
    }
  }
  if (required) throw new Error(`Missing required file: ${candidates.map(relative).join(", ")}`);
  return false;
}

async function findFirst(directory, names) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isFile() && names.includes(entry.name)) return path;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const found = await findFirst(join(directory, entry.name), names);
    if (found) return found;
  }
  return null;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function relative(path) {
  return path.replace(`${root}/`, "");
}
