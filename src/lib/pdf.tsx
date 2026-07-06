import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import type { Element, Photo, Room, Report } from "@prisma/client";

type ReportMetData = Report & {
  rooms: (Room & { elements: (Element & { photos: Photo[] })[] })[];
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica" },
  titel: { fontSize: 18, marginBottom: 4, fontWeight: 700 },
  subtitel: { fontSize: 11, color: "#444", marginBottom: 16 },
  infoRij: { flexDirection: "row", marginBottom: 2 },
  infoLabel: { width: 120, color: "#555" },
  kamerTitel: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 18,
    marginBottom: 8,
    borderBottom: "1pt solid #ccc",
    paddingBottom: 4,
  },
  elementBlok: { marginBottom: 10, paddingLeft: 4 },
  elementNaam: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  elementRij: { flexDirection: "row", marginBottom: 2 },
  conditieBadge: { fontSize: 9, marginBottom: 2 },
  beschrijving: { fontSize: 9.5, color: "#333", marginBottom: 4 },
  fotoRij: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  foto: { width: 110, height: 80, objectFit: "cover", borderRadius: 2 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

function conditieLabel(conditie: string | null) {
  if (!conditie) return "Niet beoordeeld";
  const labels: Record<string, string> = {
    UITSTEKEND: "Uitstekend",
    GOED: "Goed",
    MATIG: "Matig",
    SLECHT: "Slecht",
  };
  return labels[conditie] ?? conditie;
}

export function PlaatsbeschrijvingDocument({ report }: { report: ReportMetData }) {
  const typeLabel = report.type === "INTREDEND" ? "Intredende plaatsbeschrijving" : "Uittredende plaatsbeschrijving";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.titel}>{typeLabel}</Text>
        <Text style={styles.subtitel}>{report.adres}</Text>

        <View style={styles.infoRij}>
          <Text style={styles.infoLabel}>Adres</Text>
          <Text>
            {report.adres}
            {report.postcode || report.gemeente
              ? `, ${report.postcode ?? ""} ${report.gemeente ?? ""}`
              : ""}
          </Text>
        </View>
        <View style={styles.infoRij}>
          <Text style={styles.infoLabel}>Datum</Text>
          <Text>{new Date(report.datum).toLocaleDateString("nl-BE")}</Text>
        </View>
        {report.huurderNaam && (
          <View style={styles.infoRij}>
            <Text style={styles.infoLabel}>Huurder</Text>
            <Text>{report.huurderNaam}</Text>
          </View>
        )}
        {report.verhuurderNaam && (
          <View style={styles.infoRij}>
            <Text style={styles.infoLabel}>Verhuurder</Text>
            <Text>{report.verhuurderNaam}</Text>
          </View>
        )}

        {report.rooms.map((room) => (
          <View key={room.id} wrap={false}>
            <Text style={styles.kamerTitel}>{room.naam}</Text>
            {room.elements.map((el) => (
              <View key={el.id} style={styles.elementBlok}>
                <View style={styles.elementRij}>
                  <Text style={styles.elementNaam}>{el.naam}</Text>
                </View>
                <Text style={styles.conditieBadge}>Staat: {conditieLabel(el.conditie)}</Text>
                {el.beschrijving && <Text style={styles.beschrijving}>{el.beschrijving}</Text>}
                {el.photos.length > 0 && (
                  <View style={styles.fotoRij}>
                    {el.photos.map((foto) => (
                      // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image, not an <img>
                      <Image key={foto.id} src={foto.bestandspad} style={styles.foto} />
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} / ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
}
