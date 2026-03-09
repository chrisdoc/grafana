import { RowBuilder } from "@grafana/grafana-foundation-sdk/dashboard";
import { BigValueGraphMode } from "@grafana/grafana-foundation-sdk/common";
import { PanelBuilder as TimeseriesPanelBuilder } from "@grafana/grafana-foundation-sdk/timeseries";
import { PanelBuilder as StatPanelBuilder } from "@grafana/grafana-foundation-sdk/stat";
import { PanelBuilder as TablePanelBuilder } from "@grafana/grafana-foundation-sdk/table";
import { DataqueryBuilder } from "@grafana/grafana-foundation-sdk/prometheus";
import { VisibilityMode } from "@grafana/grafana-foundation-sdk/common";
import { createDashboard } from "../shared/dashboard-factory.js";
import {
  createMetricPanels,
  createStatPanel,
  createTimeseriesPanel,
} from "../shared/panel-builder.js";
import { victoriaMetricsDS } from "../shared/datasource.js";

const NULL_THRESHOLD_MS = 600_000; // 10 minutes

export function makeOpenWrtRouterDashboard() {
  const dashboard = createDashboard({
    title: "OpenWrt Router",
    uid: "openwrt-router",
    tags: ["router", "openwrt", "network"],
    refresh: "15s",
  });

  let currentY = 0;

  // === Router System Metrics ===
  dashboard.withRow(new RowBuilder("Router System Metrics"));
  currentY++;

  // CPU Usage
  const cpuPanel = new TimeseriesPanelBuilder()
    .title("CPU Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS)
    .min(0)
    .max(100);

  cpuPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        '100 - (avg by (instance) (irate(node_cpu_seconds_total{instance="router",mode="idle"}[5m])) * 100)'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Current")
  );

  cpuPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr(
        '100 - (avg by (instance) (irate(node_cpu_seconds_total{instance="router",mode="idle"}[5m] offset 24h)) * 100)'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Previous 24h")
  );

  dashboard.withPanel(cpuPanel);
  dashboard.withPanel(
    createStatPanel({
      title: "CPU Usage",
      metric:
        '100 - (avg by (instance) (irate(node_cpu_seconds_total{instance="router",mode="idle"}[5m])) * 100)',
      unit: "percent",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // Memory Usage
  const memoryPanel = new TimeseriesPanelBuilder()
    .title("Memory Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS)
    .min(0)
    .max(100);

  memoryPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        '((node_memory_MemTotal_bytes{instance="router"} - node_memory_MemAvailable_bytes{instance="router"}) / node_memory_MemTotal_bytes{instance="router"}) * 100'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Current")
  );

  memoryPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr(
        '((node_memory_MemTotal_bytes{instance="router"} - node_memory_MemAvailable_bytes{instance="router"}) / node_memory_MemTotal_bytes{instance="router"}) * 100 offset 24h'
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("Previous 24h")
  );

  dashboard.withPanel(memoryPanel);
  dashboard.withPanel(
    createStatPanel({
      title: "Memory Usage",
      metric:
        '((node_memory_MemTotal_bytes{instance="router"} - node_memory_MemAvailable_bytes{instance="router"}) / node_memory_MemTotal_bytes{instance="router"}) * 100',
      unit: "percent",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // System Load
  dashboard.withRow(new RowBuilder("System Load"));
  currentY++;

  const loadMetrics = [
    { title: "Load Average (1m)", metric: 'node_load1{instance="router"}' },
    { title: "Load Average (5m)", metric: 'node_load5{instance="router"}' },
    { title: "Load Average (15m)", metric: 'node_load15{instance="router"}' },
  ];

  loadMetrics.forEach((item, index) => {
    dashboard.withPanel(
      createStatPanel({
        title: item.title,
        metric: item.metric,
        unit: "none",
        x: index * 8,
        y: currentY,
        w: 8,
        h: 8,
        graphMode: BigValueGraphMode.Area,
      })
    );
  });
  currentY += 8;

  // Network Traffic (Router Interfaces)
  dashboard.withRow(new RowBuilder("Router Network Traffic"));
  currentY++;

  const networkPanel = new TimeseriesPanelBuilder()
    .title("Network Traffic by Interface")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  networkPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(node_network_receive_bytes_total{instance="router",device!="lo"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{device}} RX")
  );

  networkPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('rate(node_network_transmit_bytes_total{instance="router",device!="lo"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{device}} TX")
  );

  dashboard.withPanel(networkPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Total Network Traffic",
      metric:
        'sum(rate(node_network_receive_bytes_total{instance="router",device!="lo"}[5m])) + sum(rate(node_network_transmit_bytes_total{instance="router",device!="lo"}[5m]))',
      unit: "Bps",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // === Per-Client Metrics ===
  dashboard.withRow(new RowBuilder("Per-Client Network Traffic"));
  currentY++;

  // Top Clients by Traffic
  const topClientsPanel = new TimeseriesPanelBuilder()
    .title("Top 10 Clients by Traffic Rate")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  topClientsPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        "topk(10, sum by (hostname) (rate(openwrt_client_rx_bytes_total[5m]) + rate(openwrt_client_tx_bytes_total[5m])))"
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("{{hostname}}")
  );

  dashboard.withPanel(topClientsPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Online Clients",
      metric: "sum(openwrt_client_online)",
      unit: "none",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );
  currentY += 8;

  // Client Traffic by Interface Type
  dashboard.withRow(new RowBuilder("Traffic by Connection Type"));
  currentY++;

  const interfaceTrafficPanel = new TimeseriesPanelBuilder()
    .title("Traffic by Interface (WiFi vs LAN)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  interfaceTrafficPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        "sum by (interface) (rate(openwrt_client_rx_bytes_total[5m]) + rate(openwrt_client_tx_bytes_total[5m]))"
      )
      .datasource(victoriaMetricsDS)
      .legendFormat("{{interface}}")
  );

  dashboard.withPanel(interfaceTrafficPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Total Client Traffic",
      metric:
        "sum(rate(openwrt_client_rx_bytes_total[5m])) + sum(rate(openwrt_client_tx_bytes_total[5m]))",
      unit: "Bps",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // Per-Client Traffic Table
  dashboard.withRow(new RowBuilder("Client Traffic Details"));
  currentY++;

  const clientTable = new TablePanelBuilder()
    .title("Client Traffic Summary")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 });

  clientTable.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr(
        "sum by (hostname, ip, interface) (rate(openwrt_client_rx_bytes_total[5m]) + rate(openwrt_client_tx_bytes_total[5m]))"
      )
      .datasource(victoriaMetricsDS)
      .format("table")
      .instant(true)
  );

  dashboard.withPanel(clientTable);
  currentY += 8;

  // Individual Client Traffic (Receive/Transmit)
  dashboard.withRow(new RowBuilder("Per-Client Receive/Transmit"));
  currentY++;

  const clientRxTxPanel = new TimeseriesPanelBuilder()
    .title("Client Traffic (RX/TX)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  clientRxTxPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr("sum by (hostname) (rate(openwrt_client_rx_bytes_total[5m]))")
      .datasource(victoriaMetricsDS)
      .legendFormat("{{hostname}} RX")
  );

  clientRxTxPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr("sum by (hostname) (rate(openwrt_client_tx_bytes_total[5m]))")
      .datasource(victoriaMetricsDS)
      .legendFormat("{{hostname}} TX")
  );

  dashboard.withPanel(clientRxTxPanel);
  currentY += 8;

  // WiFi Signal Strength
  dashboard.withRow(new RowBuilder("WiFi Signal Strength"));
  currentY++;

  const signalStrengthPanel = new TimeseriesPanelBuilder()
    .title("WiFi Signal Strength by Client")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("dBm")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  signalStrengthPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr("openwrt_client_signal_strength_dbm")
      .datasource(victoriaMetricsDS)
      .legendFormat("{{hostname}} ({{interface}})")
  );

  dashboard.withPanel(signalStrengthPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Avg Signal Strength",
      metric: "avg(openwrt_client_signal_strength_dbm)",
      unit: "dBm",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // Signal Strength Distribution
  const signalDistributionPanel = new TimeseriesPanelBuilder()
    .title("Signal Strength Distribution")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 12, h: 8 })
    .unit("dBm")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  signalDistributionPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr("avg by (interface) (openwrt_client_signal_strength_dbm)")
      .datasource(victoriaMetricsDS)
      .legendFormat("{{interface}}")
  );

  dashboard.withPanel(signalDistributionPanel);

  // Weak Signal Alert
  dashboard.withPanel(
    createStatPanel({
      title: "Weak Signal Clients",
      metric: "count(openwrt_client_signal_strength_dbm < -80)",
      unit: "none",
      x: 12,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  // Excellent Signal Count
  dashboard.withPanel(
    createStatPanel({
      title: "Excellent Signal",
      metric: "count(openwrt_client_signal_strength_dbm > -50)",
      unit: "none",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );
  currentY += 8;

  return dashboard.build();
}
