import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { PlaatsbeschrijvingDocument } from "@/lib/pdf";

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

  if (!report) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const reportVoorPdf = {
    ...report,
    rooms: report.rooms.map((room) => ({
      ...room,
      elements: room.elements.map((el) => ({
        ...el,
        photos: el.photos.map((foto) => ({
          ...foto,
          bestandspad: path.join(process.cwd(), "public", foto.bestandspad),
        })),
      })),
    })),
  };

  const buffer = await renderToBuffer(
    <PlaatsbeschrijvingDocument report={reportVoorPdf} />
  );

  const bestandsnaam = `plaatsbeschrijving-${report.adres.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${bestandsnaam}"`,
    },
  });
}
