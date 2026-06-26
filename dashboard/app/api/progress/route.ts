import { getProgressRaw } from "@/lib/data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(getProgressRaw(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
