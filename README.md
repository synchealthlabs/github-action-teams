# Github Actions for Microsoft Teams

### Usage

1. Add `MS_TEAMS_WEBHOOK_URI` on your repository's configs on Settings > Secrets. See [webhook URI](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) for further information

2) Add a new `step` on your workflow code as first or last step of workflow job:

```yaml
name: Github Action for Microsoft Teams

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - uses: synchealthlabs/github-action-teams@main
        if: always() # to let this step always run even if previous step failed
        with:
          github-token: ${{ github.token }}
          webhook-uri: ${{ secrets.MS_TEAMS_WEBHOOK_URI }}
          position: start # or finish
```
