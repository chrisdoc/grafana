# GitHub Actions Setup for Grafana Dashboard Deployment

This project includes a GitHub Actions workflow that automatically builds and deploys dashboards to your Grafana instance through Tailscale.

## Prerequisites

### 1. Tailscale OAuth Application
Create a Tailscale OAuth application:

1. Go to [Tailscale Admin Console](https://login.tailscale.com/admin/settings/oauth)
2. Click "Create OAuth Client"
3. Set the "Redirect URL" to `https://github.com/login/oauth/authorize`
4. Grant permissions for accessing your Tailnet
5. Save your **Client ID** and **Client Secret**

### 2. Grafana API Token
Create an API token in your Grafana instance:

1. Navigate to Grafana: `http://192.168.86.104:3000`
2. Go to **Administration → API Keys** (or **Home → Administration → API Tokens**)
3. Click "Create API Token"
4. Name it `github-actions`
5. Set role to **Editor** (for dashboard management)
6. Save the token

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. **`TAILSCALE_OAUTH_CLIENT_ID`**
   - Value: Your Tailscale OAuth Client ID

2. **`TAILSCALE_OAUTH_SECRET`**
   - Value: Your Tailscale OAuth Client Secret

3. **`GRAFANA_URL`**
   - Value: Your Grafana URL (e.g., `http://192.168.86.104:3000`)

4. **`GRAFANA_TOKEN`**
   - Value: Your Grafana API token (starts with `glc_` or similar)

### How to add secrets:
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add each secret with the corresponding name and value

## Workflow

The workflow is triggered on:
- **Push** to the `main` branch
- **Pull requests** to the `main` branch

### Steps:
1. **Checkout** - Clones your repository
2. **Setup Node.js** - Installs Node.js 20 with npm cache
3. **Install Dependencies** - Runs `npm ci`
4. **Format Check** - Verifies code formatting with Biome
5. **Lint Check** - Runs linting with Biome
6. **Build Dashboards** - Compiles TypeScript dashboards to JSON
7. **Connect to Tailscale** - Establishes Tailscale connection using OAuth
8. **Deploy to Grafana** - Uploads dashboards via the Grafana API
9. **Verify Deployment** - Outputs dashboard URLs

## Local Testing

To test the workflow locally before pushing:

```bash
# Install dependencies
npm ci

# Format check
npm run fmt -- --check

# Lint check
npm run lint -- --check

# Build
npm run build

# Deploy (requires .env file)
./upload.sh
```

## Troubleshooting

### Connection Issues
- **Can't reach Grafana**: Ensure Tailscale OAuth is properly configured and the runner can access your Tailnet
- **Invalid API Token**: Double-check your Grafana API token in the secrets

### Build Issues
- **Format/Lint Failures**: Run `npm run fmt` and `npm run lint` locally to fix issues
- **Build Errors**: Check for TypeScript compilation errors in the build output

### Deployment Issues
- **Upload Fails**: Verify the API token has Editor role and dashboard UIDs are unique
- **HTTP 401/403**: Check your Grafana API token hasn't expired

## Disabling/Modifying the Workflow

To disable the workflow:
1. In the repository, go to **Actions**
2. Select "Build and Deploy Dashboards"
3. Click the menu (⋯) and select "Disable workflow"

To modify the workflow:
- Edit `.github/workflows/deploy.yml`
- Push changes to trigger the new workflow

## Environment Variables

The workflow uses these environment variables (no .env file needed):

- `GRAFANA_URL` - Set from secrets
- `GRAFANA_API_TOKEN` - Set from secrets
- `CI` - Automatically set by GitHub Actions

The `upload.sh` script automatically detects CI environment and uses these variables instead of looking for a .env file.
