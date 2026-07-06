"use client";

import { useRef, useState } from "react";
import type { Element, Photo, Report, Room } from "@prisma/client";

type RoomMetData = Room & { elements: (Element & { photos: Photo[] })[] };
type ReportMetData = Report & { rooms: RoomMetData[] };

const CONDITIE_OPTIES = [
  { waarde: "", label: "Nog niet beoordeeld" },
  { waarde: "UITSTEKEND", label: "Uitstekend" },
  { waarde: "GOED", label: "Goed" },
  { waarde: "MATIG", label: "Matig" },
  { waarde: "SLECHT", label: "Slecht" },
];

function conditieKleur(conditie: string | null) {
  switch (conditie) {
    case "UITSTEKEND":
      return "bg-emerald-100 text-emerald-800";
    case "GOED":
      return "bg-green-100 text-green-800";
    case "MATIG":
      return "bg-amber-100 text-amber-800";
    case "SLECHT":
      return "bg-red-100 text-red-800";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

export function ReportEditor({ initialReport }: { initialReport: ReportMetData }) {
  const [report, setReport] = useState(initialReport);
  const [nieuweKamerNaam, setNieuweKamerNaam] = useState("");
  const [bezigKamerToevoegen, setBezigKamerToevoegen] = useState(false);

  function updateElement(elementId: string, updates: Partial<Element & { photos: Photo[] }>) {
    setReport((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => ({
        ...room,
        elements: room.elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      })),
    }));
  }

  async function voegKamerToe(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuweKamerNaam.trim()) return;
    setBezigKamerToevoegen(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id, naam: nieuweKamerNaam.trim() }),
      });
      const room = await res.json();
      setReport((prev) => ({ ...prev, rooms: [...prev.rooms, room] }));
      setNieuweKamerNaam("");
    } finally {
      setBezigKamerToevoegen(false);
    }
  }

  async function verwijderKamer(roomId: string) {
    if (!confirm("Deze kamer en alle bijhorende gegevens verwijderen?")) return;
    await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
    setReport((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== roomId) }));
  }

  async function wijzigConditie(elementId: string, conditie: string) {
    updateElement(elementId, { conditie: conditie || null });
    await fetch(`/api/elements/${elementId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conditie: conditie || null }),
    });
  }

  async function wijzigBeschrijving(elementId: string, beschrijving: string) {
    updateElement(elementId, { beschrijving, aiGegenereerd: false });
    await fetch(`/api/elements/${elementId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beschrijving }),
    });
  }

  async function markeerAfgerond() {
    const nieuweStatus = report.status === "AFGEROND" ? "CONCEPT" : "AFGEROND";
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nieuweStatus }),
    });
    const updated = await res.json();
    setReport((prev) => ({ ...prev, status: updated.status }));
  }

  return (
    <div className="mt-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{report.adres}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {report.type === "INTREDEND" ? "Intredende" : "Uittredende"} plaatsbeschrijving
            {report.huurderNaam ? ` · Huurder: ${report.huurderNaam}` : ""}
            {report.verhuurderNaam ? ` · Verhuurder: ${report.verhuurderNaam}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/reports/${report.id}/pdf`}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            PDF downloaden
          </a>
          <button
            onClick={markeerAfgerond}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              report.status === "AFGEROND"
                ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                : "bg-zinc-900 text-white hover:bg-zinc-700"
            }`}
          >
            {report.status === "AFGEROND" ? "Heropen als concept" : "Markeer als afgerond"}
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {report.rooms.map((room) => (
          <KamerKaart
            key={room.id}
            room={room}
            onVerwijderKamer={() => verwijderKamer(room.id)}
            onWijzigConditie={wijzigConditie}
            onWijzigBeschrijving={wijzigBeschrijving}
            onFotoGeupload={(elementId, photo, elementUpdates) => {
              setReport((prev) => ({
                ...prev,
                rooms: prev.rooms.map((r) =>
                  r.id !== room.id
                    ? r
                    : {
                        ...r,
                        elements: r.elements.map((el) =>
                          el.id === elementId
                            ? { ...el, ...elementUpdates, photos: [...el.photos, photo] }
                            : el
                        ),
                      }
                ),
              }));
            }}
            onFotoVerwijderd={(elementId, photoId) => {
              setReport((prev) => ({
                ...prev,
                rooms: prev.rooms.map((r) =>
                  r.id !== room.id
                    ? r
                    : {
                        ...r,
                        elements: r.elements.map((el) =>
                          el.id === elementId
                            ? { ...el, photos: el.photos.filter((p) => p.id !== photoId) }
                            : el
                        ),
                      }
                ),
              }));
            }}
          />
        ))}
      </div>

      <form onSubmit={voegKamerToe} className="mt-6 flex gap-2">
        <input
          value={nieuweKamerNaam}
          onChange={(e) => setNieuweKamerNaam(e.target.value)}
          placeholder="Bv. Living, Keuken, Badkamer, Slaapkamer 1..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={bezigKamerToevoegen}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          + Kamer toevoegen
        </button>
      </form>
    </div>
  );
}

function KamerKaart({
  room,
  onVerwijderKamer,
  onWijzigConditie,
  onWijzigBeschrijving,
  onFotoGeupload,
  onFotoVerwijderd,
}: {
  room: RoomMetData;
  onVerwijderKamer: () => void;
  onWijzigConditie: (elementId: string, conditie: string) => void;
  onWijzigBeschrijving: (elementId: string, beschrijving: string) => void;
  onFotoGeupload: (
    elementId: string,
    photo: Photo,
    elementUpdates: Partial<Element>
  ) => void;
  onFotoVerwijderd: (elementId: string, photoId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <h2 className="text-lg font-medium text-zinc-900">{room.naam}</h2>
        <button
          onClick={onVerwijderKamer}
          className="text-sm text-zinc-400 hover:text-red-600"
        >
          Verwijderen
        </button>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100">
        {room.elements.map((element) => (
          <ElementRij
            key={element.id}
            element={element}
            onWijzigConditie={(conditie) => onWijzigConditie(element.id, conditie)}
            onWijzigBeschrijving={(beschrijving) =>
              onWijzigBeschrijving(element.id, beschrijving)
            }
            onFotoGeupload={(photo, updates) => onFotoGeupload(element.id, photo, updates)}
            onFotoVerwijderd={(photoId) => onFotoVerwijderd(element.id, photoId)}
          />
        ))}
      </div>
    </div>
  );
}

function ElementRij({
  element,
  onWijzigConditie,
  onWijzigBeschrijving,
  onFotoGeupload,
  onFotoVerwijderd,
}: {
  element: Element & { photos: Photo[] };
  onWijzigConditie: (conditie: string) => void;
  onWijzigBeschrijving: (beschrijving: string) => void;
  onFotoGeupload: (photo: Photo, elementUpdates: Partial<Element>) => void;
  onFotoVerwijderd: (photoId: string) => void;
}) {
  const [beschrijving, setBeschrijving] = useState(element.beschrijving ?? "");
  const [bezigMetUpload, setBezigMetUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBezigMetUpload(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/elements/${element.id}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload mislukt");
      const data = await res.json();
      setBeschrijving(data.element.beschrijving ?? "");
      onFotoGeupload(data.photo, data.element);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload mislukt");
    } finally {
      setBezigMetUpload(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function verwijderFoto(photoId: string) {
    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    onFotoVerwijderd(photoId);
  }

  return (
    <div className="flex flex-col gap-2 px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-800">{element.naam}</span>
          {element.aiGegenereerd && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              AI-voorstel
            </span>
          )}
        </div>
        <select
          value={element.conditie ?? ""}
          onChange={(e) => onWijzigConditie(e.target.value)}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${conditieKleur(
            element.conditie
          )}`}
        >
          {CONDITIE_OPTIES.map((optie) => (
            <option key={optie.waarde} value={optie.waarde}>
              {optie.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={beschrijving}
        onChange={(e) => setBeschrijving(e.target.value)}
        onBlur={() => onWijzigBeschrijving(beschrijving)}
        placeholder="Beschrijving van de staat (wordt automatisch aangevuld na foto-upload)..."
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:border-zinc-400 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        {element.photos.map((photo) => (
          <div key={photo.id} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.bestandspad}
              alt={element.naam}
              className="h-20 w-24 rounded-lg object-cover"
            />
            <button
              onClick={() => verwijderFoto(photo.id)}
              className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white group-hover:flex"
              title="Foto verwijderen"
            >
              ×
            </button>
          </div>
        ))}
        <label className="flex h-20 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50">
          {bezigMetUpload ? "Bezig..." : "+ Foto"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFotoUpload}
            disabled={bezigMetUpload}
          />
        </label>
      </div>
    </div>
  );
}
