# GitHub Actions Setup - Quick Start

## What's Been Set Up

A GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Runs on push to `main` and on pull requests
- Checks code format and linting with Biome
- Builds all dashboards from TypeScript
- Connects to your Tailnet via Tailscale OAuth
- Deploys dashboards to your Grafana instance
- Verifies the deployment was successful

## Quick Setup (3 Steps)

### Step 1: Create Tailscale OAuth Application
1. Visit https://login.tailscale.com/admin/settings/oauth
2. Click "Create OAuth Client"
3. Grant necessary permissions
4. Save your **Client ID** and **Client Secret**

### Step 2: Create Grafana API Token
1. Open Grafana: http://192.168.86.104:3000
2. Go to **Administration → API Keys**
3. Click "Create API Token"
4. Name: `github-actions`
5. Role: **Editor**
6. Save the token (format like: `glc_...`)

### Step 3: Add GitHub Secrets
In your GitHub repo: **Settings → Secrets and variables → Actions**

Add these 4 secrets:
- `TAILSCALE_OAUTH_CLIENT_ID` = your Tailscale Client ID
- `TAILSCALE_OAUTH_SECRET` = your Tailscale Client Secret
- `GRAFANA_URL` = `http://192.168.86.104:3000`
- `GRAFANA_TOKEN` = your Grafana API token

## Done!

Push to `main` and your dashboards will automatically deploy. View the workflow status in **Actions** tab.

## Deployment URLs

After deployment, your dashboards are available at:
- Air Quality: `http://192.168.86.104:3000/d/air-quality-i_9psl`
- Energy Monitor: `http://192.168.86.104:3000/d/energy-monitor`
- Thermostat: `http://192.168.86.104:3000/d/thermostats-overview`
- Location Tracking: `http://192.168.86.104:3000/d/location-tracking`

## For More Details

See `GITHUB_ACTIONS_SETUP.md` for comprehensive documentation.
