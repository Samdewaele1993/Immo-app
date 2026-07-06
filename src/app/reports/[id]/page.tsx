import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReportEditor } from "./ReportEditor";

export const dynamic = "force-dynamic";

export default async function ReportPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  if (!report) notFound();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-4xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Terug naar overzicht
        </Link>
        <ReportEditor initialReport={report} />
      </main>
    </div>
  );
}
