import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";

export function makeAirQualityDashboard() {
  const dashboard = new DashboardBuilder("Air Quality (i_9psl)")
    .uid("air-quality-i_9psl")
    .tags(["air-quality", "i_9psl", "vic"])
    .refresh("30s")
    .time({ from: "now-24h", to: "now" })
    .timezone("browser");

  // Row 1: Particulate Matter
  const rowPM = new RowBuilder("Particulate Matter");
  dashboard.withRow(rowPM);

  // PM0.3 Timeseries
  const pm03Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm0_3_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const pm03Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_pm0_3_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const pm03Panel = new TimeseriesPanelBuilder()
    .title("PM0.3")
    .datasource(victoriaMetricsDS)
    .withTarget(pm03Current)
    .withTarget(pm03Prev)
    .gridPos({ x: 0, y: 1, w: 18, h: 8 })
    .unit("conμgm3")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(pm03Panel);

  // PM0.3 Stat
  const pm03StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm0_3_value"}')
    .datasource(victoriaMetricsDS);

  const pm03Stat = new StatPanelBuilder()
    .title("PM0.3")
    .datasource(victoriaMetricsDS)
    .withTarget(pm03StatQuery)
    .gridPos({ x: 18, y: 1, w: 6, h: 8 })
    .unit("conμgm3")
    .graphMode("area");

  dashboard.withPanel(pm03Stat);

  // PM1 Timeseries
  const pm1Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm1_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const pm1Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_pm1_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const pm1Panel = new TimeseriesPanelBuilder()
    .title("PM1")
    .datasource(victoriaMetricsDS)
    .withTarget(pm1Current)
    .withTarget(pm1Prev)
    .gridPos({ x: 0, y: 9, w: 18, h: 8 })
    .unit("conμgm3")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(pm1Panel);

  // PM1 Stat
  const pm1StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm1_value"}')
    .datasource(victoriaMetricsDS);

  const pm1Stat = new StatPanelBuilder()
    .title("PM1")
    .datasource(victoriaMetricsDS)
    .withTarget(pm1StatQuery)
    .gridPos({ x: 18, y: 9, w: 6, h: 8 })
    .unit("conμgm3")
    .graphMode("area");

  dashboard.withPanel(pm1Stat);

  // PM2.5 Timeseries
  const pm25Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm2_5_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const pm25Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_pm2_5_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const pm25Panel = new TimeseriesPanelBuilder()
    .title("PM2.5")
    .datasource(victoriaMetricsDS)
    .withTarget(pm25Current)
    .withTarget(pm25Prev)
    .gridPos({ x: 0, y: 17, w: 18, h: 8 })
    .unit("conμgm3")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(pm25Panel);

  // PM2.5 Stat
  const pm25StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm2_5_value"}')
    .datasource(victoriaMetricsDS);

  const pm25Stat = new StatPanelBuilder()
    .title("PM2.5")
    .datasource(victoriaMetricsDS)
    .withTarget(pm25StatQuery)
    .gridPos({ x: 18, y: 17, w: 6, h: 8 })
    .unit("conμgm3")
    .graphMode("area");

  dashboard.withPanel(pm25Stat);

  // PM10 Timeseries
  const pm10Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm10_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const pm10Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_pm10_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const pm10Panel = new TimeseriesPanelBuilder()
    .title("PM10")
    .datasource(victoriaMetricsDS)
    .withTarget(pm10Current)
    .withTarget(pm10Prev)
    .gridPos({ x: 0, y: 25, w: 18, h: 8 })
    .unit("conμgm3")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(pm10Panel);

  // PM10 Stat
  const pm10StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_pm10_value"}')
    .datasource(victoriaMetricsDS);

  const pm10Stat = new StatPanelBuilder()
    .title("PM10")
    .datasource(victoriaMetricsDS)
    .withTarget(pm10StatQuery)
    .gridPos({ x: 18, y: 25, w: 6, h: 8 })
    .unit("conμgm3")
    .graphMode("area");

  dashboard.withPanel(pm10Stat);

  // Row 2: Air Quality Indices
  const rowAQI = new RowBuilder("Air Quality Indices");
  dashboard.withRow(rowAQI);

  // VOC Index Timeseries
  const vocCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_voc_index_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const vocPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_voc_index_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const vocPanel = new TimeseriesPanelBuilder()
    .title("VOC Index")
    .datasource(victoriaMetricsDS)
    .withTarget(vocCurrent)
    .withTarget(vocPrev)
    .gridPos({ x: 0, y: 34, w: 18, h: 8 })
    .unit("none")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(vocPanel);

  // VOC Index Stat
  const vocStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_voc_index_value"}')
    .datasource(victoriaMetricsDS);

  const vocStat = new StatPanelBuilder()
    .title("VOC Index")
    .datasource(victoriaMetricsDS)
    .withTarget(vocStatQuery)
    .gridPos({ x: 18, y: 34, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(vocStat);

  // NOx Index Timeseries
  const noxCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_nox_index_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const noxPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_nox_index_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const noxPanel = new TimeseriesPanelBuilder()
    .title("NOx Index")
    .datasource(victoriaMetricsDS)
    .withTarget(noxCurrent)
    .withTarget(noxPrev)
    .gridPos({ x: 0, y: 42, w: 18, h: 8 })
    .unit("none")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(noxPanel);

  // NOx Index Stat
  const noxStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_nox_index_value"}')
    .datasource(victoriaMetricsDS);

  const noxStat = new StatPanelBuilder()
    .title("NOx Index")
    .datasource(victoriaMetricsDS)
    .withTarget(noxStatQuery)
    .gridPos({ x: 18, y: 42, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(noxStat);

  // Raw VOC Timeseries
  const rawVocCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_raw_voc_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const rawVocPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_raw_voc_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const rawVocPanel = new TimeseriesPanelBuilder()
    .title("Raw VOC")
    .datasource(victoriaMetricsDS)
    .withTarget(rawVocCurrent)
    .withTarget(rawVocPrev)
    .gridPos({ x: 0, y: 50, w: 18, h: 8 })
    .unit("none")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(rawVocPanel);

  // Raw VOC Stat
  const rawVocStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_raw_voc_value"}')
    .datasource(victoriaMetricsDS);

  const rawVocStat = new StatPanelBuilder()
    .title("Raw VOC")
    .datasource(victoriaMetricsDS)
    .withTarget(rawVocStatQuery)
    .gridPos({ x: 18, y: 50, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(rawVocStat);

  // Raw NOx Timeseries
  const rawNoxCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_raw_nox_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const rawNoxPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_raw_nox_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const rawNoxPanel = new TimeseriesPanelBuilder()
    .title("Raw NOx")
    .datasource(victoriaMetricsDS)
    .withTarget(rawNoxCurrent)
    .withTarget(rawNoxPrev)
    .gridPos({ x: 0, y: 58, w: 18, h: 8 })
    .unit("none")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(rawNoxPanel);

  // Raw NOx Stat
  const rawNoxStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_raw_nox_value"}')
    .datasource(victoriaMetricsDS);

  const rawNoxStat = new StatPanelBuilder()
    .title("Raw NOx")
    .datasource(victoriaMetricsDS)
    .withTarget(rawNoxStatQuery)
    .gridPos({ x: 18, y: 58, w: 6, h: 8 })
    .unit("none")
    .graphMode("area");

  dashboard.withPanel(rawNoxStat);

  // Row 3: Gases
  const rowGases = new RowBuilder("Gases");
  dashboard.withRow(rowGases);

  // CO₂ Timeseries
  const co2Current = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_carbon_dioxide_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const co2Prev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_carbon_dioxide_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const co2Panel = new TimeseriesPanelBuilder()
    .title("CO₂")
    .datasource(victoriaMetricsDS)
    .withTarget(co2Current)
    .withTarget(co2Prev)
    .gridPos({ x: 0, y: 67, w: 18, h: 8 })
    .unit("ppm")
    .min(0)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(co2Panel);

  // CO₂ Stat
  const co2StatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_carbon_dioxide_value"}')
    .datasource(victoriaMetricsDS);

  const co2Stat = new StatPanelBuilder()
    .title("CO₂")
    .datasource(victoriaMetricsDS)
    .withTarget(co2StatQuery)
    .gridPos({ x: 18, y: 67, w: 6, h: 8 })
    .unit("ppm")
    .graphMode("area");

  dashboard.withPanel(co2Stat);

  // Row 4: Climate
  const rowClimate = new RowBuilder("Climate");
  dashboard.withRow(rowClimate);

  // Temperature Timeseries
  const tempCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_temperature_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const tempPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_temperature_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const tempPanel = new TimeseriesPanelBuilder()
    .title("Temperature")
    .datasource(victoriaMetricsDS)
    .withTarget(tempCurrent)
    .withTarget(tempPrev)
    .gridPos({ x: 0, y: 76, w: 18, h: 8 })
    .unit("celsius")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(tempPanel);

  // Temperature Stat
  const tempStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_temperature_value"}')
    .datasource(victoriaMetricsDS);

  const tempStat = new StatPanelBuilder()
    .title("Temperature")
    .datasource(victoriaMetricsDS)
    .withTarget(tempStatQuery)
    .gridPos({ x: 18, y: 76, w: 6, h: 8 })
    .unit("celsius")
    .graphMode("area");

  dashboard.withPanel(tempStat);

  // Humidity Timeseries
  const humCurrent = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_humidity_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Current");

  const humPrev = new DataqueryBuilder()
    .refId("B")
    .expr('{__name__="sensor.i_9psl_humidity_value"} offset 24h')
    .datasource(victoriaMetricsDS)
    .legendFormat("Previous 24h");

  const humPanel = new TimeseriesPanelBuilder()
    .title("Humidity")
    .datasource(victoriaMetricsDS)
    .withTarget(humCurrent)
    .withTarget(humPrev)
    .gridPos({ x: 0, y: 84, w: 18, h: 8 })
    .unit("percent")
    .min(0)
    .max(100)
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints("never")
    .overrideByName("Previous 24h", [
      { id: "custom.lineStyle", value: { dash: [10, 10], fill: "dash" } },
      { id: "color", value: { mode: "fixed", fixedColor: "#555555" } },
    ]);

  dashboard.withPanel(humPanel);

  // Humidity Stat
  const humStatQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="sensor.i_9psl_humidity_value"}')
    .datasource(victoriaMetricsDS);

  const humStat = new StatPanelBuilder()
    .title("Humidity")
    .datasource(victoriaMetricsDS)
    .withTarget(humStatQuery)
    .gridPos({ x: 18, y: 84, w: 6, h: 8 })
    .unit("percent")
    .graphMode("area");

  dashboard.withPanel(humStat);

  return dashboard.build();
}
