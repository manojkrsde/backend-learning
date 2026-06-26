import fs from "fs";
import { REPO_PATHS } from "./paths";
import {
  parseConceptNotes,
  parseCurriculum,
  parseProgress,
  parseState,
  parseTaskBrief,
} from "./parse";

function readFileSafe(file: string): string {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

function mtimeIso(file: string): string | null {
  try {
    return fs.statSync(file).mtime.toISOString();
  } catch {
    return null;
  }
}

export function getState() {
  const file = REPO_PATHS.state();
  return parseState(readFileSafe(file), mtimeIso(file));
}

export function getStateMtime(): string | null {
  return mtimeIso(REPO_PATHS.state());
}

export function getProgressRaw(): string {
  return readFileSafe(REPO_PATHS.progress());
}

export function getProgress() {
  return parseProgress(getProgressRaw());
}

export function getConceptNotesRaw(): string {
  return readFileSafe(REPO_PATHS.concepts());
}

export function getConceptNotes() {
  return parseConceptNotes(getConceptNotesRaw());
}

export function getCurriculumRaw(): string {
  return readFileSafe(REPO_PATHS.curriculum());
}

export function getCurriculum() {
  return parseCurriculum(getCurriculumRaw());
}

export function getTaskBrief(id: string) {
  const file = REPO_PATHS.taskBrief(id);
  return parseTaskBrief(id, readFileSafe(file));
}
