import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { rooms: { include: { elements: true } } },
  });
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, adres, postcode, gemeente, huurderNaam, verhuurderNaam } = body;

  if (!type || !["INTREDEND", "UITTREDEND"].includes(type)) {
    return NextResponse.json({ error: "Ongeldig type" }, { status: 400 });
  }
  if (!adres || typeof adres !== "string" || !adres.trim()) {
    return NextResponse.json({ error: "Adres is verplicht" }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      type,
      adres: adres.trim(),
      postcode: postcode || null,
      gemeente: gemeente || null,
      huurderNaam: huurderNaam || null,
      verhuurderNaam: verhuurderNaam || null,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
