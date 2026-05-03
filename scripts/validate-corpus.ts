import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();
const dirs = [
  path.join(root, "content/corpus/global"),
  path.join(root, "content/work"),
];

const requiredFields = ["slug", "kind", "title", "tags", "updatedAt"] as const;
const validKinds = new Set(["writing", "tweet", "tool", "note", "metric"]);

type Issue = { file: string; problem: string };

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function audit(): Issue[] {
  const issues: Issue[] = [];
  const files = dirs.flatMap(walk);

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");

    if (raw.includes("—")) {
      issues.push({ file, problem: "contains em-dash (—)" });
    }
    if (raw.includes("–")) {
      issues.push({ file, problem: "contains en-dash (–)" });
    }

    const parsed = matter(raw);
    for (const field of requiredFields) {
      if (parsed.data[field] === undefined || parsed.data[field] === null) {
        issues.push({ file, problem: `missing required frontmatter field "${field}"` });
      }
    }

    if (parsed.data.kind && !validKinds.has(parsed.data.kind)) {
      issues.push({
        file,
        problem: `invalid kind "${parsed.data.kind}" (must be one of: writing, tweet, tool, note, metric)`,
      });
    }

    if (parsed.data.tags && !Array.isArray(parsed.data.tags)) {
      issues.push({ file, problem: "tags must be an array" });
    }

    if (parsed.content.trim().length === 0) {
      issues.push({ file, problem: "empty body" });
    }
  }

  return issues;
}

function main() {
  const issues = audit();
  if (issues.length === 0) {
    console.log("Corpus validation passed.");
    return;
  }

  console.error(`Found ${issues.length} issue(s):`);
  for (const { file, problem } of issues) {
    console.error(`  ${path.relative(root, file)}: ${problem}`);
  }
  process.exit(1);
}

main();
