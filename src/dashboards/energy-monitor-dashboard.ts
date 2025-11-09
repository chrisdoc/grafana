import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";

export function makeEnergyMonitorDashboard() {
  const dashboard = new DashboardBuilder("Energy Monitor (P1)")
    .uid("energy-monitor-p1")
    .tags(["energy", "p1", "vic"])
    .refresh("30s")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Row 1: Real-time Power
  const rowPower = new RowBuilder("Real-time Power");
  dashboard.withRow(rowPower);

  // Total Active Power Timeseries
  const totalPowerCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const totalPowerPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_active_power_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const totalPowerPanel = new TimeseriesPanelBuilder()
    .title("Total Active Power")
    .datasource(victoriaMetricsDS)
    .withTarget(totalPowerCurrent)
    .withTarget(totalPowerPrev)
    .gridPos({ x: 0, y: 1, w: 18, h: 8 })
    .unit("watt")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(totalPowerPanel);

  // Total Active Power Stat
  const totalPowerStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_value"}')
    .datasource(victoriaMetricsDS);

  const totalPowerStat = new StatPanelBuilder()
    .title("Total Active Power")
    .datasource(victoriaMetricsDS)
    .withTarget(totalPowerStatQuery)
    .gridPos({ x: 18, y: 1, w: 6, h: 8 })
    .unit("watt")
    .graphMode("area");

  dashboard.withPanel(totalPowerStat);

  // Phase 1 Power Timeseries
  const phase1Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_1_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const phase1Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_active_power_phase_1_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const phase1Panel = new TimeseriesPanelBuilder()
    .title("Phase 1 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase1Current)
    .withTarget(phase1Prev)
    .gridPos({ x: 0, y: 9, w: 18, h: 8 })
    .unit("watt")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(phase1Panel);

  // Phase 1 Power Stat
  const phase1StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_1_value"}')
    .datasource(victoriaMetricsDS);

  const phase1Stat = new StatPanelBuilder()
    .title("Phase 1 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase1StatQuery)
    .gridPos({ x: 18, y: 9, w: 6, h: 8 })
    .unit("watt")
    .graphMode("area");

  dashboard.withPanel(phase1Stat);

  // Phase 2 Power Timeseries
  const phase2Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_2_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const phase2Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_active_power_phase_2_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const phase2Panel = new TimeseriesPanelBuilder()
    .title("Phase 2 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase2Current)
    .withTarget(phase2Prev)
    .gridPos({ x: 0, y: 17, w: 18, h: 8 })
    .unit("watt")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(phase2Panel);

  // Phase 2 Power Stat
  const phase2StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_2_value"}')
    .datasource(victoriaMetricsDS);

  const phase2Stat = new StatPanelBuilder()
    .title("Phase 2 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase2StatQuery)
    .gridPos({ x: 18, y: 17, w: 6, h: 8 })
    .unit("watt")
    .graphMode("area");

  dashboard.withPanel(phase2Stat);

  // Phase 3 Power Timeseries
  const phase3Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_3_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const phase3Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_active_power_phase_3_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const phase3Panel = new TimeseriesPanelBuilder()
    .title("Phase 3 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase3Current)
    .withTarget(phase3Prev)
    .gridPos({ x: 0, y: 25, w: 18, h: 8 })
    .unit("watt")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(phase3Panel);

  // Phase 3 Power Stat
  const phase3StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_active_power_phase_3_value"}')
    .datasource(victoriaMetricsDS);

  const phase3Stat = new StatPanelBuilder()
    .title("Phase 3 Power")
    .datasource(victoriaMetricsDS)
    .withTarget(phase3StatQuery)
    .gridPos({ x: 18, y: 25, w: 6, h: 8 })
    .unit("watt")
    .graphMode("area");

  dashboard.withPanel(phase3Stat);

  // Current Timeseries
  const currentCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_current_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const currentPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_current_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const currentPanel = new TimeseriesPanelBuilder()
    .title("Current")
    .datasource(victoriaMetricsDS)
    .withTarget(currentCurrent)
    .withTarget(currentPrev)
    .gridPos({ x: 0, y: 33, w: 18, h: 8 })
    .unit("amp")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(currentPanel);

  // Current Stat
  const currentStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_current_value"}')
    .datasource(victoriaMetricsDS);

  const currentStat = new StatPanelBuilder()
    .title("Current")
    .datasource(victoriaMetricsDS)
    .withTarget(currentStatQuery)
    .gridPos({ x: 18, y: 33, w: 6, h: 8 })
    .unit("amp")
    .graphMode("area");

  dashboard.withPanel(currentStat);

  // Row 2: Energy Consumption
  const rowEnergy = new RowBuilder("Energy Consumption");
  dashboard.withRow(rowEnergy);

  // Total Energy Import Timeseries
  const energyImportCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const energyImportPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_energy_import_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const energyImportPanel = new TimeseriesPanelBuilder()
    .title("Total Energy Import")
    .datasource(victoriaMetricsDS)
    .withTarget(energyImportCurrent)
    .withTarget(energyImportPrev)
    .gridPos({ x: 0, y: 42, w: 18, h: 8 })
    .unit("kwatth")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(energyImportPanel);

  // Total Energy Import Stat
  const energyImportStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_value"}')
    .datasource(victoriaMetricsDS);

  const energyImportStat = new StatPanelBuilder()
    .title("Total Energy Import")
    .datasource(victoriaMetricsDS)
    .withTarget(energyImportStatQuery)
    .gridPos({ x: 18, y: 42, w: 6, h: 8 })
    .unit("kwatth")
    .graphMode("area");

  dashboard.withPanel(energyImportStat);

  // Energy Import Tariff 1 Timeseries
  const tariff1Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_1_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const tariff1Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_1_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const tariff1Panel = new TimeseriesPanelBuilder()
    .title("Energy Import Tariff 1")
    .datasource(victoriaMetricsDS)
    .withTarget(tariff1Current)
    .withTarget(tariff1Prev)
    .gridPos({ x: 0, y: 50, w: 18, h: 8 })
    .unit("kwatth")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(tariff1Panel);

  // Energy Import Tariff 1 Stat
  const tariff1StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_1_value"}')
    .datasource(victoriaMetricsDS);

  const tariff1Stat = new StatPanelBuilder()
    .title("Energy Import Tariff 1")
    .datasource(victoriaMetricsDS)
    .withTarget(tariff1StatQuery)
    .gridPos({ x: 18, y: 50, w: 6, h: 8 })
    .unit("kwatth")
    .graphMode("area");

  dashboard.withPanel(tariff1Stat);

  // Energy Import Tariff 2 Timeseries
  const tariff2Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_2_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const tariff2Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_2_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const tariff2Panel = new TimeseriesPanelBuilder()
    .title("Energy Import Tariff 2")
    .datasource(victoriaMetricsDS)
    .withTarget(tariff2Current)
    .withTarget(tariff2Prev)
    .gridPos({ x: 0, y: 58, w: 18, h: 8 })
    .unit("kwatth")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(tariff2Panel);

  // Energy Import Tariff 2 Stat
  const tariff2StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_tariff_2_value"}')
    .datasource(victoriaMetricsDS);

  const tariff2Stat = new StatPanelBuilder()
    .title("Energy Import Tariff 2")
    .datasource(victoriaMetricsDS)
    .withTarget(tariff2StatQuery)
    .gridPos({ x: 18, y: 58, w: 6, h: 8 })
    .unit("kwatth")
    .graphMode("area");

  dashboard.withPanel(tariff2Stat);

  // Active Tariff Stat (special case - has mappings)
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
  const rowGas = new RowBuilder("Gas Consumption");
  dashboard.withRow(rowGas);

  // Total Gas Timeseries
  const gasCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_gas_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const gasPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_gas_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const gasPanel = new TimeseriesPanelBuilder()
    .title("Total Gas")
    .datasource(victoriaMetricsDS)
    .withTarget(gasCurrent)
    .withTarget(gasPrev)
    .gridPos({ x: 0, y: 75, w: 18, h: 8 })
    .unit("m3")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(gasPanel);

  // Total Gas Stat
  const gasStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_gas_value"}')
    .datasource(victoriaMetricsDS);

  const gasStat = new StatPanelBuilder()
    .title("Total Gas")
    .datasource(victoriaMetricsDS)
    .withTarget(gasStatQuery)
    .gridPos({ x: 18, y: 75, w: 6, h: 8 })
    .unit("m3")
    .graphMode("area");

  dashboard.withPanel(gasStat);

  // Row 4: Costs
  const rowCosts = new RowBuilder("Costs");
  dashboard.withRow(rowCosts);

  // Total Energy Cost Timeseries
  const energyCostCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_cost_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const energyCostPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_energy_import_cost_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const energyCostPanel = new TimeseriesPanelBuilder()
    .title("Total Energy Cost")
    .datasource(victoriaMetricsDS)
    .withTarget(energyCostCurrent)
    .withTarget(energyCostPrev)
    .gridPos({ x: 0, y: 84, w: 18, h: 8 })
    .unit("currencyEUR")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(energyCostPanel);

  // Total Energy Cost Stat
  const energyCostStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_energy_import_cost_value"}')
    .datasource(victoriaMetricsDS);

  const energyCostStat = new StatPanelBuilder()
    .title("Total Energy Cost")
    .datasource(victoriaMetricsDS)
    .withTarget(energyCostStatQuery)
    .gridPos({ x: 18, y: 84, w: 6, h: 8 })
    .unit("currencyEUR")
    .graphMode("area");

  dashboard.withPanel(energyCostStat);

  // Total Gas Cost Timeseries
  const gasCostCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_gas_cost_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const gasCostPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.p1_meter_total_gas_cost_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const gasCostPanel = new TimeseriesPanelBuilder()
    .title("Total Gas Cost")
    .datasource(victoriaMetricsDS)
    .withTarget(gasCostCurrent)
    .withTarget(gasCostPrev)
    .gridPos({ x: 0, y: 92, w: 18, h: 8 })
    .unit("currencyEUR")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(gasCostPanel);

  // Total Gas Cost Stat
  const gasCostStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.p1_meter_total_gas_cost_value"}')
    .datasource(victoriaMetricsDS);

  const gasCostStat = new StatPanelBuilder()
    .title("Total Gas Cost")
    .datasource(victoriaMetricsDS)
    .withTarget(gasCostStatQuery)
    .gridPos({ x: 18, y: 92, w: 6, h: 8 })
    .unit("currencyEUR")
    .graphMode("area");

  dashboard.withPanel(gasCostStat);

  // Row 5: Power Quality
  const rowQuality = new RowBuilder("Power Quality");
  dashboard.withRow(rowQuality);

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
