# Copilot Instructions for Grafana Dashboard Project

## Project Overview

This is a **TypeScript-based Grafana dashboard generation system** that:
- Builds dashboards programmatically using `@grafana/grafana-foundation-sdk`
- Compiles TypeScript dashboard definitions to JSON
- Auto-deploys to Grafana via GitHub Actions + Tailscale secure networking
- Manages Home Assistant metrics (2,708 total) from VictoriaMetrics datasource

## Architecture

```
Datasource (VictoriaMetrics/Prometheus)
    ↓
TypeScript Dashboard Builders (src/dashboards/*.ts)
    ↓
build.ts → compiles to JSON (dist/*.json)
    ↓
GitHub Actions Workflow
    ↓
Tailscale VPN → Upload via ./upload.sh → Grafana API
```

### Key Files
- `src/dashboards/*.ts` - Individual dashboard implementations (Air Quality, Energy, Thermostat, Location Tracking)
- `src/shared/datasource.ts` - VictoriaMetrics datasource config (UID: `df3igl5nh1f5sa`)
- `build.ts` - Build orchestrator (uses `addConnectNullValuesToTimeseries` to bridge 10-minute null gaps)
- `.github/workflows/deploy.yml` - CI/CD pipeline (pnpm 10, Biome 2.3.4, Tailscale auth)
- `upload.sh` - Grafana API deployment script

## Dashboard Pattern (Crucial)

Every dashboard follows this structure:

```typescript
import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";

export function makeThermostatDashboard() {
  const dashboard = new DashboardBuilder("Thermostat Overview")
    .uid("thermostats-overview")
    .tags(["thermostat", "climate", "vic"])
    .refresh("30s")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Row grouping (optional but recommended for organization)
  const row = new RowBuilder("Zone 1: Living Room");
  dashboard.withRow(row);

  // Query (PromQL)
  const tempQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.living_room_temperature_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Temperature");

  // Panel with query
  const panel = new TimeseriesPanelBuilder()
    .title("Temperature")
    .datasource(victoriaMetricsDS)
    .withTarget(tempQuery)
    .gridPos({ x: 0, y: 1, w: 12, h: 8 })
    .unit("celsius");

  dashboard.withPanel(panel);
  return dashboard.build();
}
```

### Essential Patterns

**Metric Naming**: Home Assistant metrics follow `{domain}.{entity_id}_{attribute}`:
- `sensor.bathroom_temperature_value` (domain=sensor, entity_id=bathroom_temperature, attribute=value)
- Domain values: sensor, climate, light, binary_sensor, device_tracker, switch, weather, person, etc.

**Null Value Handling**: `build.ts` auto-adds `connect: { threshold: 600000 }` to ALL timeseries panels (10-minute gap threshold). No manual configuration needed.

**Import Pattern**: Always use named imports from Foundation SDK and import `victoriaMetricsDS` for datasource:
```typescript
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { victoriaMetricsDS } from "../shared/datasource.js";
```

**Units**: Use Grafana standard units (e.g., `celsius`, `percent`, `ppm`, `kwatth`, `watt`, `none`)

## Developer Workflow

```bash
pnpm run build          # Compile TypeScript → dist/*.json (always run this first)
pnpm run fmt            # Format with Biome (100-char line width, 2-space indent)
pnpm run lint           # Lint with Biome
pnpm run deploy         # build + upload.sh (requires .env with GRAFANA_URL, GRAFANA_TOKEN)
```

### Build Output
- **Location**: `dist/` directory
- **Format**: Each file wrapped as `{ dashboard: {...}, overwrite: true }`
- **Validation**: Verify with `jq '.dashboard.panels | length' dist/*.json`

### Git/GitHub Workflow
1. **Local development**: Make changes to `src/dashboards/*.ts`
2. **Validate**: `npm run build && npm run fmt && npm run lint`
3. **Push**: Automatically triggers GitHub Actions
4. **GitHub Actions**:
   - Installs pnpm 10 (respect `pnpm-lock.yaml`)
   - Runs format/lint checks (Biome 2.3.4, schema 2.3.4)
   - Builds dashboards
   - Connects via Tailscale (tag:ci) with OAuth credentials
   - Deploys via `upload.sh`

## Common Gotchas

1. **Import paths**: Always use `.js` extension in ESM imports (`from "../shared/datasource.js"`)
2. **Dashboard UIDs**: Must be unique; use kebab-case (e.g., `air-quality-i_9psl`, `thermostats-overview`)
3. **Panel import aliasing**: Foundation SDK exports `PanelBuilder` for each type; always alias:
   ```typescript
   import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
   ```
4. **Null metrics**: If a metric has gaps, add it to dashboard – `build.ts` handles null connection automatically
5. **Colors**: Use Grafana color names (e.g., `green`, `red`, `orange`); avoid custom colors like `semi-dark-grey`

## Metric Inventory

**Total**: 2,708 metrics across Home Assistant domains

**Key Domains**:
- **sensor** (696): Power, energy, temperature, humidity, battery
- **device_tracker** (1,459): Location, presence, connectivity
- **binary_sensor** (221): Motion, occupancy, contacts
- **climate** (42): HVAC, temp control (bathroom, bedroom, living_room, hot_water)
- **light** (207): 11 entities with brightness, color, effects

**Query reference**: See `AGENTS.md` for metric patterns and `MAINTENANCE.md` for keeping docs updated

## When Adding New Dashboards

1. Create `src/dashboards/my-dashboard.ts` following the pattern above
2. Export a `makeMyDashboard()` function returning `dashboard.build()`
3. Import in `build.ts` and add to `main()` with appropriate panel count
4. Run `npm run build` to validate
5. Update `AGENTS.md` "Current Dashboards" table
6. Commit & push (GitHub Actions handles the rest)

## Maintenance & CI/CD

- **Dependabot**: Automatically creates PRs for npm and GitHub Actions updates (weekly)
- **GitHub Actions**: Runs on push to main + PRs (biome format/lint → build → Tailscale → upload)
- **Tailscale**: OAuth-based secure tunnel (requires `TAILSCALE_OAUTH_CLIENT_ID`, `TAILSCALE_OAUTH_SECRET` secrets)
- **Upload script**: `./upload.sh` handles authentication via `GRAFANA_TOKEN` and `GRAFANA_URL` (from GitHub secrets or .env locally)

## References

- [Grafana Foundation SDK Docs](https://grafana.github.io/grafana-foundation-sdk/next+cog-v0.0.x/typescript/)
- [VictoriaMetrics PromQL](http://192.168.86.213:8428/)
- `AGENTS.md` - Datasource & metric reference
- `MAINTENANCE.md` - Docs update guidelines
- `GITHUB_ACTIONS_SETUP.md` - CI/CD troubleshooting
