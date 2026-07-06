import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function typeLabel(type: string) {
  return type === "INTREDEND" ? "Intredend" : "Uittredend";
}

function statusBadge(status: string) {
  const isAfgerond = status === "AFGEROND";
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isAfgerond
          ? "bg-green-100 text-green-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {isAfgerond ? "Afgerond" : "Concept"}
    </span>
  );
}

export default async function Home() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { rooms: true },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Plaatsbeschrijvingen
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Digitale plaatsbeschrijvingen met AI-ondersteunde conditiebeoordeling
            </p>
          </div>
          <Link
            href="/reports/new"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            + Nieuwe plaatsbeschrijving
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
            Nog geen plaatsbeschrijvingen. Maak er hierboven een aan om te starten.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/reports/${report.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{report.adres}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {typeLabel(report.type)} · {report.rooms.length} kamer(s) ·{" "}
                      {new Date(report.datum).toLocaleDateString("nl-BE")}
                    </p>
                  </div>
                  {statusBadge(report.status)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
