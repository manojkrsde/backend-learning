import type {
  ConceptNote,
  CurriculumFile,
  LearningState,
  ProgressEntry,
  Task,
  TaskBrief,
} from "./types";
import { slugify } from "./utils";

// ---------------------------------------------------------------------------
// state.json
// ---------------------------------------------------------------------------

function coerceTask(raw: any): Task | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.title && !raw.id) return null;
  return {
    id: typeof raw.id === "string" ? raw.id : undefined,
    title: typeof raw.title === "string" ? raw.title : raw.id ?? "Untitled task",
    description:
      typeof raw.description === "string" ? raw.description : undefined,
    status: typeof raw.status === "string" ? raw.status : undefined,
    concepts: Array.isArray(raw.concepts)
      ? raw.concepts.filter((c: unknown) => typeof c === "string")
      : [],
  };
}

export function parseState(rawJson: string, mtimeIso: string | null): LearningState {
  let data: any = {};
  try {
    data = JSON.parse(rawJson);
  } catch {
    data = {};
  }

  const concepts: LearningState["concepts"] = {};
  if (data.concepts && typeof data.concepts === "object") {
    for (const [key, value] of Object.entries<any>(data.concepts)) {
      if (value && typeof value === "object" && typeof value.mastery === "number") {
        concepts[key] = {
          mastery: value.mastery,
          last_tested:
            typeof value.last_tested === "string" ? value.last_tested : undefined,
        };
      }
    }
  }

  return {
    phase: data.phase != null ? String(data.phase) : "1",
    current_task: coerceTask(data.current_task),
    next_task: coerceTask(data.next_task),
    completed_task_ids: Array.isArray(data.completed_task_ids)
      ? data.completed_task_ids.filter((id: unknown) => typeof id === "string")
      : [],
    concepts,
    last_updated:
      typeof data.last_updated === "string" ? data.last_updated : mtimeIso,
  };
}

// ---------------------------------------------------------------------------
// progress-log.md
// ---------------------------------------------------------------------------

// The scribe writes entries as:
//
//   <date> — <task title>
//
//   Built: ...
//   Learned: <concepts>, key: <slug(s)>
//   Note: ...
//
// Some tools prefix the entry line with markdown heading marks (##/###). We
// accept both. Entries live under the "## Log" heading; everything above it
// (the format doc + the "(empty ...)" placeholder) is ignored.

const ENTRY_HEADER =
  /^\s*#{0,4}\s*(\d{4}-\d{2}-\d{2})\s*[—\-–:]\s*(.+?)\s*$/;

export function parseProgress(markdown: string): ProgressEntry[] {
  if (!markdown) return [];

  // Only look below the "## Log" heading if present.
  const logIdx = markdown.search(/^##\s+Log\s*$/m);
  const body = logIdx >= 0 ? markdown.slice(logIdx) : markdown;

  const lines = body.split(/\r?\n/);
  const entries: ProgressEntry[] = [];
  let current: { header: RegExpMatchArray; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    const [, date, title] = current.header;
    const block = current.lines.join("\n").trim();
    entries.push(buildEntry(date, title, block));
    current = null;
  };

  for (const line of lines) {
    const m = line.match(ENTRY_HEADER);
    if (m) {
      flush();
      current = { header: m, lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();

  return entries;
}

function fieldValue(block: string, label: string): string | undefined {
  const re = new RegExp(`^\\s*[-*]?\\s*${label}\\s*:?\\s*(.+)$`, "im");
  const m = block.match(re);
  return m ? m[1].trim() : undefined;
}

function buildEntry(date: string, title: string, block: string): ProgressEntry {
  const built = fieldValue(block, "Built");
  const learned = fieldValue(block, "Learned");
  const note = fieldValue(block, "Note");

  // Pull slugs from the "..., key: a, b" part of the Learned line.
  const conceptKeys: string[] = [];
  if (learned) {
    const keyMatch = learned.match(/key\s*:?\s*(.+)$/i);
    if (keyMatch) {
      keyMatch[1]
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => conceptKeys.push(s));
    }
  }

  const haystack = `${title} ${block}`.toLowerCase();
  const status: ProgressEntry["status"] = /in[\s-]?progress|wip|ongoing/.test(
    haystack,
  )
    ? "in-progress"
    : "done";

  return {
    date,
    title: title.trim(),
    built,
    learned: learned ? learned.replace(/,?\s*key\s*:.*$/i, "").trim() : undefined,
    conceptKeys,
    note,
    status,
    raw: block,
  };
}

// ---------------------------------------------------------------------------
// learned-concepts.md
// ---------------------------------------------------------------------------

// Each concept is a "## <name>" section. The first bullet carries the metadata:
//   - **Key:** spring-di · **Area:** spring · **Learned:** 2026-06-25
export function parseConceptNotes(markdown: string): ConceptNote[] {
  if (!markdown) return [];

  const matches = [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)];
  const notes: ConceptNote[] = [];

  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1].trim();
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : markdown.length;
    const body = markdown.slice(start, end).trim();

    const keyMatch = body.match(/\*\*Key:\*\*\s*([a-z0-9-]+)/i);
    const areaMatch = body.match(/\*\*Area:\*\*\s*([^·\n]+)/i);
    const learnedMatch = body.match(/\*\*Learned:\*\*\s*([0-9-]+)/i);

    const key = keyMatch ? keyMatch[1].trim() : slugify(name);

    notes.push({
      key,
      name,
      area: areaMatch ? areaMatch[1].trim() : undefined,
      learned: learnedMatch ? learnedMatch[1].trim() : undefined,
      body,
    });
  }

  return notes;
}

// ---------------------------------------------------------------------------
// curriculum INDEX.md
// ---------------------------------------------------------------------------

// Parse the "| File | Phase | Priority | Pulls in ... |" table into rows.
export function parseCurriculum(markdown: string): CurriculumFile[] {
  if (!markdown) return [];
  const rows: CurriculumFile[] = [];
  const lines = markdown.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim().startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim());
    if (cells.length < 4) continue;

    const file = cells[0].replace(/`/g, "").trim();
    if (!file.endsWith(".md")) continue; // skips header + separator rows

    rows.push({
      file,
      slug: file.replace(/\.md$/, ""),
      phase: cells[1],
      priority: cells[2],
      pullsIn: cells[3],
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// task brief (ai/memory/tasks/<id>.md)
// ---------------------------------------------------------------------------

export function parseTaskBrief(id: string, markdown: string): TaskBrief | null {
  if (!markdown.trim()) return null;

  const lines = markdown.split(/\r?\n/);

  // First line: "# t-001 — <title>"
  const titleMatch = lines[0]?.match(/^#\s+(?:\S+\s*[—\-–:]\s*)?(.+)$/);
  const title = titleMatch ? titleMatch[1].trim() : id;

  // Metadata line: "**Status:** active · **Concepts:** ..."
  let status: string | undefined;
  let concepts: string[] = [];
  for (const line of lines.slice(1, 6)) {
    const statusMatch = line.match(/\*\*Status:\*\*\s*(\S+)/i);
    if (statusMatch) status = statusMatch[1];
    const conceptsMatch = line.match(
      /\*\*Concepts:\*\*\s*(.+)/i,
    );
    if (conceptsMatch) {
      concepts = conceptsMatch[1]
        .split(/[,·]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  // Split into ## sections
  const sectionMatches = [...markdown.matchAll(/^##\s+(.+?)\s*$/gm)];
  const sections: { heading: string; body: string }[] = [];

  for (let i = 0; i < sectionMatches.length; i++) {
    const heading = sectionMatches[i][1].trim();
    const start = sectionMatches[i].index! + sectionMatches[i][0].length;
    const end =
      i + 1 < sectionMatches.length
        ? sectionMatches[i + 1].index!
        : markdown.length;
    const body = markdown.slice(start, end).trim();
    if (body) sections.push({ heading, body });
  }

  return { id, title, status, concepts, sections, raw: markdown };
}
