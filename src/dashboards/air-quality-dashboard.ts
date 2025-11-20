import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { createMetricPanels } from "../shared/panel-builder.js";

export function makeAirQualityDashboard() {
  const dashboard = new DashboardBuilder("Air Quality (i_9psl)")
    .uid("air-quality-i_9psl")
    .tags(["air-quality", "i_9psl", "vic"])
    .refresh("30s")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Row 1: Particulate Matter
  dashboard.withRow(new RowBuilder("Particulate Matter"));

  for (const panel of createMetricPanels({
    title: "PM0.3",
    metric: "sensor.i_9psl_pm0_3_value",
    unit: "conμgm3",
    yOffset: 1,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "PM1",
    metric: "sensor.i_9psl_pm1_value",
    unit: "conμgm3",
    yOffset: 9,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "PM2.5",
    metric: "sensor.i_9psl_pm2_5_value",
    unit: "conμgm3",
    yOffset: 17,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "PM10",
    metric: "sensor.i_9psl_pm10_value",
    unit: "conμgm3",
    yOffset: 25,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 2: Air Quality Indices
  dashboard.withRow(new RowBuilder("Air Quality Indices"));

  for (const panel of createMetricPanels({
    title: "VOC Index",
    metric: "sensor.i_9psl_voc_index_value",
    unit: "none",
    yOffset: 34,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "NOx Index",
    metric: "sensor.i_9psl_nox_index_value",
    unit: "none",
    yOffset: 42,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Raw VOC",
    metric: "sensor.i_9psl_raw_voc_value",
    unit: "none",
    yOffset: 50,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Raw NOx",
    metric: "sensor.i_9psl_raw_nox_value",
    unit: "none",
    yOffset: 58,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 3: Gases
  dashboard.withRow(new RowBuilder("Gases"));

  for (const panel of createMetricPanels({
    title: "CO₂",
    metric: "sensor.i_9psl_carbon_dioxide_value",
    unit: "ppm",
    yOffset: 67,
    min: 0,
  })) {
    dashboard.withPanel(panel);
  }

  // Row 4: Climate
  dashboard.withRow(new RowBuilder("Climate"));

  for (const panel of createMetricPanels({
    title: "Temperature",
    metric: "sensor.i_9psl_temperature_value",
    unit: "celsius",
    yOffset: 76,
  })) {
    dashboard.withPanel(panel);
  }

  for (const panel of createMetricPanels({
    title: "Humidity",
    metric: "sensor.i_9psl_humidity_value",
    unit: "percent",
    yOffset: 84,
    min: 0,
    max: 100,
  })) {
    dashboard.withPanel(panel);
  }

  return dashboard.build();
}
