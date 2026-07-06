"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NieuwRapportPagina() {
  const router = useRouter();
  const [type, setType] = useState<"INTREDEND" | "UITTREDEND">("INTREDEND");
  const [adres, setAdres] = useState("");
  const [postcode, setPostcode] = useState("");
  const [gemeente, setGemeente] = useState("");
  const [huurderNaam, setHuurderNaam] = useState("");
  const [verhuurderNaam, setVerhuurderNaam] = useState("");
  const [bezigMetOpslaan, setBezigMetOpslaan] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setFout(null);
    setBezigMetOpslaan(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          adres,
          postcode,
          gemeente,
          huurderNaam,
          verhuurderNaam,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Aanmaken mislukt");
      }
      const report = await res.json();
      router.push(`/reports/${report.id}`);
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setBezigMetOpslaan(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto w-full max-w-xl px-6 py-12">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← Terug naar overzicht
        </Link>
        <h1 className="mt-4 mb-6 text-2xl font-semibold text-zinc-900">
          Nieuwe plaatsbeschrijving
        </h1>

        <form onSubmit={opslaan} className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Type</label>
            <div className="flex gap-2">
              {(["INTREDEND", "UITTREDEND"] as const).map((optie) => (
                <button
                  type="button"
                  key={optie}
                  onClick={() => setType(optie)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    type === optie
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {optie === "INTREDEND" ? "Intredend" : "Uittredend"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Adres *</label>
            <input
              required
              value={adres}
              onChange={(e) => setAdres(e.target.value)}
              placeholder="Straat en nummer"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-1/3">
              <label className="mb-1 block text-sm font-medium text-zinc-700">Postcode</label>
              <input
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-zinc-700">Gemeente</label>
              <input
                value={gemeente}
                onChange={(e) => setGemeente(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Huurder</label>
            <input
              value={huurderNaam}
              onChange={(e) => setHuurderNaam(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Verhuurder</label>
            <input
              value={verhuurderNaam}
              onChange={(e) => setVerhuurderNaam(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {fout && <p className="text-sm text-red-600">{fout}</p>}

          <button
            type="submit"
            disabled={bezigMetOpslaan}
            className="mt-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {bezigMetOpslaan ? "Bezig met aanmaken..." : "Plaatsbeschrijving aanmaken"}
          </button>
        </form>
      </main>
    </div>
  );
}
