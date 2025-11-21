import { type DashboardBuilder, RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { createStatPanel, createTimeseriesPanel } from "../shared/panel-builder.js";
import { createDashboard } from "../shared/dashboard-factory.js";

// --- Configuration & Types ---

interface ThermostatConfig {
  name: string;
  id: string;
}

const THERMOSTATS: ThermostatConfig[] = [
  { name: "Bathroom", id: "bathroom" },
  { name: "Bedroom", id: "bedroom" },
  { name: "Living Room", id: "living_room" },
];

// --- Helper Functions ---

function createThermostatRow(
  dashboard: DashboardBuilder,
  config: ThermostatConfig,
  yOffset: number
) {
  const { name, id } = config;

  // Row
  const row = new RowBuilder(name);
  dashboard.withRow(row);

  // Current Temperature
  dashboard.withPanel(
    createTimeseriesPanel({
      title: `${name} - Current Temperature`,
      metric: `climate.${id}_current_temperature`,
      unit: "celsius",
      y: yOffset + 1,
      w: 18,
      h: 8,
      includeOverlay: false,
    })
  );

  // Target Temperature Stat
  dashboard.withPanel(
    createStatPanel({
      title: `${name} - Target Temperature`,
      metric: `climate.${id}_temperature`,
      unit: "celsius",
      x: 12,
      y: yOffset + 1,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  // HVAC Action Stat
  dashboard.withPanel(
    createStatPanel({
      title: `${name} - HVAC Action`,
      metric: `climate.${id}_hvac_action_str`,
      unit: "none",
      x: 18,
      y: yOffset + 1,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  // Current Humidity
  dashboard.withPanel(
    createTimeseriesPanel({
      title: `${name} - Humidity`,
      metric: `climate.${id}_current_humidity`,
      unit: "percent",
      y: yOffset + 9,
      w: 18,
      h: 8,
      min: 0,
      max: 100,
      includeOverlay: false,
    })
  );

  // Preset Mode Stat
  dashboard.withPanel(
    createStatPanel({
      title: `${name} - Preset Mode`,
      metric: `climate.${id}_preset_mode_str`,
      unit: "none",
      x: 12,
      y: yOffset + 9,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  // Thermostat State Stat
  dashboard.withPanel(
    createStatPanel({
      title: `${name} - State`,
      metric: `climate.${id}_state`,
      unit: "none",
      x: 18,
      y: yOffset + 9,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );
}

// --- Dashboard Generator ---

export function makeThermostatDashboard() {
  const dashboard = createDashboard({
    title: "Thermostats",
    uid: "thermostats-overview",
    tags: ["thermostats", "climate"],
    refresh: "1m",
  });

  let currentY = 0;

  for (const thermostat of THERMOSTATS) {
    createThermostatRow(dashboard, thermostat, currentY);
    currentY += 18; // 1 (row) + 8 (temp) + 8 (humidity) + 1 (spacing)
  }

  return dashboard.build();
}
