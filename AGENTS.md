# Copilot Instructions for Grafana Dashboard Project

## Project Overview

This is a **TypeScript-based Grafana dashboard generation system** that:
- Builds dashboards programmatically using `@grafana/grafana-foundation-sdk`
- Compiles TypeScript dashboard definitions to JSON
- Auto-deploys to Grafana via GitHub Actions + Tailscale secure networking
- Manages Home Assistant metrics (2,708 total) from VictoriaMetrics datasource

## Tech Stack

- **Language**: TypeScript 5.9
- **Runtime**: Node.js (>=18.17)
- **Package Manager**: pnpm 10
- **SDK**: Grafana Foundation SDK
- **Linter/Formatter**: Biome 2.3
- **Build**: tsx
- **CI/CD**: GitHub Actions
- **Infrastructure**: Tailscale

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

  // Panel with query make sure that null values are connected
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

## Current Dashboards & Deployment (Project Policy)

| Dashboard | UID | Panel count |
| --- | --- | ---: |
| Air Quality (i_9psl) | `air-quality-i_9psl` | 26 |
| Energy Monitor (P1) | `energy-monitor-p1` | 36 |
| Thermostats | `thermostats-overview` | 21 |
| Location Tracking | `location-tracking` | 13 |
| OpenWrt Router | `openwrt-router` | 28 |
| Proxmox | `proxmox` | 36 |
| VictoriaMetrics | `victoriametrics` | 15 |
| Hermes MCP | `hermes-mcp-observability` | 15 |
| Hevy MCP observability | `hevy-mcp-tempo-vm-90d` | 22 |

- Inventory: Keep `AGENTS.md` updated with a short inventory of dashboards (name, uid, panel count). Add new dashboards immediately after creating them.
- Deployment: After making changes to any dashboard, always run a build and deploy the JSON to Grafana (e.g., `pnpm run deploy` or push to main to trigger CI/CD). Do not leave dashboard changes un-deployed.
- Responsibility: The author of a dashboard change is responsible for updating the inventory and ensuring deployment succeeds; failures must be triaged and fixed before merging.

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

## Issue Tracking with bd (beads)

**IMPORTANT**: This project uses **bd (beads)** for ALL issue tracking. Do NOT use markdown TODOs, task lists, or other tracking methods.

### Why bd?

- Dependency-aware: Track blockers and relationships between issues
- Git-friendly: Auto-syncs to JSONL for version control
- Agent-optimized: JSON output, ready work detection, discovered-from links
- Prevents duplicate tracking systems and confusion

### Quick Start

**Check for ready work:**
```bash
bd ready --json
```

**Create new issues:**
```bash
bd create "Issue title" -t bug|feature|task -p 0-4 --json
bd create "Issue title" -p 1 --deps discovered-from:bd-123 --json
```

**Claim and update:**
```bash
bd update bd-42 --status in_progress --json
bd update bd-42 --priority 1 --json
```

**Complete work:**
```bash
bd close bd-42 --reason "Completed" --json
```

### Issue Types

- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

### Priorities

- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Workflow for AI Agents

1. **Check ready work**: `bd ready` shows unblocked issues
2. **Claim your task**: `bd update <id> --status in_progress`
3. **Work on it**: Implement, test, document
4. **Discover new work?** Create linked issue:
   - `bd create "Found bug" -p 1 --deps discovered-from:<parent-id>`
5. **Complete**: `bd close <id> --reason "Done"`
6. **Commit together**: Always commit the `.beads/issues.jsonl` file together with the code changes so issue state stays in sync with code state

### Auto-Sync

bd automatically syncs with git:
- Exports to `.beads/issues.jsonl` after changes (5s debounce)
- Imports from JSONL when newer (e.g., after `git pull`)
- No manual export/import needed!

### MCP Server (Recommended)

If using Claude or MCP-compatible clients, install the beads MCP server:

```bash
pip install beads-mcp
```

Add to MCP config (e.g., `~/.config/claude/config.json`):
```json
{
  "beads": {
    "command": "beads-mcp",
    "args": []
  }
}
```

Then use `mcp__beads__*` functions instead of CLI commands.

### Managing AI-Generated Planning Documents

AI assistants often create planning and design documents during development:
- PLAN.md, IMPLEMENTATION.md, ARCHITECTURE.md
- DESIGN.md, CODEBASE_SUMMARY.md, INTEGRATION_PLAN.md
- TESTING_GUIDE.md, TECHNICAL_DESIGN.md, and similar files

**Best Practice: Use a dedicated directory for these ephemeral files**

**Recommended approach:**
- Create a `history/` directory in the project root
- Store ALL AI-generated planning/design docs in `history/`
- Keep the repository root clean and focused on permanent project files
- Only access `history/` when explicitly asked to review past planning

**Example .gitignore entry (optional):**
```
# AI planning documents (ephemeral)
history/
```

**Benefits:**
- ✅ Clean repository root
- ✅ Clear separation between ephemeral and permanent documentation
- ✅ Easy to exclude from version control if desired
- ✅ Preserves planning history for archeological research
- ✅ Reduces noise when browsing the project

### Important Rules

- ✅ Use bd for ALL task tracking
- ✅ Always use `--json` flag for programmatic use
- ✅ Link discovered work with `discovered-from` dependencies
- ✅ Check `bd ready` before asking "what should I work on?"
- ✅ Store AI planning docs in `history/` directory
- ❌ Do NOT create markdown TODO lists
- ❌ Do NOT use external issue trackers
- ❌ Do NOT duplicate tracking systems
- ❌ Do NOT clutter repo root with planning documents

For more details, see README.md and QUICKSTART.md.
