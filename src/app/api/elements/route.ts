import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, naam } = body;

  if (!roomId || !naam || typeof naam !== "string" || !naam.trim()) {
    return NextResponse.json({ error: "roomId en naam zijn verplicht" }, { status: 400 });
  }

  const element = await prisma.element.create({
    data: { roomId, naam: naam.trim() },
    include: { photos: true },
  });

  return NextResponse.json(element, { status: 201 });
}
