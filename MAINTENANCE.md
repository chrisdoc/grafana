# Maintenance Guide

## Keeping AGENTS.md Updated

The `AGENTS.md` file documents your Grafana datasources and available metrics. Keep it updated by:

### When to Update

1. **New Datasources Added**
   - Update the Datasources table with UID, type, and URL
   - Example: Adding a new Loki datasource for logs

2. **Major Metric Changes**
   - New Home Assistant integrations (new domains or entities)
   - Significant changes to metric inventory (>10% change)
   - New smart home devices connected

3. **New Dashboards Created**
   - Add to "Current Dashboards" table with panel count
   - Move from "Recommended" to "Current"

4. **Quarterly Review**
   - Verify datasources are still accessible
   - Check if metric counts have changed significantly
   - Review and update last updated date

### How to Update

1. **Verify Current State**
   ```bash
   # List datasources in your Grafana instance
   curl -s http://192.168.86.104:3000/api/datasources \
     -H "Authorization: Bearer $GRAFANA_TOKEN" | jq '.'
   ```

2. **Query Metric Inventory**
   - Use VictoriaMetrics label endpoint:
   ```
   http://192.168.86.213:8428/api/v1/labels
   ```

3. **Update AGENTS.md**
   - Edit the file with changes
   - Update "Last Updated" date at the top
   - Keep format consistent with existing sections

4. **Test Dashboard Links**
   - Verify URLs in "Current Dashboards" section work
   - Check UIDs match actual dashboard UIDs

### Quick Statistics Update

Count metrics by domain using PromQL:
```promql
count by (domain) ({__name__=~".+"})
```

Compare with documented counts in AGENTS.md.

### CI/CD Integration

- **Dependabot** automatically updates dependencies
- **GitHub Actions** workflow validates dashboards build
- Consider adding a workflow step to auto-generate metric inventory report

### Documentation Structure

```
AGENTS.md
├── Quick Summary (top-level overview)
├── Datasources (table format)
├── Metric Inventory (key entities by domain)
├── Query Examples (common PromQL patterns)
├── Current Dashboards (what's deployed)
└── Recommended New Dashboards (future work)
```

Keep sections concise and link to Grafana for detailed dashboard info.
