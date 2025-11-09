<<<<<<< HEAD
# grafana
Grafana dashboards built with TypeScript and Foundation SDK, auto-deployed via GitHub Actions and Tailscale
=======
# Grafana Dashboards - TypeScript via Foundation SDK

This project recreates existing Grafana dashboards in TypeScript using the `@grafana/grafana-foundation-sdk` and compiles them to JSON for import into Grafana.

## Prerequisites

- **Node.js**: 18+ (you have v24.11.0 ✓)
- **Grafana**: With a VictoriaMetrics (Prometheus) datasource
  - Type: `prometheus`
  - UID: `df3igl5nh1f5sa`

## Project Structure

```
grafana/
├── src/
│   ├── dashboards/          # Dashboard implementations
│   └── shared/              # Shared utilities and constants
│       └── datasource.ts    # VictoriaMetrics datasource config
├── build.ts                 # Build script (generates JSON)
├── dist/                    # Generated dashboard JSON files
├── package.json
├── tsconfig.json
└── README.md
```

## Installation

```bash
npm install
```

## Build

Generate dashboard JSON files:

```bash
npm run build
```

This outputs JSON files to `dist/`:
- `dist/air-quality-dashboard.json`
- `dist/energy-monitor-dashboard.json`

## Dashboards to Recreate

### 1. Air Quality Dashboard (26 panels across 4 rows)
- **Particulate Matter**: PM0.3, PM1, PM2.5, PM10 (timeseries + stat panels)
- **Air Quality Indices**: VOC Index, NOx Index, Raw VOC, Raw NOx
- **Gases**: CO₂
- **Climate**: Temperature, Humidity

### 2. Energy Monitor Dashboard (36 panels across 5 rows)
- **Real-time Power**: Total Active Power, Phase 1-3 Power, Current
- **Energy Consumption**: Total Energy Import, Tariff 1 & 2, Active Tariff
- **Gas Consumption**: Total Gas
- **Costs**: Total Energy Cost, Total Gas Cost
- **Power Quality**: Voltage Sags/Swells L1-L3, Power Failures

## SDK Usage Guide

### Imports

```typescript
import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { RowPanelBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
```

### Creating a Dashboard

```typescript
const dashboard = new DashboardBuilder("Dashboard Title")
  .uid("dashboard-uid")
  .tags(["tag1", "tag2"])
  .refresh("30s")
  .time({ from: "now-24h", to: "now" });
```

### Adding a Row

```typescript
const row = new RowPanelBuilder("Row Title");
dashboard.withRow(row);
```

### Adding a Timeseries Panel with Queries

```typescript
const query1 = new DataqueryBuilder()
  .refId("A")
  .expr('{__name__="sensor.metric_value"}')
  .datasource(victoriaMetricsDS)
  .legendFormat("Current");

const query2 = new DataqueryBuilder()
  .refId("B")
  .expr('{__name__="sensor.metric_value"} offset 24h')
  .datasource(victoriaMetricsDS)
  .legendFormat("Previous 24h");

const panel = new TimeseriesPanelBuilder()
  .title("Panel Title")
  .unit("unit")  // e.g., "watt", "celsius", "percent", "ppm"
  .datasource(victoriaMetricsDS)
  .withTarget(query1)
  .withTarget(query2)
  .lineWidth(2)
  .fillOpacity(10)
  .showPoints("never");

// Add overrides for the "Previous 24h" series (dashed grey line)
panel.overrideByName("Previous 24h", [
  {
    id: "custom.lineStyle",
    value: { dash: [10, 10], fill: "dash" }
  },
  {
    id: "color",
    value: { mode: "fixed", fixedColor: "semi-dark-grey" }
  }
]);

dashboard.withPanel(panel);
```

### Adding a Stat Panel with Thresholds

```typescript
const query = new DataqueryBuilder()
  .refId("A")
  .expr('{__name__="sensor.metric_value"}')
  .datasource(victoriaMetricsDS);

const statPanel = new StatPanelBuilder()
  .title("Current Value")
  .unit("watt")
  .datasource(victoriaMetricsDS)
  .withTarget(query)
  .graphMode("area")  // Shows small sparkline
  .thresholds({
    mode: "absolute",
    steps: [
      { color: "green", value: null },
      { color: "yellow", value: 1000 },
      { color: "red", value: 3000 }
    ]
  });

dashboard.withPanel(statPanel);
```

### Grid Positioning

Panels can be positioned using `gridPos`:

```typescript
panel.gridPos({ x: 0, y: 0, w: 18, h: 8 });
```

- `x`: horizontal position (0-23)
- `y`: vertical position (auto-calculated if using rows)
- `w`: width (max 24)
- `h`: height in grid units

## Key Panel Settings from Original Dashboards

### Common Timeseries Settings
- `lineWidth(2)` - 2px line width
- `fillOpacity(10)` - 10% fill under line
- `showPoints("never")` - Don't show data points
- Min value: `min(0)`
- Legend: `legend({ displayMode: "list", placement: "bottom" })`
- Tooltip: `tooltip({ mode: "multi" })`

### Units Used
- **Power**: `watt`
- **Energy**: `kwatth` (kilowatt-hours)
- **Current**: `amp`
- **Gas**: `m3` (cubic meters)
- **Cost**: `currencyEUR`
- **Temperature**: `celsius`
- **Humidity**: `percent`
- **Air Quality**: `conμgm3` (concentration µg/m³)
- **CO₂**: `ppm` (parts per million)
- **Generic**: `none`

### Thresholds Examples

**PM2.5**:
```typescript
[
  { color: "green", value: null },
  { color: "orange", value: 35 },
  { color: "red", value: 55 }
]
```

**PM10**:
```typescript
[
  { color: "green", value: null },
  { color: "orange", value: 50 },
  { color: "red", value: 100 }
]
```

**Power (Watts)**:
```typescript
[
  { color: "green", value: null },
  { color: "yellow", value: 1000 },
  { color: "red", value: 3000 }
]
```

**CO₂**:
```typescript
[
  { color: "green", value: null },
  { color: "orange", value: 1000 },
  { color: "red", value: 2000 }
]
```

**Temperature**:
```typescript
[
  { color: "red", value: null },
  { color: "orange", value: 15 },
  { color: "green", value: 18 },
  { color: "orange", value: 26 },
  { color: "red", value: 30 }
]
```

**Humidity**:
```typescript
[
  { color: "red", value: null },
  { color: "orange", value: 20 },
  { color: "green", value: 30 },
  { color: "orange", value: 60 },
  { color: "red", value: 70 }
]
```

## Extending the Dashboards

To add the remaining panels:

1. **Refer to the original JSON files** for exact queries and configuration
2. **Copy panel structure** from the test example in `build.ts`
3. **Extract queries** from the original JSON `targets` arrays
4. **Apply thresholds** from the JSON `fieldConfig.defaults.thresholds`
5. **Set units** from `fieldConfig.defaults.unit`
6. **Add overrides** for the "Previous 24h" series styling

## Verification

After building, verify the output structure:

```bash
jq keys dist/air-quality-dashboard.json
# Should output: ["dashboard","overwrite"]

jq '.dashboard | keys' dist/air-quality-dashboard.json
# Should show dashboard properties
```

Compare panel count:

```bash
jq '.dashboard.panels | length' dist/air-quality-dashboard.json
jq '.dashboard.panels | length' dist/energy-monitor-dashboard.json
```

## Configuration

Create a `.env` file for Grafana access:

```bash
cp .env.example .env
```

Edit `.env` and set your values:

```bash
GRAFANA_URL=http://your-grafana-host:3000
GRAFANA_TOKEN=glsa_your_service_account_token
```

**Create a Grafana Service Account Token:**
1. Go to Administration → Service Accounts in Grafana
2. Click "Create service account"
3. Give it a name (e.g., "Dashboard Uploader")
4. Assign role: **Editor** (or custom role with Dashboard: Edit permission)
5. Click "Add service account token"
6. Copy the token and paste it in your `.env` file

## Importing to Grafana

### Automated Upload (Recommended)

Use the upload script to automatically push dashboards to Grafana:

```bash
# Build and upload in one command
npm run deploy

# Or separately:
npm run build
npm run upload
```

The script will:
- Read your Grafana URL and token from `.env`
- Upload both dashboards
- Show success/failure for each
- Display the dashboard URLs

### Manual Upload via UI
1. Go to Dashboards → Import in Grafana UI
2. Upload the generated JSON file from `dist/`
3. Select folder and click Import

### Manual Upload via API
```bash
curl -X POST http://localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d @dist/air-quality-dashboard.json
```

## Notes

- **Previous-24h overlays**: Created using PromQL `offset 24h` and styled with dashed grey lines
- **Dashboard refresh**: Set to 30 seconds by default
- **Datasource**: All queries use the VictoriaMetrics datasource (uid: `df3igl5nh1f5sa`)
- **Schema version**: Generated dashboards use the latest Grafana schema

## Reference

- [Grafana Foundation SDK Documentation](https://grafana.github.io/grafana-foundation-sdk/next+cog-v0.0.x/typescript/Installing/)
- [Grafana Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)

## Next Steps

The framework is ready! To complete the dashboards:

1. Create `src/dashboards/air-quality-dashboard.ts`
2. Create `src/dashboards/energy-monitor-dashboard.ts`
3. Implement each panel using the patterns shown in `build.ts`
4. Import the dashboard functions in `build.ts`
5. Run `npm run build` to generate the JSON files

For help with implementing specific panels, refer to the examples in this README and the original JSON files.
>>>>>>> c64b023 (Initial commit: Grafana dashboards with TypeScript, Biome, and GitHub Actions CI/CD)
