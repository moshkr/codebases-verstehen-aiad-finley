# Finley – Onboarding

Finley ist ein Finanz-Simulationsspiel für Studierende. Man stellt aus 23 fiktiven deutschen Unternehmen ein Portfolio zusammen und sieht, wie es sich über eine simulierte „Geschichte" von 1920 bis 2025 entwickelt hätte. Lernziele: Diversifikation, Volatilität, Anlagehorizont.

Die Architektur-Diagramme stehen in [ARCHITEKTUR.md](ARCHITEKTUR.md).

---

## 1. Schnellstart

Voraussetzung: Node.js (empfohlen ≥ 18) und npm.

```bash
npm install      # Abhängigkeiten installieren
npm run dev      # Dev-Server starten → http://localhost:5173
```

| Befehl            | Zweck                                                        |
| ----------------- | ------------------------------------------------------------ |
| `npm run dev`     | Vite-Dev-Server mit Hot Reload                               |
| `npm run build`   | Typprüfung (`tsc`) + Production-Build nach `dist/`           |
| `npm run preview` | Den gebauten `dist/`-Stand lokal ausliefern                  |
| `npm run lint`    | ESLint – **Achtung:** im Repo liegt keine ESLint-Config, der Befehl schlägt daher vermutlich fehl |

Es gibt **kein Backend, keine Datenbank und keine API**. Alles läuft im Browser.

---

## 2. Tech-Stack

| Bereich        | Technologie                            |
| -------------- | -------------------------------------- |
| UI             | React 18 + TypeScript (strict)         |
| Build/Dev      | Vite 5                                 |
| Styling        | Tailwind CSS 3                         |
| State          | Zustand                                |
| Charts         | Recharts                               |
| Zufall         | `seedrandom` (deterministischer RNG)   |
| Statistik      | `simple-statistics` (Standardabweichung) |

Import-Alias: `@/` zeigt auf `src/` (konfiguriert in [vite.config.ts](../vite.config.ts) und [tsconfig.json](../tsconfig.json)).

---

## 3. Ordnerstruktur

```
src/
├── main.tsx / App.tsx        Einstieg → rendert <Dashboard />
├── components/
│   ├── Layout/Dashboard.tsx  Seitenlayout: Sidebar links, Chart rechts
│   ├── Portfolio/            PortfolioManager, AssetRow, PortfolioSummary
│   ├── Charts/               HistoricalChart (genutzt), FanChart (ungenutzt)
│   └── Analysis/             SimulationControls (ungenutzt, nur Infotext)
├── store/useStore.ts         Zustand-Store (Assets, Portfolio)
├── lib/
│   ├── utils/assetGenerator.ts  Orchestriert die Kursdaten-Erzeugung
│   ├── gbm/engine.ts            Stimmungsabhängige GBM-Kurspfade
│   ├── gbm/dynamicShockGenerator.ts  Markov-Stimmungen + Schocks
│   ├── portfolio/calculator.ts  Portfoliowert & Kennzahlen
│   ├── analysis/rollingWindow.ts Rolling-Window-Analyse (ungenutzt)
│   └── utils/                   date, random, marketMath
├── constants/
│   ├── assets.ts             Die 23 Assets + Seed + Zeitraum
│   └── marketEvents.ts       Risikokategorien (+ ungenutzte Event-Liste)
└── types/                    Asset, Portfolio, Analysis, MarketMood
```

---

## 4. Wie die App funktioniert

### 4.1 Ablauf beim Start

1. `Dashboard` ruft beim Mount `initializeAssets()` im Store auf.
2. `generateAllAssets()` erzeugt für jedes Asset eine monatliche Kurshistorie 1920–2025 (~1.272 Datenpunkte).
3. Der Store speichert die Assets, die UI zeigt sie in der Sidebar.

### 4.2 Die Simulations-Engine (Kern des Projekts)

Die Kurse sind **nicht echt**, sondern werden bei jedem Seitenaufruf neu berechnet – dank festem Seed aber **immer identisch** (`GLOBAL_SEED = 'Semester2025'` in [assets.ts](../src/constants/assets.ts)). So sehen alle Studierenden dieselben Daten.

Pro Asset in drei Schritten ([assetGenerator.ts](../src/lib/utils/assetGenerator.ts)):

1. **Stimmungsfolge (Markov-Kette)** – `generateMoodSequence()`
   Fünf Stimmungen: `panic`, `fearful`, `neutral`, `optimistic`, `euphoric`. Eine Übergangsmatrix bestimmt monatlich die nächste Stimmung. `neutral` ist am stabilsten (80 % bleibt neutral), `panic` ist kurzlebig.
   Jedes Asset hat seine **eigene** Stimmungsfolge – es gibt keine marktweite Korrelation.

2. **Basis-Kurspfad (GBM)** – `generateMoodBasedGBMPath()`
   Geometrische Brownsche Bewegung mit monatlichem Zeitschritt (`dt = 1/12`). Drift `mu` und Volatilität `sigma` kommen aus der Asset-Definition und werden je nach Stimmung und **Kategorie-Sensitivität** (Beta) skaliert.

3. **Schocks** – `generateDynamicShocks()` + `applyDynamicShocks()`
   Abhängig von der Stimmung tritt mit gewisser Wahrscheinlichkeit ein Schock (Crash oder Boom) auf. Stärke = Basis (1–5 %) × Kategorie-Sensitivität × Stimmungsintensität. Danach folgt eine Erholungs- bzw. Abklingphase über mehrere Monate.

### 4.3 Risikokategorien

Die Kategorie eines Assets wird **aus seiner ID abgeleitet** (`getAssetCategory()` in [marketEvents.ts](../src/constants/marketEvents.ts)), z. B. enthält die ID `crypto` → `speculative`. Die Kategorie bestimmt die Sensitivität ([marketMath.ts](../src/lib/utils/marketMath.ts)):

| Kategorie    | Sensitivität | Kategorie    | Sensitivität |
| ------------ | ------------ | ------------ | ------------ |
| ultra-safe   | 0.1          | growth       | 1.2          |
| very-safe    | 0.2          | aggressive   | 1.8          |
| safe         | 0.3          | speculative  | 2.5          |
| conservative | 0.5          | distressed   | 3.0          |
| balanced     | 0.7          |              |              |

> ⚠️ Wer eine Asset-ID umbenennt, ändert damit unbemerkt ihr Risikoverhalten – und durch den Seed auch ihren kompletten Kursverlauf.

### 4.4 Portfolio & Kennzahlen

Ein Portfolio ist eine Liste `{ assetId, shares }`. [calculator.ts](../src/lib/portfolio/calculator.ts) berechnet:

- **Portfoliowert** pro Monat: `Σ shares × Kurs`
- **Rendite p. a.** (annualisiert, geometrisch)
- **Volatilität p. a.**: Standardabweichung der Monatsrenditen × √12
- **Max Drawdown**: größter Rückgang vom Hoch zum Tief

Diese Werte zeigt `PortfolioSummary` in der Sidebar, den Verlauf zeigt `HistoricalChart`.

---

## 5. State (Zustand-Store)

[useStore.ts](../src/store/useStore.ts):

| Feld / Aktion              | Bedeutung                                         |
| -------------------------- | ------------------------------------------------- |
| `assets`, `isAssetsLoaded` | generierte Assets                                 |
| `portfolio`                | `PortfolioItem[]`                                 |
| `simulationResult`         | für Monte Carlo vorgesehen – aktuell nie gesetzt  |
| `initializeAssets()`       | erzeugt die Assets                                |
| `updatePortfolioItem(id, n)` | setzt Stückzahl (0 = entfernen)                 |
| `removePortfolioItem(id)`, `clearPortfolio()` | Positionen löschen             |

Der Portfoliowert wird **nicht** im Store gespeichert, sondern in `Dashboard` und `PortfolioManager` jeweils per `useMemo` berechnet (also doppelt).

---

## 6. Bekannte Baustellen & toter Code

Laut README offen: **Report-Feature**, **bessere Simulations-Engine**, **schönere UI**.

Vorhanden, aber nicht angebunden:

- `FanChart` + `SimulationResult` + `generateMultiplePaths()` – Monte-Carlo-Prognose (Perzentile 10/50/90)
- `SimulationControls` – zeigt nur einen Infotext
- `performRollingWindowAnalysis()` – Rendite über gleitende Zeitfenster
- `MARKET_EVENTS` – Liste historischer Crashs/Booms, wird nicht verwendet
- `calculateInitialValue()`

Weitere Auffälligkeiten:

- Keine Tests, keine ESLint-Config.
- UI-Texte gemischt Deutsch/Englisch.
- Portfolio wird nicht persistiert (Reload = leer).
- Portfolio-Berechnung nutzt die Datumsachse des ersten Assets im Portfolio und sucht Assets per `find()` in einer Schleife – bei 23 Assets unkritisch.

---

## 7. Typische Aufgaben – wo anfangen?

| Aufgabe                         | Einstiegspunkt                                           |
| ------------------------------- | -------------------------------------------------------- |
| Neues Asset hinzufügen          | `ASSET_DEFINITIONS` in `constants/assets.ts` (ID-Wortwahl bestimmt Kategorie!) |
| Simulationsverhalten ändern     | `lib/gbm/engine.ts`, `lib/gbm/dynamicShockGenerator.ts`  |
| Neue Kennzahl                   | `lib/portfolio/calculator.ts` + `types/portfolio.ts` + `PortfolioSummary.tsx` |
| Monte-Carlo-Prognose aktivieren | `generateMultiplePaths()` → `setSimulationResult()` → `FanChart` im Dashboard |
| Layout/UI                       | `components/Layout/Dashboard.tsx`, Tailwind-Klassen      |
