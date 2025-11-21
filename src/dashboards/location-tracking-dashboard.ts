import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { PanelBuilder as GeoMapPanelBuilder } from "@grafana/grafana-foundation-sdk/geomap";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { victoriaMetricsDS } from "../shared/datasource.js";
import { VisibilityMode, BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { createStatPanel, createTimeseriesPanel } from "../shared/panel-builder.js";
import { createDashboard } from "../shared/dashboard-factory.js";

// --- Configuration & Types ---

interface PersonConfig {
  name: string;
  id: string; // e.g. "chrisphone" or "meg_2"
  label: string; // e.g. "Chris" or "Meg"
}

const PEOPLE: PersonConfig[] = [
  { name: "Chris", id: "chrisphone", label: "Chris" },
  { name: "Meg", id: "meg_2", label: "Meg" },
];

// --- Dashboard Generator ---

export function makeLocationTrackingDashboard() {
  const dashboard = createDashboard({
    title: "Location Tracking",
    uid: "location-tracking",
    tags: ["location", "tracking", "device-tracker"],
    from: "now-7d",
    to: "now",
  });

  let currentY = 0;

  // 1. Location Status Row
  dashboard.withRow(new RowBuilder("Current Location Status"));
  currentY++;

  PEOPLE.forEach((person, index) => {
    // Home Status Stat
    const stateStat = createStatPanel({
      title: `${person.label} - Home Status`,
      metric: `{__name__="device_tracker.${person.id}_value"}`,
      x: index * 6,
      y: currentY,
      w: 6,
      h: 4,
      unit: "none",
      graphMode: BigValueGraphMode.None,
      mappings: [
        {
          // biome-ignore lint/suspicious/noExplicitAny: MappingType enum is not exported
          type: "value" as any,
          options: {
            "1": { text: "Home", color: "green" },
            "0": { text: "Away", color: "red" },
          },
        },
      ],
    });

    dashboard.withPanel(stateStat);
  });

  // Chris Battery (Specific)
  const christophBatteryStat = createStatPanel({
    title: "Chris - Phone Battery",
    metric: '{__name__="device_tracker.chrisphone_battery_level"}',
    x: 12,
    y: currentY,
    w: 6,
    h: 4,
    unit: "percent",
    graphMode: BigValueGraphMode.None,
  });

  dashboard.withPanel(christophBatteryStat);
  currentY += 4;

  // 2. GPS Coordinates Row (Chris Only)
  dashboard.withRow(new RowBuilder("GPS Coordinates"));
  currentY++;

  const gpsMetrics = [
    { title: "Chris - Latitude", expr: "device_tracker.chrisphone_latitude", unit: "degrees" },
    { title: "Chris - Longitude", expr: "device_tracker.chrisphone_longitude", unit: "degrees" },
    { title: "Chris - Speed", expr: "device_tracker.chrisphone_speed", unit: "mps" },
    {
      title: "Chris - GPS Accuracy",
      expr: "device_tracker.chrisphone_gps_accuracy",
      unit: "meters",
    },
  ];

  gpsMetrics.forEach((metric, index) => {
    const panel = createStatPanel({
      title: metric.title,
      metric: metric.expr,
      x: index * 6,
      y: currentY,
      w: 6,
      h: 4,
      unit: metric.unit,
      graphMode: BigValueGraphMode.None,
    });

    dashboard.withPanel(panel);
  });
  currentY += 4;

  // GPS Map
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
    .gridPos({ x: 0, y: currentY, w: 24, h: 10 })
    .overrideByName("device_tracker.chrisphone_latitude", [{ id: "unit", value: "degrees" }])
    .overrideByName("device_tracker.chrisphone_longitude", [{ id: "unit", value: "degrees" }]);

  dashboard.withPanel(mapPanel);
  currentY += 10;

  // 3. State History Row
  dashboard.withRow(new RowBuilder("State History - Last 7 Days"));
  currentY++;

  PEOPLE.forEach((person, index) => {
    const historyPanel = createTimeseriesPanel({
      title: `${person.label} - Home/Away History`,
      metric: `device_tracker.${person.id}_value`,
      x: index * 12,
      y: currentY,
      w: 12,
      h: 8,
      fillOpacity: 20,
      showPoints: VisibilityMode.Never,
      legendFormat: person.label,
    });

    dashboard.withPanel(historyPanel);
  });

  return dashboard.build();
}
