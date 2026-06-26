import fs from "fs";
import path from "path";

// When launched via `cd dashboard && npm run dev`, process.cwd() is the
// dashboard directory — NOT the repo root. Rather than hard-code "../", walk up
// from cwd until we find the repo's source-of-truth file. This keeps the
// dashboard working no matter where the dev server is started from.
let cachedRoot: string | null = null;

export function findRepoRoot(): string {
  if (cachedRoot) return cachedRoot;

  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "ai", "memory", "state.json"))) {
      cachedRoot = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // hit filesystem root
    dir = parent;
  }

  // Fall back to one level up from cwd (the documented layout) so callers still
  // get a sensible path to report in error messages.
  cachedRoot = path.resolve(process.cwd(), "..");
  return cachedRoot;
}

export const REPO_PATHS = {
  state: () => path.join(findRepoRoot(), "ai", "memory", "state.json"),
  progress: () => path.join(findRepoRoot(), "ai", "memory", "progress-log.md"),
  concepts: () =>
    path.join(findRepoRoot(), "ai", "memory", "learned-concepts.md"),
  curriculum: () => path.join(findRepoRoot(), "ai", "curriculum", "INDEX.md"),
  taskBrief: (id: string) =>
    path.join(findRepoRoot(), "ai", "memory", "tasks", `${id}.md`),
};
