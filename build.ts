import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeAirQualityDashboard } from "./src/dashboards/air-quality-dashboard.js";
import { makeEnergyMonitorDashboard } from "./src/dashboards/energy-monitor-dashboard.js";
import { makeThermostatDashboard } from "./src/dashboards/thermostat-dashboard.js";
import { makeLocationTrackingDashboard } from "./src/dashboards/location-tracking-dashboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function ensureDir(p: string) {
  try {
    mkdirSync(p, { recursive: true });
  } catch {}
}

function wrapDashboard(model: unknown) {
  return { dashboard: model, overwrite: true };
}

/**
 * Add connect configuration to all timeseries panels to bridge null values
 * when they are less than 10 minutes apart
 */
function addConnectNullValuesToTimeseries(dashboard: Record<string, unknown>) {
  const typedDashboard = dashboard as {
    panels?: Array<{
      type: string;
      fieldConfig?: {
        defaults?: {
          custom?: {
            spanNulls?: number | boolean;
          };
        };
      };
    }>;
  };

  if (!typedDashboard.panels) return;

  for (const panel of typedDashboard.panels) {
    if (panel.type === "timeseries") {
      // Initialize fieldConfig structure if not present
      if (!panel.fieldConfig) panel.fieldConfig = {};
      if (!panel.fieldConfig.defaults) panel.fieldConfig.defaults = {};
      if (!panel.fieldConfig.defaults.custom) panel.fieldConfig.defaults.custom = {};

      // Add spanNulls configuration (10 minutes in milliseconds)
      panel.fieldConfig.defaults.custom.spanNulls = 600000;
    }
  }
}

function writeDashboard(fileName: string, model: unknown) {
  const outDir = resolve(__dirname, "dist");
  ensureDir(outDir);
  const outPath = resolve(outDir, fileName);

  // Add connect null values configuration
  if (typeof model === "object" && model !== null) {
    addConnectNullValuesToTimeseries(model as Record<string, unknown>);
  }

  const payload = wrapDashboard(model);
  writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log("Wrote", outPath);
}

async function main() {
  console.log("Building Grafana dashboards from TypeScript...");

  console.log("  - Generating Air Quality dashboard (26 panels)...");
  writeDashboard("air-quality-dashboard.json", makeAirQualityDashboard());

  console.log("  - Generating Energy Monitor dashboard (36 panels)...");
  writeDashboard("energy-monitor-dashboard.json", makeEnergyMonitorDashboard());

  console.log("  - Generating Thermostat dashboard (18 panels)...");
  writeDashboard("thermostat-dashboard.json", makeThermostatDashboard());

  console.log("  - Generating Location Tracking dashboard (10 panels)...");
  writeDashboard("location-tracking-dashboard.json", makeLocationTrackingDashboard());

  console.log("\n✓ Done! Generated 4 dashboards with 90 panels total.");
  console.log("  - All timeseries panels configured to connect null values < 10 minutes apart");
  console.log("\nOutput:");
  console.log("  - dist/air-quality-dashboard.json");
  console.log("  - dist/energy-monitor-dashboard.json");
  console.log("  - dist/thermostat-dashboard.json");
  console.log("  - dist/location-tracking-dashboard.json");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
