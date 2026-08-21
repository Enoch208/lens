import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Workspace } from "./types.ts";
import { seedWorkspace } from "./seed.ts";

/**
 * A serverless filesystem is read-only outside `/tmp`, so on Vercel the store moves there.
 * State then lives per instance and re-seeds on a cold start, which costs nothing here:
 * `/demo/reset` is the intended entry point and it rewrites the file anyway.
 */
const DB_PATH = process.env.VERCEL
  ? join("/tmp", "seatline.json")
  : join(process.cwd(), "data", "seatline.json");

/**
 * A JSON file is the whole database. Seatline is a five-member demo workspace that has to be
 * reset to byte-identical state before every browser run, so a file that can be rewritten in
 * one call beats a real engine here.
 */
function persist(workspace: Workspace): Workspace {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  writeFileSync(DB_PATH, `${JSON.stringify(workspace, null, 2)}\n`, "utf8");
  return workspace;
}

export function readWorkspace(): Workspace {
  if (!existsSync(DB_PATH)) return persist(seedWorkspace());
  try {
    return JSON.parse(readFileSync(DB_PATH, "utf8")) as Workspace;
  } catch {
    // A corrupt store must never take the app down mid-demo.
    return persist(seedWorkspace());
  }
}

export function writeWorkspace(workspace: Workspace): Workspace {
  return persist(workspace);
}

/** Purge and reseed. Backs the `/demo/reset` route and `npm run reset-demo`. */
export function resetWorkspace(): Workspace {
  return persist(seedWorkspace());
}
