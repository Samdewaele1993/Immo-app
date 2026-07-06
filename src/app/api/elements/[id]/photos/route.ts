import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { beschrijfElementFoto } from "@/lib/ai";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const TOEGESTANE_EXTENSIES = new Set(["jpg", "jpeg", "png", "webp"]);
const MAX_BESTANDSGROOTTE = 10 * 1024 * 1024; // 10MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: elementId } = await params;

  const element = await prisma.element.findUnique({ where: { id: elementId } });
  if (!element) {
    return NextResponse.json({ error: "Element niet gevonden" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
  }
  if (file.size > MAX_BESTANDSGROOTTE) {
    return NextResponse.json({ error: "Bestand te groot (max 10MB)" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  if (!TOEGESTANE_EXTENSIES.has(ext)) {
    return NextResponse.json({ error: "Bestandstype niet toegestaan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bestandsnaam = `${randomUUID()}.${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, bestandsnaam), buffer);

  const bestandspad = `/uploads/${bestandsnaam}`;

  const photo = await prisma.photo.create({
    data: { elementId, bestandspad },
  });

  let bijgewerktElement = element;
  const magAutoInvullen = !element.beschrijving || element.aiGegenereerd;

  if (magAutoInvullen) {
    try {
      const resultaat = await beschrijfElementFoto(
        element.naam,
        buffer.toString("base64"),
        file.name
      );
      bijgewerktElement = await prisma.element.update({
        where: { id: elementId },
        data: {
          conditie: resultaat.conditie,
          beschrijving: resultaat.beschrijving,
          aiGegenereerd: true,
        },
      });
    } catch (err) {
      console.error("AI-beschrijving mislukt:", err);
    }
  }

  return NextResponse.json({ photo, element: bijgewerktElement }, { status: 201 });
}
