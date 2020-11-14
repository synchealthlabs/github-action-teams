import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import * as axios from 'axios'

async function notifyStarted({
  token,
  webhookUri,
  context,
  email,
  name,
  message
}: {
  token: string
  webhookUri: string
  context: Context
  email: string
  name: string
  message: string
}): Promise<void> {
  try {
    const octokit = github.getOctokit(token)

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

    const themeColor = '90C978'

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      summary: `${context.payload.repository?.full_name} workflow started`,
      sections: [
        {
          activityTitle: `Workflow '${context.workflow}' #${context.runNumber} started by ${name} on [${context.payload.repository?.full_name}](${context.payload.repository?.html_url})`,
          activitySubtitle: `${message}`,
          facts: [
            {
              name:
                context.eventName === 'pull_request'
                  ? 'Pull request'
                  : 'Branch',
              value:
                context.eventName === 'pull_request'
                  ? `[${context.payload.pull_request?.html_url}](${context.payload.pull_request?.html_url})`
                  : `[${context.payload.repository?.html_url}/tree/${context.ref}](${context.payload.repository?.html_url}/tree/${context.ref})`
            },
            {
              name: 'Workflow run details',
              value: `[${wr.data.html_url}](${wr.data.html_url})`
            }
          ],
          markdown: true
        }
      ]
    }
    const response = await axios.default.post(webhookUri, webhookBody)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function notifyFinished({
  token,
  webhookUri,
  context,
  status,
  email,
  name,
  message
}: {
  token: string
  webhookUri: string
  context: Context
  status: string
  email: string
  name: string
  message: string
}): Promise<void> {
  try {
    const octokit = github.getOctokit(token)

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

    const themeColor =
      status === 'Success'
        ? '90C978'
        : status === 'Cancelled'
        ? 'FFF175'
        : 'C23B23'
    const conclusion = status.toUpperCase()

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      by: `${name} ${email}`,
      sections: [
        {
          activityTitle: `Workflow '${context.workflow}' #${context.runNumber} ${conclusion} on [${context.payload.repository?.full_name}](${context.payload.repository?.html_url})`,
          activitySubtitle: `${message}`,
          facts: [
            {
              name:
                context.eventName === 'pull_request'
                  ? 'Pull request'
                  : 'Branch',
              value:
                context.eventName === 'pull_request'
                  ? `[${context.payload.pull_request?.html_url}](${context.payload.pull_request?.html_url})`
                  : `[${context.payload.repository?.html_url}/tree/${context.ref}](${context.payload.repository?.html_url}/tree/${context.ref})`
            },
            {
              name: 'Workflow run details',
              value: `[${wr.data.html_url}](${wr.data.html_url})`
            }
          ],
          markdown: true
        }
      ]
    }
    await axios.default.post(webhookUri, webhookBody)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const webhookUri = core.getInput('webhook-uri')
    const position = core.getInput('position')
    if (!position || ['start', 'finish'].indexOf(position) == -1) {
      core.setFailed("'position' input must be 'start' or 'finish'")
      return
    }
    const status = core.getInput('status')
    const email = core.getInput('email')
    const name = core.getInput('name')
    const message = core.getInput('message')

    const { context } = github

    switch (position) {
      case 'start':
        await notifyStarted({
          token,
          webhookUri,
          context,
          email,
          name,
          message
        })
        break
      case 'finish':
      default:
        await notifyFinished({
          token,
          webhookUri,
          context,
          status,
          email,
          name,
          message
        })
        break
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
