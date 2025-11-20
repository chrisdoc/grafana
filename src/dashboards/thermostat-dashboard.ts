import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { VisibilityMode, BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { victoriaMetricsDS } from "../shared/datasource.js";

interface ThermostatConfig {
  name: string;
  id: string;
  yOffset: number;
}

function createThermostatRow(dashboard: DashboardBuilder, config: ThermostatConfig) {
  const { name, id, yOffset } = config;

  // Row
  const row = new RowBuilder(name);
  dashboard.withRow(row);

  // Current Temperature
  const currentTempQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_current_temperature"}`)
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const currentTempPanel = new TimeseriesPanelBuilder()
    .title(`${name} - Current Temperature`)
    .datasource(victoriaMetricsDS)
    .withTarget(currentTempQuery)
    .gridPos({ x: 0, y: yOffset + 1, w: 12, h: 8 })
    .unit("celsius")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(600000);

  dashboard.withPanel(currentTempPanel);

  // Target Temperature Stat
  const targetTempQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_temperature"}`)
    .datasource(victoriaMetricsDS);

  const targetTempStat = new StatPanelBuilder()
    .title(`${name} - Target Temperature`)
    .datasource(victoriaMetricsDS)
    .withTarget(targetTempQuery)
    .gridPos({ x: 12, y: yOffset + 1, w: 6, h: 8 })
    .unit("celsius")
    .graphMode(BigValueGraphMode.None);

  dashboard.withPanel(targetTempStat);

  // HVAC Action Stat
  const hvacActionQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_hvac_action_str"}`)
    .datasource(victoriaMetricsDS);

  const hvacActionStat = new StatPanelBuilder()
    .title(`${name} - HVAC Action`)
    .datasource(victoriaMetricsDS)
    .withTarget(hvacActionQuery)
    .gridPos({ x: 18, y: yOffset + 1, w: 6, h: 8 })
    .graphMode(BigValueGraphMode.None);

  dashboard.withPanel(hvacActionStat);

  // Current Humidity
  const humidityQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_current_humidity"}`)
    .datasource(victoriaMetricsDS)
    .legendFormat("Humidity");

  const humidityPanel = new TimeseriesPanelBuilder()
    .title(`${name} - Humidity`)
    .datasource(victoriaMetricsDS)
    .withTarget(humidityQuery)
    .gridPos({ x: 0, y: yOffset + 9, w: 12, h: 8 })
    .unit("percent")
    .min(0)
    .max(100)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never);

  dashboard.withPanel(humidityPanel);

  // Preset Mode Stat
  const presetModeQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_preset_mode_str"}`)
    .datasource(victoriaMetricsDS);

  const presetModeStat = new StatPanelBuilder()
    .title(`${name} - Preset Mode`)
    .datasource(victoriaMetricsDS)
    .withTarget(presetModeQuery)
    .gridPos({ x: 12, y: yOffset + 9, w: 6, h: 8 })
    .graphMode(BigValueGraphMode.None);

  dashboard.withPanel(presetModeStat);

  // Thermostat State Stat
  const stateQuery = new DataqueryBuilder()
    .refId("A")
    .expr(`{__name__="climate.${id}_state"}`)
    .datasource(victoriaMetricsDS);

  const stateStat = new StatPanelBuilder()
    .title(`${name} - State`)
    .datasource(victoriaMetricsDS)
    .withTarget(stateQuery)
    .gridPos({ x: 18, y: yOffset + 9, w: 6, h: 8 })
    .graphMode(BigValueGraphMode.None);

  dashboard.withPanel(stateStat);
}

export function makeThermostatDashboard() {
  const dashboard = new DashboardBuilder("Thermostats")
    .uid("thermostats-overview")
    .tags(["thermostats", "climate", "vic"])
    .refresh("1m")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Create rows for each thermostat
  const thermostats: ThermostatConfig[] = [
    { name: "Bathroom", id: "bathroom", yOffset: 0 },
    { name: "Bedroom", id: "bedroom", yOffset: 18 },
    { name: "Living Room", id: "living_room", yOffset: 36 },
  ];

  for (const thermostat of thermostats) {
    createThermostatRow(dashboard, thermostat);
  }

  return dashboard.build();
}
