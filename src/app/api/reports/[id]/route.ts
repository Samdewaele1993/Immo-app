import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { volgorde: "asc" },
        include: { elements: { include: { photos: true } } },
      },
    },
  });
  if (!report) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(report);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  for (const key of [
    "status",
    "adres",
    "postcode",
    "gemeente",
    "huurderNaam",
    "verhuurderNaam",
  ]) {
    if (key in body) data[key] = body[key];
  }

  const report = await prisma.report.update({ where: { id }, data });
  return NextResponse.json(report);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.report.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
