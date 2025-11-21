import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { createMetricPanels, createStatPanel } from "../shared/panel-builder.js";
import { createDashboard } from "../shared/dashboard-factory.js";

// --- Configuration & Types ---

interface PanelDef {
  title: string;
  metric: string;
  unit: string;
  statUnit?: string;
  min?: number;
}

interface RowDef {
  title: string;
  panels: PanelDef[];
}

const STANDARD_ROWS: RowDef[] = [
  {
    title: "Real-time Power",
    panels: [
      {
        title: "Total Active Power",
        metric: "sensor.p1_meter_active_power_value",
        unit: "watt",
        min: 0,
      },
      {
        title: "Phase 1 Power",
        metric: "sensor.p1_meter_active_power_phase_1_value",
        unit: "watt",
        min: 0,
      },
      {
        title: "Phase 2 Power",
        metric: "sensor.p1_meter_active_power_phase_2_value",
        unit: "watt",
        min: 0,
      },
      {
        title: "Phase 3 Power",
        metric: "sensor.p1_meter_active_power_phase_3_value",
        unit: "watt",
        min: 0,
      },
      {
        title: "Current",
        metric: "sensor.p1_meter_current_value",
        unit: "ampere",
        statUnit: "amp",
        min: 0,
      },
    ],
  },
  {
    title: "Energy Consumption",
    panels: [
      {
        title: "Total Energy Import",
        metric: "sensor.p1_meter_total_energy_import_value",
        unit: "kwatth",
        min: 0,
      },
      {
        title: "Energy Import Tariff 1",
        metric: "sensor.p1_meter_total_energy_import_tariff_1_value",
        unit: "kwatth",
        min: 0,
      },
      {
        title: "Energy Import Tariff 2",
        metric: "sensor.p1_meter_total_energy_import_tariff_2_value",
        unit: "kwatth",
        min: 0,
      },
    ],
  },
  {
    title: "Gas Consumption",
    panels: [{ title: "Total Gas", metric: "sensor.p1_meter_total_gas_value", unit: "m3", min: 0 }],
  },
  {
    title: "Costs",
    panels: [
      {
        title: "Total Energy Cost",
        metric: "sensor.p1_meter_total_energy_import_cost_value",
        unit: "euro",
        statUnit: "currencyEUR",
        min: 0,
      },
      {
        title: "Total Gas Cost",
        metric: "sensor.p1_meter_total_gas_cost_value",
        unit: "euro",
        statUnit: "currencyEUR",
        min: 0,
      },
    ],
  },
];

// --- Dashboard Generator ---

export function makeEnergyMonitorDashboard() {
  const dashboard = createDashboard({
    title: "Energy Monitor (P1)",
    uid: "energy-monitor-p1",
    tags: ["energy", "p1"],
  });

  let currentY = 0;

  // 1. Standard Metric Rows
  for (const row of STANDARD_ROWS) {
    dashboard.withRow(new RowBuilder(row.title));
    currentY++;

    for (const p of row.panels) {
      const panelConfig = {
        title: p.title,
        metric: p.metric,
        unit: p.unit,
        statUnit: p.statUnit,
        yOffset: currentY,
        ...(p.min !== undefined && { min: p.min }),
      };

      for (const panel of createMetricPanels(panelConfig)) {
        dashboard.withPanel(panel);
      }
      currentY += 8;
    }

    // Special case: Insert Active Tariff after Energy Consumption row
    if (row.title === "Energy Consumption") {
      dashboard.withPanel(
        createStatPanel({
          title: "Active Tariff",
          metric: "sensor.p1_meter_active_tariff_value",
          unit: "none",
          x: 0,
          y: currentY,
          w: 6,
          h: 8,
          graphMode: BigValueGraphMode.None,
        })
      );
      currentY += 8;
    }
  }

  // 2. Power Quality Row (Custom Grid Layout)
  dashboard.withRow(new RowBuilder("Power Quality"));
  currentY++;

  const powerQualityMetrics = [
    // Row 1 of stats
    [
      { title: "Voltage Sags L1", metric: "sensor.p1_meter_voltage_sags_detected_phase_1_value" },
      { title: "Voltage Sags L2", metric: "sensor.p1_meter_voltage_sags_detected_phase_2_value" },
      { title: "Voltage Sags L3", metric: "sensor.p1_meter_voltage_sags_detected_phase_3_value" },
      { title: "Power Failures", metric: "sensor.p1_meter_power_failures_detected_value" },
    ],
    // Row 2 of stats
    [
      {
        title: "Voltage Swells L1",
        metric: "sensor.p1_meter_voltage_swells_detected_phase_1_value",
      },
      {
        title: "Voltage Swells L2",
        metric: "sensor.p1_meter_voltage_swells_detected_phase_2_value",
      },
      {
        title: "Voltage Swells L3",
        metric: "sensor.p1_meter_voltage_swells_detected_phase_3_value",
      },
      {
        title: "Long Power Failures",
        metric: "sensor.p1_meter_long_power_failures_detected_value",
      },
    ],
  ];

  for (const rowMetrics of powerQualityMetrics) {
    rowMetrics.forEach((item, index) => {
      dashboard.withPanel(
        createStatPanel({
          title: item.title,
          metric: item.metric,
          unit: "none",
          x: index * 6,
          y: currentY,
          w: 6,
          h: 8,
          graphMode: BigValueGraphMode.Area,
        })
      );
    });
    currentY += 8;
  }

  return dashboard.build();
}
