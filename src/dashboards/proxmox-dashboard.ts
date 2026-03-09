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

export function makeProxmoxDashboard() {
  const dashboard = createDashboard({
    title: "Proxmox",
    uid: "proxmox",
    tags: ["proxmox", "pve", "virtualization"],
    refresh: "30s",
  });

  let currentY = 0;

  // === Node Summary ===
  dashboard.withRow(new RowBuilder("Node Summary"));
  currentY++;

  dashboard.withPanel(
    createStatPanel({
      title: "CPU (avg)",
      metric: 'avg(system_cpu{nodename="proxmox"}) * 100',
      unit: "percent",
      x: 0,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.Area,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Free Memory",
      metric: 'avg(system_maxmem{nodename="proxmox"}) - avg(system_mem{nodename="proxmox"})',
      unit: "bytes",
      x: 6,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.None,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Free Disk",
      metric: 'sum(system_maxdisk{nodename="proxmox"}) - sum(system_disk{nodename="proxmox"})',
      unit: "bytes",
      x: 12,
      y: currentY,
      w: 6,
      h: 4,
      graphMode: BigValueGraphMode.None,
    })
  );

  const nodeNetPanel = new TimeseriesPanelBuilder()
    .title("Node Network I/O")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 18, y: currentY, w: 6, h: 4 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  nodeNetPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('sum(rate(system_netin{nodename="proxmox"}[5m]))')
      .datasource(victoriaMetricsDS)
      .legendFormat("netin")
  );

  nodeNetPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('-sum(rate(system_netout{nodename="proxmox"}[5m]))')
      .datasource(victoriaMetricsDS)
      .legendFormat("netout")
  );

  dashboard.withPanel(nodeNetPanel);

  currentY += 4;

  // === Node Overview ===
  dashboard.withRow(new RowBuilder("Node Overview"));
  currentY++;

  // CPU Usage (using system_cpu which is already a percentage)
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
      .expr('system_cpu{nodename="proxmox"} * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}})")
  );

  dashboard.withPanel(cpuPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Avg CPU Usage",
      metric: 'avg(system_cpu{nodename="proxmox"}) * 100',
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
      .expr('(system_mem{nodename="proxmox"} / system_maxmem{nodename="proxmox"}) * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} ({{vmid}})")
  );

  dashboard.withPanel(memoryPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Avg Memory Usage",
      metric: 'avg((system_mem{nodename="proxmox"} / system_maxmem{nodename="proxmox"}) * 100)',
      unit: "percent",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // === Virtual Machines ===
  dashboard.withRow(new RowBuilder("Virtual Machines"));
  currentY++;

  // VM CPU Usage (already shown above, but can show per-VM breakdown)
  const vmCpuPanel = new TimeseriesPanelBuilder()
    .title("VM CPU Usage (Per VM)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 12, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS)
    .min(0)
    .max(100);

  vmCpuPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('system_cpu{nodename="proxmox"} * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}})")
  );

  dashboard.withPanel(vmCpuPanel);

  // VM Memory Usage
  const vmMemoryPanel = new TimeseriesPanelBuilder()
    .title("VM Memory Usage (Per VM)")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 12, y: currentY, w: 12, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS)
    .min(0)
    .max(100);

  vmMemoryPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('(system_mem{nodename="proxmox"} / system_maxmem{nodename="proxmox"}) * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}})")
  );

  dashboard.withPanel(vmMemoryPanel);
  currentY += 8;

  // VM Status Summary
  dashboard.withRow(new RowBuilder("VM Status"));
  currentY++;

  dashboard.withPanel(
    createStatPanel({
      title: "Total VMs",
      metric: 'count(system_status{nodename="proxmox"})',
      unit: "none",
      x: 0,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Running VMs",
      metric: 'count(system_running-machine{nodename="proxmox"})',
      unit: "none",
      x: 6,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Running QEMU",
      metric: 'count(system_running-qemu{nodename="proxmox"})',
      unit: "none",
      x: 12,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );

  dashboard.withPanel(
    createStatPanel({
      title: "Total Uptime",
      metric: 'sum(system_uptime{nodename="proxmox"}) / 86400',
      unit: "dtdurations",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.None,
    })
  );
  currentY += 8;

  // === Storage ===
  dashboard.withRow(new RowBuilder("Storage"));
  currentY++;

  // Storage Usage (per VM)
  const storagePanel = new TimeseriesPanelBuilder()
    .title("VM Disk Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("percent")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS)
    .min(0)
    .max(100);

  storagePanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('(system_disk{nodename="proxmox"} / system_maxdisk{nodename="proxmox"}) * 100')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}})")
  );

  dashboard.withPanel(storagePanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Avg Disk Usage",
      metric: 'avg((system_disk{nodename="proxmox"} / system_maxdisk{nodename="proxmox"}) * 100)',
      unit: "percent",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // Storage I/O
  dashboard.withRow(new RowBuilder("Storage I/O"));
  currentY++;

  const storageIoPanel = new TimeseriesPanelBuilder()
    .title("VM Disk I/O")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  storageIoPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(system_diskread{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) Read")
  );

  storageIoPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('rate(system_diskwrite{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) Write")
  );

  dashboard.withPanel(storageIoPanel);
  currentY += 8;

  // === Network ===
  dashboard.withRow(new RowBuilder("Network"));
  currentY++;

  // VM Network Traffic
  const vmNetworkPanel = new TimeseriesPanelBuilder()
    .title("VM Network Traffic")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  vmNetworkPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(system_netin{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) RX")
  );

  vmNetworkPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('-rate(system_netout{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) TX")
  );

  dashboard.withPanel(vmNetworkPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Total Network Traffic",
      metric:
        'sum(rate(system_netin{nodename="proxmox"}[5m])) + sum(rate(system_netout{nodename="proxmox"}[5m]))',
      unit: "Bps",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  // Detailed Network I/O (from nics metrics)
  dashboard.withRow(new RowBuilder("Detailed Network I/O"));
  currentY++;

  const detailedNetworkPanel = new TimeseriesPanelBuilder()
    .title("Network I/O by Interface")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("Bps")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  detailedNetworkPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(nics_netin{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}}/{{device}} RX")
  );

  detailedNetworkPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('-rate(nics_netout{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}}/{{device}} TX")
  );

  dashboard.withPanel(detailedNetworkPanel);
  currentY += 8;

  // Block I/O Stats
  dashboard.withRow(new RowBuilder("Block I/O Statistics"));
  currentY++;

  const blockIoPanel = new TimeseriesPanelBuilder()
    .title("Block I/O Operations")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 })
    .unit("iops")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  blockIoPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('rate(blockstat_rd_operations{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}}/{{device}} Read Ops")
  );

  blockIoPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('rate(blockstat_wr_operations{nodename="proxmox"}[5m])')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}}/{{device}} Write Ops")
  );

  dashboard.withPanel(blockIoPanel);
  currentY += 8;

  // === VM Table ===
  dashboard.withRow(new RowBuilder("VM Details"));
  currentY++;

  const vmTable = new TablePanelBuilder()
    .title("Virtual Machines")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 });

  vmTable.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('system_name{nodename="proxmox"}')
      .datasource(victoriaMetricsDS)
      .format("table")
      .instant(true)
  );

  dashboard.withPanel(vmTable);

  const osTable = new TablePanelBuilder()
    .title("LXC / Guest OS")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 24, h: 8 });

  osTable.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('system_name{nodename="proxmox", object="lxc"}')
      .datasource(victoriaMetricsDS)
      .format("table")
      .instant(true)
  );

  osTable.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('qemu_guest_os{nodename="proxmox"}')
      .datasource(victoriaMetricsDS)
      .format("table")
      .instant(true)
  );

  osTable.withTarget(
    new DataqueryBuilder()
      .refId("C")
      .expr('lxc_info{nodename="proxmox"}')
      .datasource(victoriaMetricsDS)
      .format("table")
      .instant(true)
  );

  dashboard.withPanel(osTable);
  currentY += 8;

  // === Memory Balloon Info ===
  dashboard.withRow(new RowBuilder("Memory Balloon"));
  currentY++;

  const balloonPanel = new TimeseriesPanelBuilder()
    .title("Memory Balloon Usage")
    .datasource(victoriaMetricsDS)
    .gridPos({ x: 0, y: currentY, w: 18, h: 8 })
    .unit("bytes")
    .lineWidth(2)
    .fillOpacity(10)
    .showPoints(VisibilityMode.Never)
    .spanNulls(NULL_THRESHOLD_MS);

  balloonPanel.withTarget(
    new DataqueryBuilder()
      .refId("A")
      .expr('ballooninfo_actual{nodename="proxmox"}')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) Actual")
  );

  balloonPanel.withTarget(
    new DataqueryBuilder()
      .refId("B")
      .expr('ballooninfo_max_mem{nodename="proxmox"}')
      .datasource(victoriaMetricsDS)
      .legendFormat("{{host}} (VM {{vmid}}) Max")
  );

  dashboard.withPanel(balloonPanel);

  dashboard.withPanel(
    createStatPanel({
      title: "Balloon Free Memory",
      metric: 'sum(ballooninfo_free_mem{nodename="proxmox"})',
      unit: "bytes",
      x: 18,
      y: currentY,
      w: 6,
      h: 8,
      graphMode: BigValueGraphMode.Area,
    })
  );
  currentY += 8;

  return dashboard.build();
}
