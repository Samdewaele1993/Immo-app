import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CONDITIES } from "@/lib/templates";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if ("conditie" in body) {
    if (body.conditie !== null && !CONDITIES.includes(body.conditie)) {
      return NextResponse.json({ error: "Ongeldige conditie" }, { status: 400 });
    }
    data.conditie = body.conditie;
  }
  if ("beschrijving" in body) {
    data.beschrijving = body.beschrijving;
    data.aiGegenereerd = false;
  }

  const element = await prisma.element.update({
    where: { id },
    data,
    include: { photos: true },
  });

  return NextResponse.json(element);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.element.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
