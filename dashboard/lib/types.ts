// Shapes the dashboard works with. The real source files are sparse and evolve,
// so everything here is parsed defensively — fields may be missing.

export interface Task {
  id?: string;
  title: string;
  description?: string;
  status?: string;
  concepts?: string[];
}

export interface ConceptMastery {
  mastery: number; // 1..5
  last_tested?: string; // ISO date
}

export interface LearningState {
  phase: string; // defaults to "1" when absent
  current_task: Task | null;
  next_task: Task | null;
  completed_task_ids: string[];
  concepts: Record<string, ConceptMastery>;
  last_updated: string | null; // mtime of state.json (ISO)
}

export interface ProgressEntry {
  date: string | null;
  title: string;
  built?: string;
  learned?: string;
  conceptKeys: string[]; // slugs pulled from the "key:" part of the Learned line
  note?: string;
  status: "done" | "in-progress";
  raw: string;
}

export interface ConceptNote {
  key: string; // slug, matches state.json
  name: string; // heading text
  area?: string;
  learned?: string;
  body: string; // the full markdown of the section (without the heading)
}

export interface TaskBrief {
  id: string;
  title: string;
  status?: string;
  concepts: string[];
  sections: { heading: string; body: string }[];
  raw: string;
}

export interface CurriculumFile {
  file: string; // e.g. "spring-boot.md"
  slug: string; // e.g. "spring-boot"
  phase: string;
  priority: string;
  pullsIn: string;
}
