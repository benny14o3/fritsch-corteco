import pandas as pd
import json

print("Lade Stückliste...")
bom_df = pd.read_excel("Stückliste.xlsx")
bom_df.columns = bom_df.columns.str.strip()

# BOM nach unten auffüllen
bom_df["BOM Artikelnummer"] = bom_df["BOM Artikelnummer"].ffill()

print("Lade Verpackungsanweisung...")
verpack_df = pd.read_excel("Verpackungsanweisung.xlsx")
verpack_df.columns = verpack_df.columns.str.strip()

print("Lade Arbeitsanweisung...")
arbeits_df = pd.read_excel("Arbeitsanweisung.xlsx")
arbeits_df.columns = arbeits_df.columns.str.strip()

# Arbeitsanweisungs-Map
arbeits_map = {}
for _, row in arbeits_df.iterrows():
    bom_raw = row.iloc[0]
    text = row.iloc[1]

    if pd.notna(bom_raw):
        if isinstance(bom_raw, (int, float)) and float(bom_raw).is_integer():
            bom_clean = str(int(bom_raw))
        else:
            bom_clean = str(bom_raw)

        arbeits_map[bom_clean] = str(text).strip() if pd.notna(text) else ""

boms = []

for bom_id, group in bom_df.groupby("BOM Artikelnummer"):

    # BOM ohne .0
    if isinstance(bom_id, (int, float)) and float(bom_id).is_integer():
        bom_id_clean = str(int(bom_id))
    else:
        bom_id_clean = str(bom_id)

    neutral_values = group["Neutralisierungsinfo"].dropna()
    neutral_text = str(neutral_values.iloc[0]) if not neutral_values.empty else ""

    arbeits_text = arbeits_map.get(bom_id_clean, "")

    bom = {
        "bom_id": bom_id_clean,
        "beschreibung": str(group["BOM Beschreibung"].iloc[0]),
        "arbeitsanweisung": arbeits_text,
        "neutralisierung": neutral_text,
        "components": []
    }

    for _, row in group.iterrows():

        artikel = row["Komponente Artikelnummer"]
        beschreibung = row["Komponente Beschreibung"]
        menge = row["Menge"]

        if pd.isna(artikel) or str(artikel).strip() == "":
            continue

        # 🔥 Artikelnummer ohne .0 speichern
        if isinstance(artikel, (int, float)) and float(artikel).is_integer():
            artikel_clean = str(int(artikel))
        else:
            artikel_clean = str(artikel).strip()

        bom["components"].append({
            "artikelnummer": artikel_clean,
            "beschreibung": str(beschreibung).strip() if pd.notna(beschreibung) else "",
            "menge": float(menge) if pd.notna(menge) else 0
        })

    boms.append(bom)

# Verpackungs-Map
verpackung_map = {}

for _, row in verpack_df.iterrows():

    artikel_raw = row["Artikelnummer"]
    anweisung = row["Verpackungsanweisung"]

    if pd.notna(artikel_raw):

        if isinstance(artikel_raw, (int, float)) and float(artikel_raw).is_integer():
            artikel_clean = str(int(artikel_raw))
        else:
            artikel_clean = str(artikel_raw).strip()

        verpackung_map[artikel_clean] = str(anweisung).strip() if pd.notna(anweisung) else ""

output = {
    "boms": boms,
    "verpackung_map": verpackung_map
}

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print("Fertig! data.json aktualisiert.")