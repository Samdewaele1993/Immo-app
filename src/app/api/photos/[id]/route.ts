import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.photo.delete({ where: { id } });

  try {
    await unlink(path.join(process.cwd(), "public", photo.bestandspad));
  } catch {
    // bestand al verwijderd of niet gevonden, negeren
  }

  return NextResponse.json({ ok: true });
}
