import { NextResponse } from "next/server";
import { fetchCardBySetAndNumber } from "./client";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const set = url.searchParams.get("set");
  const num = url.searchParams.get("num");
  const lang = url.searchParams.get("lang") || undefined;

  if (!set || !num) {
    return NextResponse.json({ error: "missing parameters" }, { status: 400 });
  }

  const card = await fetchCardBySetAndNumber(set, num, lang);

  if (!card) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}
