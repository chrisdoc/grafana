import { DashboardBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as GeoMapPanelBuilder } from "@grafana/grafana-foundation-sdk/geomap";
import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";
import { VisibilityMode } from "@grafana/grafana-foundation-sdk/common";

export function makeLocationTrackingDashboard() {
  const dashboard = new DashboardBuilder("Location Tracking")
    .uid("location-tracking")
    .tags(["location", "tracking", "device-tracker", "vic"])
    .refresh("30s")
    .time({ from: "now-7d", to: "now" })
    .timezone("browser");

  // Row: Location Status
  const rowStatus = new RowBuilder("Current Location Status");
  dashboard.withRow(rowStatus);

  // Christoph Current State
  const christophStateQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="device_tracker.chrisphone_value"}')
    .datasource(victoriaMetricsDS);

  const christophStateStat = new StatPanelBuilder()
    .title("Chris - Home Status")
    .datasource(victoriaMetricsDS)
    .withTarget(christophStateQuery)
    .gridPos({ x: 0, y: 1, w: 6, h: 4 })
    .unit("none")
    .mappings([
      {
        type: "value" as const,
        options: {
          "1": {
            text: "Home",
            color: "green",
          },
          "0": {
            text: "Away",
            color: "red",
          },
        },
      },
    ])
    .graphMode("none" as const);

  dashboard.withPanel(christophStateStat);

  // Meg Current State
  const megStateQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="device_tracker.meg_2_value"}')
    .datasource(victoriaMetricsDS);

  const megStateStat = new StatPanelBuilder()
    .title("Meg - Home Status")
    .datasource(victoriaMetricsDS)
    .withTarget(megStateQuery)
    .gridPos({ x: 6, y: 1, w: 6, h: 4 })
    .unit("none")
    .mappings([
      {
        type: "value" as const,
        options: {
          "1": {
            text: "Home",
            color: "green",
          },
          "0": {
            text: "Away",
            color: "red",
          },
        },
      },
    ])
    .graphMode("none" as const);

  dashboard.withPanel(megStateStat);

  // Christoph Battery
  const christophBatteryQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="device_tracker.chrisphone_battery_level"}')
    .datasource(victoriaMetricsDS);

  const christophBatteryStat = new StatPanelBuilder()
    .title("Chris - Phone Battery")
    .datasource(victoriaMetricsDS)
    .withTarget(christophBatteryQuery)
    .gridPos({ x: 12, y: 1, w: 6, h: 4 })
    .unit("percent")
    .graphMode("none" as const);

  dashboard.withPanel(christophBatteryStat);

  // Row: GPS Coordinates
  const rowMap = new RowBuilder("GPS Coordinates");
  dashboard.withRow(rowMap);

  // Chris Latitude
  const christophLatQuery = new DataqueryBuilder()
    .refId("A")
    .expr("device_tracker.chrisphone_latitude")
    .datasource(victoriaMetricsDS);

  const christophLatStat = new StatPanelBuilder()
    .title("Chris - Latitude")
    .datasource(victoriaMetricsDS)
    .withTarget(christophLatQuery)
    .gridPos({ x: 0, y: 19, w: 6, h: 4 })
    .unit("degrees")
    .graphMode("none" as const);

  dashboard.withPanel(christophLatStat);

  // Chris Longitude
  const christophLonQuery = new DataqueryBuilder()
    .refId("A")
    .expr("device_tracker.chrisphone_longitude")
    .datasource(victoriaMetricsDS);

  const christophLonStat = new StatPanelBuilder()
    .title("Chris - Longitude")
    .datasource(victoriaMetricsDS)
    .withTarget(christophLonQuery)
    .gridPos({ x: 6, y: 19, w: 6, h: 4 })
    .unit("degrees")
    .graphMode("none" as const);

  dashboard.withPanel(christophLonStat);

  // Chris Speed
  const christophSpeedQuery = new DataqueryBuilder()
    .refId("A")
    .expr("device_tracker.chrisphone_speed")
    .datasource(victoriaMetricsDS);

  const christophSpeedStat = new StatPanelBuilder()
    .title("Chris - Speed")
    .datasource(victoriaMetricsDS)
    .withTarget(christophSpeedQuery)
    .gridPos({ x: 12, y: 19, w: 6, h: 4 })
    .unit("mps")
    .graphMode("none" as const);

  dashboard.withPanel(christophSpeedStat);

  // Chris Accuracy
  const christophAccuracyQuery = new DataqueryBuilder()
    .refId("A")
    .expr("device_tracker.chrisphone_gps_accuracy")
    .datasource(victoriaMetricsDS);

  const christophAccuracyStat = new StatPanelBuilder()
    .title("Chris - GPS Accuracy")
    .datasource(victoriaMetricsDS)
    .withTarget(christophAccuracyQuery)
    .gridPos({ x: 18, y: 19, w: 6, h: 4 })
    .unit("meters")
    .graphMode("none" as const);

  dashboard.withPanel(christophAccuracyStat);

  // GPS Location Map - need both lat and lon queries
  const mapLatQuery = new DataqueryBuilder()
    .refId("A")
    .expr("device_tracker.chrisphone_latitude")
    .datasource(victoriaMetricsDS);

  const mapLonQuery = new DataqueryBuilder()
    .refId("B")
    .expr("device_tracker.chrisphone_longitude")
    .datasource(victoriaMetricsDS);

  const mapPanel = new GeoMapPanelBuilder()
    .title("GPS Map")
    .datasource(victoriaMetricsDS)
    .withTarget(mapLatQuery)
    .withTarget(mapLonQuery)
    .gridPos({ x: 0, y: 23, w: 24, h: 10 })
    .overrideByName("device_tracker.chrisphone_latitude", [{ id: "unit", value: "degrees" }])
    .overrideByName("device_tracker.chrisphone_longitude", [{ id: "unit", value: "degrees" }]);

  dashboard.withPanel(mapPanel);

  // Row: State History
  const rowHistory = new RowBuilder("State History - Last 7 Days");
  dashboard.withRow(rowHistory);

  // Christoph State History Timeseries
  const christophHistoryQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="device_tracker.chrisphone_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Chris");

  const christophHistoryPanel = new TimeseriesPanelBuilder()
    .title("Chris - Home/Away History")
    .datasource(victoriaMetricsDS)
    .withTarget(christophHistoryQuery)
    .gridPos({ x: 0, y: 33, w: 12, h: 8 })
    .lineWidth(2)
    .fillOpacity(20)
    .spanNulls(600000)
    .showPoints(VisibilityMode.Never);

  dashboard.withPanel(christophHistoryPanel);

  // Meg State History Timeseries
  const megHistoryQuery = new DataqueryBuilder()
    .refId("A")
    .expr('{__name__="device_tracker.meg_2_value"}')
    .datasource(victoriaMetricsDS)
    .legendFormat("Meg");

  const megHistoryPanel = new TimeseriesPanelBuilder()
    .title("Meg - Home/Away History")
    .datasource(victoriaMetricsDS)
    .withTarget(megHistoryQuery)
    .gridPos({ x: 12, y: 33, w: 12, h: 8 })
    .lineWidth(2)
    .fillOpacity(20)
    .spanNulls(600000)
    .showPoints(VisibilityMode.Never);

  dashboard.withPanel(megHistoryPanel);

  return dashboard.build();
}
