# Onboarding – Antworten

## 1. Anwendung & Tech-Stack

Welche Art von Anwendung wird hier gebaut?
- Ein Lernspiel zum Thema Geldanlage für Studierende
- Man wählt fiktive Aktien aus und baut sich ein Portfolio
- Die App zeigt, wie sich das Portfolio über die Jahre entwickelt hätte
- Dazu Kennzahlen: Rendite, Schwankung (Volatilität), größter Verlust (Max Drawdown)
- Läuft komplett im Browser, kein Server nötig

Welcher Tech-Stack kommt zum Einsatz?
- Sprache: TypeScript
- Oberfläche: React 18
- Build-Tool: Vite
- Styling: Tailwind CSS
- State: Zustand
- Diagramme: Recharts
- Helfer: `seedrandom` (Zufallszahlen), `simple-statistics` (Statistik)

## 2. Datenobjekte („Items")

Was repräsentieren die Items fachlich?
- Die Items sind **Assets** = Aktien von erfundenen deutschen Firmen
- Beispiel: „Nordheim Finanz AG [Finanzdienstleister]"
- 23 Stück aus verschiedenen Branchen
- Jede Aktie hat ein anderes Risiko: von sehr sicher (z. B. Versicherung) bis sehr riskant (z. B. Krypto)
- Jede Aktie hat einen Kursverlauf mit einem Wert pro Monat

Warum reicht die Historie bis 1920 zurück?
- So kann man über 100 Jahre betrachten
- Man sieht Crashs und wie sich die Kurse danach wieder erholen
- Man sieht: Wer lange anlegt und breit streut, hat weniger Risiko

## 3. Datenherkunft

Wie werden die Daten erzeugt?
- Die Kurse sind nicht echt, sie werden berechnet
- Das passiert beim Start der App direkt im Browser (`generateAllAssets()`)
- Es gibt keine Datenbank und keine API
- Grundlage: Die Firmen-Definitionen in `src/constants/assets.ts` (Startpreis, erwartete Rendite, Schwankung)
- Pro Aktie in 3 Schritten:
  1. Zufällige Marktstimmung für jeden Monat (Panik, Angst, neutral, optimistisch, euphorisch)
  2. Kursverlauf berechnen, abhängig von der Stimmung
  3. Zufällige Crashs und Booms einbauen

Welche Rolle spielt der Seed?
- Der Seed ist ein Startwert für den Zufallsgenerator: `'Semester2025'`
- Gleicher Seed = immer die gleichen „Zufallszahlen"
- Dadurch sind die Kurse bei jedem Neuladen und bei jedem Nutzer identisch
- Jede Aktie bekommt ihren eigenen Seed (z. B. `Semester2025-stable-bonds`), damit sich die Kurse unterscheiden
- Anderer Seed = komplett andere Kursverläufe

## 4. Mathematische Berechnungen

Was passiert, wenn der Nutzer die Anzahl der Aktien ändert?
- Der Store speichert die neue Anzahl
- Der Portfoliowert wird für jeden Monat neu berechnet: Summe aus (Anzahl × Kurs)
- Kennzahlen werden neu berechnet: Rendite p. a., Volatilität, Max Drawdown
- Chart und Kennzahlen aktualisieren sich sofort
- Die Kurse der Aktien bleiben gleich – nur die Mischung im Portfolio ändert sich

Wie funktionieren die Verfahren?
- **Marktstimmung (Markov-Kette):** Jeden Monat wird gewürfelt, welche Stimmung als Nächstes kommt. Die Wahrscheinlichkeit hängt nur von der aktuellen Stimmung ab.
- **Kursverlauf (GBM):** Neuer Kurs = alter Kurs × exp(Trend + Zufall). Trend und Schwankung hängen von Stimmung und Risiko der Aktie ab.
- **Normalverteilung (Box-Muller):** Macht aus normalen Zufallszahlen eine Glockenkurve → kleine Bewegungen häufig, große selten.
- **Schocks:** Zufällige Crashs und Booms, danach eine Erholungs- bzw. Korrekturphase.
- **Prognose (Monte Carlo):** Viele mögliche Zukunftspfade berechnen und daraus gute / mittlere / schlechte Fälle ablesen. Ist im Code vorhanden, wird aber noch nicht genutzt.

Warum sind die Ergebnisse trotz Zufall immer gleich?
- Es wird kein echter Zufall (`Math.random()`) verwendet
- Stattdessen `seedrandom` mit festem Seed `'Semester2025'`
- Gleicher Seed = immer dieselbe Zahlenfolge = immer dieselben Kurse

## 5. State & Datenverwaltung im Frontend

Wie wird der State gehalten?
- Mit **Zustand** – ein globaler Store in `src/store/useStore.ts`
- Kein Backend, keine Speicherung: Nach dem Neuladen ist das Portfolio leer
- Inhalt des Stores:
  - `assets` – die 23 generierten Aktien mit Kursverlauf
  - `portfolio` – Liste aus `{ assetId, shares }`
  - `simulationResult` – für Monte Carlo gedacht, wird aber nie gesetzt
- Aktionen: `initializeAssets`, `updatePortfolioItem`, `removePortfolioItem`, `clearPortfolio`
- Portfoliowert und Kennzahlen stehen **nicht** im Store, sie werden in den Komponenten per `useMemo` berechnet

Skizze:

```
App-Start
   │
   ▼
Dashboard ──initializeAssets()──► useStore ──► generateAllAssets()
                                     │            (Kurse berechnen)
                                     │
             ┌───── assets, portfolio ─────┐
             ▼                             ▼
     PortfolioManager                  Dashboard
     (Liste + Kennzahlen)              (Chart)
             │                             │
   Nutzer ändert Anzahl              useMemo: calculatePortfolioHistory()
             │                             │
             ▼                             ▼
   updatePortfolioItem() ──► useStore   HistoricalChart
```

Welche Eigenschaften sind für die Items minimal notwendig?
- `Asset` hat: `id`, `name`, `color`, `params`, `history`
- Für die Berechnung wirklich nötig:
  - `id` – eindeutige Kennung, das Portfolio verweist darauf
  - `history` – Kursverlauf, Liste aus `{ date, value }`
- Nur für die Anzeige:
  - `name` – Firmenname in der Liste
  - `color` – Farbpunkt in der Liste
  - `params` (`mu`, `sigma`) – erwartete Rendite und Schwankung als Info
- `mood` im Datenpunkt ist optional
- Portfolio-Eintrag (`PortfolioItem`): nur `assetId` und `shares`
