import { NextResponse } from "next/server";
import { getState } from "@/lib/data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getState());
}
