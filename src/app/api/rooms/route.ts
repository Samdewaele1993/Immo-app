import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { elementenVoorKamer } from "@/lib/templates";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { reportId, naam } = body;

  if (!reportId || !naam || typeof naam !== "string" || !naam.trim()) {
    return NextResponse.json({ error: "reportId en naam zijn verplicht" }, { status: 400 });
  }

  const bestaandeCount = await prisma.room.count({ where: { reportId } });

  const room = await prisma.room.create({
    data: {
      reportId,
      naam: naam.trim(),
      volgorde: bestaandeCount,
      elements: {
        create: elementenVoorKamer(naam).map((elementNaam) => ({ naam: elementNaam })),
      },
    },
    include: { elements: { include: { photos: true } } },
  });

  return NextResponse.json(room, { status: 201 });
}
