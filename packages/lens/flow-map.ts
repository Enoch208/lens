import { execFileSync } from "node:child_process";

/**
 * Behavioral blast radius: which business flows could this diff possibly have moved?
 *
 * This is deterministic file-glob mapping, not inference. That is a feature — the mapping is
 * committed, reviewable, and identical on every machine, and a wrong answer here is a wrong
 * answer you can read in a JSON file rather than one hidden inside a model call.
 */

export type FlowMap = Record<string, string[]>;

export function globToRegExp(glob: string): RegExp {
  let pattern = "";
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === "*") {
      if (glob[index + 1] === "*") {
        // `**/` spans any number of directories, including none at all.
        if (glob[index + 2] === "/") {
          pattern += "(?:.*/)?";
          index += 2;
        } else {
          pattern += ".*";
          index += 1;
        }
      } else {
        pattern += "[^/]*";
      }
      continue;
    }
    pattern += char.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${pattern}$`);
}

export function matchesGlob(filePath: string, glob: string): boolean {
  return globToRegExp(glob).test(filePath);
}

export type BlastRadius = {
  flows: string[];
  /** Changed files no glob claimed. Surfaced loudly — an unmapped file is an untested file. */
  unmapped: string[];
};

export function mapFilesToFlows(files: string[], flowMap: FlowMap): BlastRadius {
  const flows = new Set<string>();
  const unmapped: string[] = [];

  for (const file of files) {
    let claimed = false;
    for (const [glob, mapped] of Object.entries(flowMap)) {
      if (!matchesGlob(file, glob)) continue;
      claimed = true;
      for (const flow of mapped) flows.add(flow);
    }
    if (!claimed) unmapped.push(file);
  }

  return { flows: [...flows].sort(), unmapped };
}

function git(args: string[], cwd: string): string {
  // stdio must silence git's own chatter: in Stop-hook mode stderr *is* the message the coding
  // agent reads, and a stray "detached HEAD" advisory lands in front of the block reason.
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/**
 * Everything this working tree changed relative to the last commit — unstaged, staged, and
 * untracked. LENS verifies work the agent has *not* committed yet, which is exactly the moment
 * the Stop hook fires.
 */
export function changedFiles(cwd: string = process.cwd()): string[] {
  const files = new Set<string>();
  const collect = (raw: string) => {
    for (const line of raw.split("\n")) {
      const file = line.trim();
      if (file) files.add(file);
    }
  };

  try {
    collect(git(["diff", "HEAD", "--name-only"], cwd));
    collect(git(["diff", "--cached", "--name-only"], cwd));
    collect(git(["ls-files", "--others", "--exclude-standard"], cwd));
  } catch {
    // No commits yet, or not a git repo. An empty diff is the honest answer.
  }

  return [...files].sort();
}

export function headCommit(cwd: string = process.cwd()): string {
  try {
    return git(["rev-parse", "--short", "HEAD"], cwd).trim();
  } catch {
    return "uncommitted";
  }
}

export function isWorkingTreeClean(cwd: string = process.cwd()): boolean {
  try {
    return git(["status", "--porcelain"], cwd).trim() === "";
  } catch {
    return false;
  }
}
