# Agent Context for Grafana Instance

## Datasources

### vic (VictoriaMetrics/Prometheus) — DEFAULT
- **UID**: `df3igl5nh1f5sa`
- **Type**: `victoriametrics-metrics-datasource`
- **URL**: `http://192.168.86.213:8428/`
- **Access**: proxy
- **Prometheus-compatible**: Yes

#### Label Names
- `__name__`
- `db`
- `domain`
- `entity_id`
- `friendly_name`
- `unit_of_measurement`

#### Domain Values
binary_sensor, climate, input_select, light, number, sensor, switch, weather

#### Notable Metric Patterns
- Home Assistant-style metrics: `{domain}.{entity_id}_{attribute}`
- Example: `binary_sensor.at_the_desk_state`, `sensor.bathroom_temperature_value`

### homeassistant (InfluxDB Flux)
- **UID**: `ee572hhislhj4a`
- **Type**: `influxdb`
- **URL**: `http://**************:8086`
- **Org**: admin
- **Default Bucket**: homeassistant
- **Version**: Flux

### proxmox (InfluxDB Flux)
- **UID**: `edrq0qc5e0c8wb`
- **Type**: `influxdb`
- **URL**: `http://**************:8086`
- **Org**: proxmox
- **DB Name**: proxmox

---

## Discovered Sensors

### sensor.i_9psl (Air Quality Sensor)
All metrics in vic datasource:

| Metric | Description |
|--------|-------------|
| `sensor.i_9psl_carbon_dioxide_value` | CO₂ concentration |
| `sensor.i_9psl_humidity_value` | Relative humidity |
| `sensor.i_9psl_nox_index_value` | Nitrogen oxides index |
| `sensor.i_9psl_pm0_3_value` | PM0.3 particulate matter |
| `sensor.i_9psl_pm10_value` | PM10 particulate matter |
| `sensor.i_9psl_pm1_value` | PM1 particulate matter |
| `sensor.i_9psl_pm2_5_value` | PM2.5 particulate matter |
| `sensor.i_9psl_raw_nox_value` | Raw NOx sensor reading |
| `sensor.i_9psl_raw_voc_value` | Raw VOC sensor reading |
| `sensor.i_9psl_temperature_value` | Temperature |
| `sensor.i_9psl_voc_index_value` | Volatile organic compounds index |

#### Example Queries (PromQL)
```promql
# Current CO₂ level
sensor.i_9psl_carbon_dioxide_value

# PM2.5 over last hour
sensor.i_9psl_pm2_5_value[1h]

# Average temperature (5min windows)
avg_over_time(sensor.i_9psl_temperature_value[5m])
```

---

## Metric Inventory (2708 total metrics)

### Domain Breakdown
| Domain | Count | Notes |
|--------|-------|-------|
| device_tracker | 1459 | Location, presence, device tracking |
| sensor | 696 | Power, energy, temperature, humidity, battery, state |
| binary_sensor | 221 | Motion, occupancy, contact sensors |
| light | 207 | 11 unique light entities with brightness, color, effects |
| climate | 42 | HVAC, thermostat controls |
| switch | 36 | On/off controls (AdGuard, child locks, etc.) |
| weather | 28 | Temperature, wind, precipitation, UV |
| person | 13 | User presence aggregation (chrisdoc, meghan) |
| number | 5 | Numeric inputs |
| input_select | 1 | Selection input |

### Climate Zones
- **bathroom**, **bedroom**, **living_room**, **hot_water**
- Metrics: temperature, target_temperature, humidity, hvac_action, preset_mode, window_state, overlay, power

### Lighting (11 entities)
- **Rooms**: bed, dining (3x), floor, living, monitor, sofa (3x), standing
- **Attributes**: state, brightness, color, hs, rgb, rgbw, xy, effect, min, max

### Power & Energy
- **P1 Meter** (Smart electricity meter):
  - `sensor.p1_meter_active_power_*` (phases 1, 2, 3, total)
  - `sensor.p1_meter_total_energy_import_*` (tariff 1 & 2, total cost)
  - Power failures, long outages tracking
  
- **Connected Devices**:
  - `sensor.dining_1_power_value`
  - `sensor.sofa_1_power_value`
  - `sensor.wiz_rgbw_tunable_*_power_value`

- **Motion Energy** (Human Sensor):
  - `sensor.humen_sensor_1m_d42ae8_move_energy_value`
  - `sensor.humen_sensor_1m_d42ae8_still_energy_value`

### Location & Presence
- **person.chrisdoc**: GPS coordinates, accuracy, device trackers aggregated
- **person.meghan**: Presence state aggregation
- **device_tracker.chrisphone**: latitude, longitude, speed, gps_accuracy, battery_level, altitude, course
- **device_tracker.meg_2**: presence state and value
- **device_tracker (1459 total)**: MAC addresses, connection states, location data for network devices

### Temperature & Humidity
- **Room Sensors**: bathroom, bedroom, living_room (temperature, humidity)
- **Outdoor**: chris_outdoor_temperature
- **Air Quality**: i_9psl (temperature, humidity + PM, CO₂, NOx, VOC)
- **Weather**: buienradar, forecast_home (apparent temp, dew point)

### Air Quality
- **i_9psl Sensor**:
  - Particulates: PM0.3, PM1, PM2.5, PM10
  - Gases: CO₂, NOx index, VOC index, raw readings
  - Humidity, temperature

### Smart Home Control
- **AdGuard Home**: filtering, parental control, protection, safe search, safe browsing, query log
- **Cameras**: cp1_be9602101 (motion, audio, encryption, all-day recording)
- **Air Purifier**: core_300s (filter lifetime, PM2.5, display control)
- **Printer**: brother_hl_l2400dwe (status, state reason)

### Mobile & Wearables
- **chrisphone**: battery level, activity, steps, watch battery, geocoding, SIM info, storage, connection type, app version
- **chrisbook**: presence, connection state, IP, MAC
- **meghan**: activity tracking, presence

### Common Metric Suffixes
- `_state`: binary state (0/1) or text state
- `_value`: numeric value
- `_connectivity`: online/offline status
- `_overlay`: Tado overlay status
- `_power`: power state or power consumption

---

## Tips for Querying

1. **List all metrics for an entity**: Use regex in metric name search
   ```
   ^sensor\.i_9psl.*
   ```

2. **Filter by domain**: Use label matcher
   ```promql
   {domain="sensor"}
   ```

3. **Filter by entity_id**: Use label matcher
   ```promql
   {entity_id="bathroom_temperature"}
   ```

4. **Common aggregations**:
   ```promql
   # Average over time
   avg_over_time(metric[5m])
   
   # Rate of change
   rate(metric[5m])
   
   # Group by domain
   count by (domain) ({__name__=~".+"})
   ```

---

## Dashboard Ideas

### High Priority (Strong Data Available)

1. **Power & Energy Dashboard** ⚡
   - Real-time power consumption (P1 meter 3-phase breakdown)
   - Daily/weekly/monthly energy usage trends
   - Cost tracking (tariff 1 & 2)
   - Power failure alerts and statistics
   - Device-level consumption (dining lights, sofa, RGBW bulbs)
   - **Metrics**: 10+ power/energy sensors with hourly data
   - **Panels**: Gauge (current power), timeseries (consumption history), stat (daily total), bar (phase breakdown)

2. **Lighting Control Dashboard** 💡
   - Status of all 11 light entities
   - Brightness levels visualization
   - Color states (for RGBW bulbs)
   - On/off state indicators with quick controls
   - Power consumption per light
   - **Panels**: Stat panels (on/off), gauge (brightness), color preview, timeseries (usage patterns)

3. **Weather Dashboard** 🌤️
   - Local weather (buienradar + forecast_home)
   - Temperature, apparent temperature, dew point
   - Humidity, pressure, visibility
   - Wind speed, bearing, gust speed
   - UV index, cloud coverage, precipitation
   - **Panels**: Gauge (temp), stat (conditions), wind rose, precipitation chart

4. **Home Occupancy Dashboard** 👥
   - Person presence (chrisdoc, meghan, Chris, Meg aggregated states)
   - Motion detection (binary sensors - 221 available)
   - Network device presence (1459 device trackers)
   - **Panels**: Status indicators, timeline of entries/exits, heat map of active rooms

5. **Security & Access Dashboard** 🔒
   - AdGuard Home (filtering status, blocked queries, parental control)
   - Camera motion/audio alerts
   - Network device connections
   - Geofencing alerts
   - **Panels**: Stat (filtering status), timeseries (queries blocked), bar (top blocked domains)

### Medium Priority (Good Data, Existing Patterns)

6. **Mobile & Wearables Dashboard** 📱
   - Phone battery levels and charging state
   - Activity tracking (steps, calories, movement energy)
   - Watch battery status
   - Geocoding location info
   - **Panels**: Gauge (battery %), stat (activity), timeseries (battery history)

7. **Smart Appliances Dashboard** 🏠
   - Air purifier status (core_300s) - filter lifetime, PM2.5 readings
   - Printer status (brother_hl_l2400dwe) - state, error reason
   - Connected appliances status
   - **Panels**: Stat (filter life %), health indicators

8. **Network Devices Map** 📡
   - Network connectivity status dashboard
   - MAC address tracking
   - Connection uptime/downtime stats
   - First/last connection times
   - Vendor information

9. **Room Comfort Dashboard** 🌡️
   - Extend thermostat dashboard with motion/occupancy
   - Comfort index combining temp, humidity, air quality
   - Window state (open/closed) with alerts
   - Per-room occupancy
   - **Panels**: Similar to current thermostat but add motion, air quality overlay

### Lower Priority (Limited/Sparse Data)

10. **Activity Tracking Dashboard** 🏃
    - Steps, distance, floors climbed
    - Movement vs still energy
    - Activity duration and patterns
    - Sleep and rest tracking
    
11. **Device Geofencing Dashboard** 📍
    - Geofencing status and modes
    - Location history for tracked devices
    - Geofence entry/exit events
    - Distance from home

### Current Dashboards (Already Built)

| Dashboard | Panels | Key Metrics |
|-----------|--------|-------------|
| Air Quality | 26 | PM2.5, PM10, CO₂, NOx, VOC, humidity, temp |
| Energy Monitor | 36 | (pre-existing) |
| Thermostat | 18 | Room temps, humidity, HVAC state, presets |
| Location Tracking | 10 | GPS coords (stale), home/away state, history |

### Recommended Build Order
1. **Power & Energy** - Most useful, real-time data, clear visualizations
2. **Lighting Control** - 11 entities, simple boolean/numeric metrics
3. **Weather** - Good data, visually appealing gauges and charts
4. **Home Occupancy** - Combines motion + presence + network devices
5. **Security** - AdGuard integration is comprehensive, motion alerts valuable
