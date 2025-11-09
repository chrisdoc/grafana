# Grafana Dashboards - TypeScript via Foundation SDK

**Production-ready Grafana dashboards** built with TypeScript and auto-deployed via GitHub Actions + Tailscale.

This project generates Grafana dashboards programmatically using `@grafana/grafana-foundation-sdk`, compiles them to JSON, validates them with Biome, and auto-deploys to Grafana via secure Tailscale networking.

## Prerequisites

- **Node.js**: 20+ (for GitHub Actions compatibility)
- **pnpm**: 10+ (package manager)
- **Grafana**: With a VictoriaMetrics (Prometheus) datasource
  - UID: `df3igl5nh1f5sa`
- **Optional**: `.env` file for local deployment (GRAFANA_URL, GRAFANA_TOKEN)

## Project Structure

```
grafana/
├── src/
│   ├── dashboards/              # Dashboard implementations (4 dashboards, 90 panels)
│   │   ├── air-quality-dashboard.ts
│   │   ├── energy-monitor-dashboard.ts
│   │   ├── thermostat-dashboard.ts
│   │   └── location-tracking-dashboard.ts
│   └── shared/
│       └── datasource.ts        # VictoriaMetrics datasource config (UID: df3igl5nh1f5sa)
├── .github/
│   ├── workflows/
│   │   └── deploy.yml           # CI/CD pipeline (build → lint → Tailscale → deploy)
│   ├── dependabot.yml           # Automatic dependency updates (npm, GitHub Actions)
│   └── copilot-instructions.md  # AI agent coding guidelines
├── build.ts                     # Build orchestrator (compiles TS → JSON)
├── dist/                        # Generated dashboard JSON files (4 files, 90 panels)
├── upload.sh                    # Grafana API deployment script
├── biome.json                   # Code formatter & linter (100-char line width)
├── pnpm-lock.yaml              # Lock file for pnpm v10
├── AGENTS.md                    # Datasource & metric reference (2,708 metrics)
├── MAINTENANCE.md               # Guide for keeping documentation updated
├── package.json
├── tsconfig.json
└── README.md
```

## Installation & Quick Start

```bash
# Install dependencies with pnpm
pnpm install

# Format code (Biome)
pnpm fmt

# Lint code (Biome)
pnpm lint

# Build dashboards (TypeScript → JSON)
pnpm build

# Local deployment (requires .env)
pnpm deploy

# GitHub Actions deployment (automatic on push to main)
# - Builds, lints, validates
# - Connects via Tailscale
# - Uploads to Grafana
```

## Architecture

```
VictoriaMetrics Datasource (2,708 Home Assistant metrics)
    ↓
TypeScript Dashboard Builders (src/dashboards/*.ts)
    ↓
build.ts Compiler → dist/*.json
    ↓
GitHub Actions CI/CD
    ↓
Tailscale VPN → Grafana API Upload
```

**Key Components**:
- **Datasource**: VictoriaMetrics (UID: `df3igl5nh1f5sa`) via Prometheus queries
- **Build Process**: `build.ts` compiles TypeScript to JSON with automatic null-value bridging
- **Deployment**: `upload.sh` + GitHub Actions with Tailscale secure networking

## Dashboards (4 Complete, 90 Panels)

| Dashboard | Panels | Metrics | Status |
|-----------|--------|---------|--------|
| Air Quality | 26 | Pollutants, AQI, climate | ✅ Complete |
| Energy Monitor | 36 | Real-time power, tariffs, gas, costs | ✅ Complete |
| Thermostat Overview | 14 | Zone temperatures, humidity, schedules | ✅ Complete |
| Location Tracking | 14 | Device locations, battery, connectivity | ✅ Complete |

**Totals**: 90 panels across 10 rows, 2,708 Home Assistant metrics

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

## Features

✨ **Automated Dashboard Generation**
- TypeScript-first development with full IDE support
- Type-safe Grafana Foundation SDK
- Automatic null-value bridging across 10-minute gaps
- Consistent formatting and linting (Biome)

🔐 **Secure Deployment**
- GitHub Actions CI/CD pipeline
- Tailscale VPN for private network connectivity
- OAuth-based authentication
- Secret management for API tokens and credentials

📊 **Rich Visualizations**
- 90+ panels across 4 dashboards
- Time-series, stats, gauges, and bar charts
- 24-hour previous-day overlays for trend comparison
- Auto-scaling grid layout

🔌 **Full Home Assistant Integration**
- 2,708 metrics from Home Assistant via VictoriaMetrics
- All domains supported: sensor, climate, light, device_tracker, binary_sensor, weather, switch
- PromQL queries with Home Assistant entity naming conventions
- Real-time metrics with 30-second refresh

## Development & Contribution

### Adding a New Dashboard

1. **Create dashboard file**: `src/dashboards/my-dashboard.ts`
   ```typescript
   import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
   import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
   import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
   import { victoriaMetricsDS } from "../shared/datasource.js";

   export function makeMyDashboard() {
     const dashboard = new DashboardBuilder("My Dashboard")
       .uid("my-dashboard-uid")
       .tags(["custom", "tag"])
       .refresh("30s")
       .time({ from: "now-24h", to: "now" })
       .timezone("browser");

     const query = new DataqueryBuilder()
       .refId("A")
       .expr('{__name__="sensor.my_metric_value"}')
       .datasource(victoriaMetricsDS)
       .legendFormat("My Metric");

     const panel = new TimeseriesPanelBuilder()
       .title("My Panel")
       .datasource(victoriaMetricsDS)
       .withTarget(query)
       .gridPos({ x: 0, y: 0, w: 12, h: 8 });

     dashboard.withPanel(panel);
     return dashboard.build();
   }
   ```

2. **Register in build.ts**: Import and add to `main()`:
   ```typescript
   import { makeMyDashboard } from "./dashboards/my-dashboard.js";

   export async function main() {
     const dashboards = [
       makeMyDashboard(),
       makeAirQualityDashboard(),
       makeEnergyMonitorDashboard(),
       // ... other dashboards
     ];
     // ...
   }
   ```

3. **Build and validate**:
   ```bash
   pnpm build
   pnpm fmt
   pnpm lint
   ```

4. **Update docs**: Add to `AGENTS.md` and this README.md

5. **Push and deploy**: GitHub Actions handles CI/CD automatically

### Code Style & Standards

- **Formatting**: Biome (100-char line width, 2-space indent)
- **Imports**: Use `.js` extensions in ESM imports
- **Panel Types**: Always alias `PanelBuilder` to specify type (e.g., `TimeseriesPanelBuilder`)
- **UIDs**: Use unique, kebab-case identifiers
- **Units**: Grafana standard units (celsius, percent, ppm, kwatth, watt, none)

### Testing & Validation

Before committing:
```bash
# Format code
pnpm fmt

# Lint for errors
pnpm lint

# Build and verify JSON
pnpm build
jq '.dashboard.panels | length' dist/*.json  # Count panels
```

### Debugging

- **Check build output**: `cat dist/*.json | jq .`
- **Verify datasource**: Ensure VictoriaMetrics is running and accessible
- **Test queries**: Use `curl` or Grafana's Query Inspector
- **GitHub Actions logs**: Check workflow runs in repository settings

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `pnpm: command not found` | Install pnpm: `npm install -g pnpm` |
| Build fails with import errors | Ensure `.js` extensions in imports |
| Null-values not connected | Verify `build.ts` has `addConnectNullValuesToTimeseries` enabled |
| Metrics not appearing | Check VictoriaMetrics datasource UID matches |
| Tailscale connection fails | Verify OAuth credentials in GitHub secrets |
| Grafana upload fails | Check `GRAFANA_URL` and `GRAFANA_TOKEN` in `.env` or GitHub secrets |

## Reference

- [Grafana Foundation SDK Documentation](https://grafana.github.io/grafana-foundation-sdk/next+cog-v0.0.x/typescript/Installing/)
- [Grafana Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Home Assistant Documentation](https://www.home-assistant.io/docs/)

## License

MIT - Feel free to use and modify for your own setup.
