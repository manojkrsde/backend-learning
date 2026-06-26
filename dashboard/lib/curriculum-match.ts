import type { CurriculumFile, LearningState } from "./types";

// The curriculum is indexed by topic FILE (java.md, spring-boot.md, …) while
// state.json tracks fine-grained concept slugs (spring-di, java-records-dto, …).
// There's no shared id, so we map concepts to topics by keyword. A concept can
// legitimately match more than one topic (spring-data-jpa touches both Spring
// and Postgres), and that's fine for a reference map.
const TOPIC_KEYWORDS: Record<string, RegExp[]> = {
  java: [/^java\b/, /\bmaven\b/, /\brecord/, /\bjvm\b/, /\bgradle\b/],
  "spring-boot": [/\bspring\b/, /\bbean\b/, /\bdi\b/, /\bcontroller\b/, /\bmvc\b/],
  "sql-postgres": [/\bjpa\b/, /\bhibernate\b/, /\bsql\b/, /\bpostgres\b/, /\bn-?plus/, /\bquery\b/, /\bentity\b/, /\btransaction/],
  "api-design": [/\bapi\b/, /\brest\b/, /\bhttp\b/, /\bdto\b/, /\bvalidation\b/, /\bstatus-code/, /\bproblemdetail/],
  testing: [/\btest/, /\bjunit\b/, /\bmockmvc\b/, /\bmockito\b/, /\btestcontainers\b/, /\bdatajpatest\b/],
  redis: [/\bredis\b/, /\bcache/, /\bsession\b/, /\brate-?limit/],
  messaging: [/\bkafka\b/, /\bqueue\b/, /\bmessaging\b/, /\bsqs\b/, /\basync\b/, /\bevent\b/],
  docker: [/\bdocker\b/, /\bcontainer\b/, /\bcompose\b/],
  aws: [/\baws\b/, /\bs3\b/, /\bec2\b/, /\blambda\b/, /\brds\b/],
  cicd: [/\bci\b/, /\bcd\b/, /\bcicd\b/, /\bgithub-?actions\b/, /\bpipeline\b/],
  observability: [/\bobservability\b/, /\bmetric/, /\blogging\b/, /\btrace/, /\bactuator\b/],
  ai: [/\bai\b/, /\bllm\b/, /\brag\b/, /\bembedding\b/, /\bspring-ai\b/],
  nosql: [/\bnosql\b/, /\bmongo/, /\bdynamo/, /\bcassandra\b/],
};

export type TopicStatus = "mastered" | "in-progress" | "not-started";

export interface TopicCrossRef {
  file: CurriculumFile;
  status: TopicStatus;
  concepts: { slug: string; mastery: number | null }[];
}

function matchConcepts(slug: string, allSlugs: string[]): string[] {
  const patterns = TOPIC_KEYWORDS[slug] ?? [];
  return allSlugs.filter((c) => patterns.some((re) => re.test(c)));
}

export function crossReference(
  files: CurriculumFile[],
  state: LearningState,
): TopicCrossRef[] {
  const allSlugs = Array.from(
    new Set([
      ...Object.keys(state.concepts),
      ...(state.current_task?.concepts ?? []),
    ]),
  );

  return files.map((file) => {
    const matched = matchConcepts(file.slug, allSlugs);
    const concepts = matched.map((slug) => ({
      slug,
      mastery: state.concepts[slug]?.mastery ?? null,
    }));

    let status: TopicStatus = "not-started";
    if (concepts.length > 0) {
      const best = Math.max(...concepts.map((c) => c.mastery ?? 0));
      status = best >= 4 ? "mastered" : "in-progress";
    }

    return { file, status, concepts };
  });
}
