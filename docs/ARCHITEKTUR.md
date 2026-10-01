# Finley – Architektur-Diagramme

Die Diagramme sind in [Mermaid](https://mermaid.js.org/) geschrieben. Sie werden auf GitHub automatisch gerendert, in VS Code z. B. mit der Erweiterung „Markdown Preview Mermaid Support".

Zurück zum [Onboarding](ONBOARDING.md).

---

## 1. Schichtenüberblick

Rein clientseitige Single-Page-App, kein Backend.

```mermaid
flowchart TB
    subgraph UI["UI-Schicht – React-Komponenten"]
        Dashboard
        PortfolioManager
        HistoricalChart
    end

    subgraph State["State – Zustand"]
        Store["useStore<br/>assets · portfolio"]
    end

    subgraph Logic["Logik – src/lib"]
        Generator["assetGenerator"]
        GBM["gbm/engine"]
        Shocks["gbm/dynamicShockGenerator"]
        Calc["portfolio/calculator"]
    end

    subgraph Config["Konfiguration – src/constants"]
        AssetsDef["assets.ts<br/>23 Assets · Seed · 1920–2025"]
        Categories["marketEvents.ts<br/>getAssetCategory"]
    end

    UI -->|liest / schreibt| Store
    Store -->|initializeAssets| Generator
    UI -->|useMemo| Calc
    Generator --> GBM
    Generator --> Shocks
    Generator --> AssetsDef
    Generator --> Categories
```

---

## 2. Komponentenbaum

Grau gestrichelt = im Code vorhanden, aber nicht eingebunden.

```mermaid
flowchart TD
    main["main.tsx"] --> App["App.tsx"]
    App --> Dashboard["Layout/Dashboard"]
    Dashboard --> PM["Portfolio/PortfolioManager<br/>(Sidebar links)"]
    Dashboard --> HC["Charts/HistoricalChart<br/>(Hauptbereich)"]
    PM --> AR["Portfolio/AssetRow<br/>× 23"]
    PM --> PS["Portfolio/PortfolioSummary<br/>Kennzahlen"]

    FC["Charts/FanChart"]:::unused
    SC["Analysis/SimulationControls"]:::unused

    classDef unused fill:#eee,stroke:#999,stroke-dasharray:4 3,color:#777
```

---

## 3. Pipeline der Kursdaten-Erzeugung

Wird einmal beim Start in `generateAllAssets()` für **jedes** Asset durchlaufen.

```mermaid
flowchart LR
    Def["AssetDefinition<br/>id · startPrice · mu · sigma"]
    Seed["GLOBAL_SEED<br/>'Semester2025'"]
    Dates["generateDateRange<br/>1920–2025 monatlich"]

    Def --> Cat["getAssetCategory(id)<br/>→ Kategorie"]
    Cat --> Sens["getCategorySensitivity<br/>→ Beta 0.1 … 3.0"]

    Seed --> Moods["1 · generateMoodSequence<br/>Markov-Kette"]
    Dates --> Moods

    Moods --> Path["2 · generateMoodBasedGBMPath<br/>Basis-Kurspfad"]
    Def --> Path
    Sens --> Path

    Moods --> ShockGen["3a · generateDynamicShocks<br/>Crash / Boom"]
    Sens --> ShockGen

    Path --> Apply["3b · applyDynamicShocks<br/>+ Erholung / Abklingen"]
    ShockGen --> Apply

    Apply --> Asset["Asset<br/>history: DataPoint[]"]
```

Jeder Schritt bekommt einen eigenen abgeleiteten Seed (`…-moods`, `…-shocks-…`), daher ist das Ergebnis deterministisch.

---

## 4. Marktstimmungen (Markov-Kette)

Übergangswahrscheinlichkeiten pro Monat aus `TRANSITION_MATRIX` in `dynamicShockGenerator.ts` (Übergänge < 5 % weggelassen).

```mermaid
stateDiagram-v2
    direction LR
    [*] --> neutral

    neutral --> neutral: 80 %
    neutral --> fearful: 10 %
    neutral --> optimistic: 8 %

    optimistic --> optimistic: 75 %
    optimistic --> neutral: 15 %
    optimistic --> fearful: 5 %
    optimistic --> euphoric: 5 %

    euphoric --> optimistic: 40 %
    euphoric --> neutral: 20 %
    euphoric --> euphoric: 20 %
    euphoric --> panic: 10 %
    euphoric --> fearful: 10 %

    fearful --> fearful: 60 %
    fearful --> neutral: 30 %
    fearful --> panic: 5 %
    fearful --> optimistic: 5 %

    panic --> fearful: 50 %
    panic --> panic: 30 %
    panic --> neutral: 10 %
    panic --> optimistic: 10 %
```

Wirkung der Stimmung auf den Kurs:

| Stimmung   | Drift × | Volatilität × | Schock-Chance / Monat | davon positiv |
| ---------- | ------- | ------------- | --------------------- | ------------- |
| euphoric   | 1.5     | 0.6           | 12 %                  | 85 %          |
| optimistic | 1.2     | 0.9           | 6 %                   | 70 %          |
| neutral    | 1.0     | 1.0           | 3 %                   | 50 %          |
| fearful    | 0.5     | 1.3           | 8 %                   | 35 %          |
| panic      | −1.5    | 2.5           | 20 %                  | 15 %          |

Die Multiplikatoren werden zusätzlich mit der Kategorie-Sensitivität des Assets skaliert.

---

## 5. Ablauf: App-Start und Nutzerinteraktion

```mermaid
sequenceDiagram
    actor U as Nutzer
    participant D as Dashboard
    participant S as useStore
    participant G as assetGenerator
    participant PM as PortfolioManager
    participant C as calculator
    participant HC as HistoricalChart

    Note over D,G: App-Start
    D->>S: initializeAssets()
    S->>G: generateAllAssets()
    G-->>S: Asset[] (23 × ~1.272 Monatswerte)
    S-->>PM: assets
    PM-->>U: Liste der Assets

    Note over U,HC: Portfolio bearbeiten
    U->>PM: Stückzahl ändern (AssetRow)
    PM->>S: updatePortfolioItem(id, shares)
    S-->>D: portfolio geändert
    S-->>PM: portfolio geändert
    D->>C: calculatePortfolioHistory()
    PM->>C: calculatePortfolioHistory()
    C-->>D: data + metrics
    C-->>PM: data + metrics
    D->>HC: data
    HC-->>U: Wertverlauf 1920–2025
    PM-->>U: Rendite p.a. · Volatilität · Max Drawdown
```

Hinweis: `calculatePortfolioHistory()` läuft zweimal – einmal in `Dashboard`, einmal in `PortfolioManager`.

---

## 6. Datenmodell

```mermaid
classDiagram
    class Asset {
        string id
        string name
        string color
        GBMParams params
        DataPoint[] history
    }
    class GBMParams {
        number mu
        number sigma
    }
    class DataPoint {
        string date
        number value
        MarketMood mood
    }
    class PortfolioItem {
        string assetId
        number shares
    }
    class PortfolioHistory {
        DataPoint[] data
        PortfolioMetrics metrics
    }
    class PortfolioMetrics {
        number totalValue
        number returnPA
        number volatilityPA
        number maxDrawdown
    }
    class SimulationResult {
        <<ungenutzt>>
        DataPoint[] percentile10
        DataPoint[] percentile50
        DataPoint[] percentile90
    }

    Asset *-- GBMParams
    Asset *-- "viele" DataPoint
    PortfolioItem ..> Asset : assetId
    PortfolioHistory *-- "viele" DataPoint
    PortfolioHistory *-- PortfolioMetrics
```
