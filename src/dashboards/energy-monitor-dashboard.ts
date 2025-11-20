import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";
import { createMetricPanels } from "../shared/panel-builder.js";

export function makeEnergyMonitorDashboard() {
  const dashboard = new DashboardBuilder("Energy Monitor (P1)")
    .uid("energy-monitor-p1")
    .tags(["energy", "p1", "vic"])
    .refresh("30s")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Row 1: Real-time Power
  dashboard.withRow(new RowBuilder("Real-time Power"));

  for (const panel of createMetricPanels({
    title: "Total Active Power",
    metric: "sensor.p1_meter_active_power_value",
    unit: "watt",
    yOffset: 1,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Phase 1 Power",
    metric: "sensor.p1_meter_active_power_phase_1_value",
    unit: "watt",
    yOffset: 9,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Phase 2 Power",
    metric: "sensor.p1_meter_active_power_phase_2_value",
    unit: "watt",
    yOffset: 17,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Phase 3 Power",
    metric: "sensor.p1_meter_active_power_phase_3_value",
    unit: "watt",
    yOffset: 25,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Current",
    metric: "sensor.p1_meter_current_value",
    unit: "ampere",
    statUnit: "amp",
    yOffset: 33,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 2: Energy Consumption
  dashboard.withRow(new RowBuilder("Energy Consumption"));

  for (const panel of createMetricPanels({
    title: "Total Energy Import",
    metric: "sensor.p1_meter_total_energy_import_value",
    unit: "kwatth",
    yOffset: 41,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Energy Import Tariff 1",
    metric: "sensor.p1_meter_total_energy_import_tariff_1_value",
    unit: "kwatth",
    yOffset: 49,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Energy Import Tariff 2",
    metric: "sensor.p1_meter_total_energy_import_tariff_2_value",
    unit: "kwatth",
    yOffset: 57,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Active Tariff Stat
  const activeTariffQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_tariff_value"}')
    .datasource(victoriaMetricsDS);

  const activeTariffStat = new StatPanelBuilder()
    .title("Active Tariff")
    .datasource(victoriaMetricsDS)
    .withTarget(activeTariffQuery)
    .gridPos({ x: 0, y: 66, w: 6, h: 8 })
    .unit("none")
    .graphMode("none");

  dashboard.withPanel(activeTariffStat);

  // Row 3: Gas Consumption
  dashboard.withRow(new RowBuilder("Gas Consumption"));

  for (const panel of createMetricPanels({
    title: "Total Gas",
    metric: "sensor.p1_meter_total_gas_value",
    unit: "m3",
    yOffset: 75,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 4: Costs
  dashboard.withRow(new RowBuilder("Costs"));

  for (const panel of createMetricPanels({
    title: "Total Energy Cost",
    metric: "sensor.p1_meter_total_energy_import_cost_value",
    unit: "euro",
    statUnit: "currencyEUR",
    yOffset: 83,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Total Gas Cost",
    metric: "sensor.p1_meter_total_gas_cost_value",
    unit: "euro",
    statUnit: "currencyEUR",
    yOffset: 91,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 5: Power Quality
  dashboard.withRow(new RowBuilder("Power Quality"));

  // Voltage Sags L1 Stat
  const sagL1Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_sags_detected_phase_1_value"}')
    .datasource(victoriaMetricsDS);

  const sagL1Stat = new StatPanelBuilder()
    .title("Voltage Sags L1")
    .datasource(victoriaMetricsDS)
    .withTarget(sagL1Query)
    .gridPos({ x: 0, y: 101, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(sagL1Stat);

  // Voltage Sags L2 Stat
  const sagL2Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_sags_detected_phase_2_value"}')
    .datasource(victoriaMetricsDS);

  const sagL2Stat = new StatPanelBuilder()
    .title("Voltage Sags L2")
    .datasource(victoriaMetricsDS)
    .withTarget(sagL2Query)
    .gridPos({ x: 6, y: 101, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(sagL2Stat);

  // Voltage Sags L3 Stat
  const sagL3Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_sags_detected_phase_3_value"}')
    .datasource(victoriaMetricsDS);

  const sagL3Stat = new StatPanelBuilder()
    .title("Voltage Sags L3")
    .datasource(victoriaMetricsDS)
    .withTarget(sagL3Query)
    .gridPos({ x: 12, y: 101, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(sagL3Stat);

  // Power Failures Stat
  const powerFailuresQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_power_failures_detected_value"}')
    .datasource(victoriaMetricsDS);

  const powerFailuresStat = new StatPanelBuilder()
    .title("Power Failures")
    .datasource(victoriaMetricsDS)
    .withTarget(powerFailuresQuery)
    .gridPos({ x: 18, y: 101, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(powerFailuresStat);

  // Voltage Swells L1 Stat
  const swellL1Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_swells_detected_phase_1_value"}')
    .datasource(victoriaMetricsDS);

  const swellL1Stat = new StatPanelBuilder()
    .title("Voltage Swells L1")
    .datasource(victoriaMetricsDS)
    .withTarget(swellL1Query)
    .gridPos({ x: 0, y: 109, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(swellL1Stat);

  // Voltage Swells L2 Stat
  const swellL2Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_swells_detected_phase_2_value"}')
    .datasource(victoriaMetricsDS);

  const swellL2Stat = new StatPanelBuilder()
    .title("Voltage Swells L2")
    .datasource(victoriaMetricsDS)
    .withTarget(swellL2Query)
    .gridPos({ x: 6, y: 109, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(swellL2Stat);

  // Voltage Swells L3 Stat
  const swellL3Query = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_voltage_swells_detected_phase_3_value"}')
    .datasource(victoriaMetricsDS);

  const swellL3Stat = new StatPanelBuilder()
    .title("Voltage Swells L3")
    .datasource(victoriaMetricsDS)
    .withTarget(swellL3Query)
    .gridPos({ x: 12, y: 109, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(swellL3Stat);

  // Long Power Failures Stat
  const longFailuresQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_long_power_failures_detected_value"}')
    .datasource(victoriaMetricsDS);

  const longFailuresStat = new StatPanelBuilder()
    .title("Long Power Failures")
    .datasource(victoriaMetricsDS)
    .withTarget(longFailuresQuery)
    .gridPos({ x: 18, y: 109, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(longFailuresStat);

  return dashboard.build();
}
