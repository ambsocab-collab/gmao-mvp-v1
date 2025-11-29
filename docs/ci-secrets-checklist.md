# CI Secrets Checklist

Ensure the following secrets are configured in the GitHub Repository Settings -> Secrets and variables -> Actions.

## Required Secrets

| Secret Name | Description | Required For |
|---|---|---|
| `SLACK_WEBHOOK` | Webhook URL for Slack notifications | Reporting stage (if notifications enabled) |
| `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` | Token for Playwright Service (if used) | Test execution |

## Environment Variables

The following environment variables are automatically set by the workflow or `playwright.config.ts`, but you can override them in Repository Variables if needed:

- `CI`: `true`
- `BASE_URL`: Application URL (defaults to localhost in some contexts, configure for staging/prod)

## Security Best Practices
- Never commit secrets to the repository.
- Rotate secrets periodically.
- Grant access only to necessary workflows/environments.
