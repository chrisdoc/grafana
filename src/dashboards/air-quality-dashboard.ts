import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { createMetricPanels } from "../shared/panel-builder.js";
import { createDashboard } from "../shared/dashboard-factory.js";

// --- Configuration & Types ---

const METRIC_PREFIX = "sensor.i_9psl_";

interface PanelDef {
  title: string;
  metricSuffix: string;
  unit: string;
  min?: number;
  max?: number;
}

interface RowDef {
  title: string;
  panels: PanelDef[];
}

const DASHBOARD_ROWS: RowDef[] = [
  {
    title: "Particulate Matter",
    panels: [
      { title: "PM0.3", metricSuffix: "pm0_3_value", unit: "conμgm3", min: 0 },
      { title: "PM1", metricSuffix: "pm1_value", unit: "conμgm3", min: 0 },
      { title: "PM2.5", metricSuffix: "pm2_5_value", unit: "conμgm3", min: 0 },
      { title: "PM10", metricSuffix: "pm10_value", unit: "conμgm3", min: 0 },
    ],
  },
  {
    title: "Air Quality Indices",
    panels: [
      { title: "VOC Index", metricSuffix: "voc_index_value", unit: "none", min: 0 },
      { title: "NOx Index", metricSuffix: "nox_index_value", unit: "none", min: 0 },
      { title: "Raw VOC", metricSuffix: "raw_voc_value", unit: "none", min: 0 },
      { title: "Raw NOx", metricSuffix: "raw_nox_value", unit: "none", min: 0 },
    ],
  },
  {
    title: "Gases",
    panels: [{ title: "CO₂", metricSuffix: "carbon_dioxide_value", unit: "ppm", min: 0 }],
  },
  {
    title: "Climate",
    panels: [
      { title: "Temperature", metricSuffix: "temperature_value", unit: "celsius" },
      { title: "Humidity", metricSuffix: "humidity_value", unit: "percent", min: 0, max: 100 },
    ],
  },
];

// --- Dashboard Generator ---

export function makeAirQualityDashboard() {
  const dashboard = createDashboard({
    title: "Air Quality (i_9psl)",
    uid: "air-quality-i_9psl",
    tags: ["air-quality", "i_9psl"],
  });

  let currentY = 0;

  for (const row of DASHBOARD_ROWS) {
    dashboard.withRow(new RowBuilder(row.title));
    currentY++; // Rows typically take 1 unit of height

    for (const p of row.panels) {
      const panelConfig = {
        title: p.title,
        metric: `${METRIC_PREFIX}${p.metricSuffix}`,
        unit: p.unit,
        yOffset: currentY,
        ...(p.min !== undefined && { min: p.min }),
        ...(p.max !== undefined && { max: p.max }),
      };

      for (const panel of createMetricPanels(panelConfig)) {
        dashboard.withPanel(panel);
      }
      currentY += 8; // Standard height for metric panels
    }
  }

  return dashboard.build();
}
