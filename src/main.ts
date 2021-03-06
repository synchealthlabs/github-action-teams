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
  message,
  env
}: {
  token: string
  webhookUri: string
  context: Context
  email: string
  name: string
  message: string
  env: string
}): Promise<void> {
  try {
    const octokit = github.getOctokit(token)

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

    const themeColor = '888ABD'

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      summary: `${context.payload.repository?.full_name} workflow STARTED`,
      sections: [
        {
          activityTitle: `Workflow ${context.workflow} #${context.runNumber} STARTED by ${name} on [${context.payload.repository?.full_name}](${context.payload.repository?.html_url})`,
          activitySubtitle: `${message}`,
          facts: [
            {
              name: 'Env',
              value: env
            },
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
  publishUrl,
  email,
  name,
  message,
  env
}: {
  token: string
  webhookUri: string
  context: Context
  status: string
  publishUrl: string
  email: string
  name: string
  message: string
  env: string
}): Promise<void> {
  try {
    const octokit = github.getOctokit(token)

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

    const themeColor =
      status === 'success'
        ? '90C978'
        : status === 'cancelled'
        ? 'FFF175'
        : 'C23B23'
    const conclusion = status.toUpperCase()

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      summary: `${context.payload.repository?.full_name} workflow ${conclusion}`,
      sections: [
        {
          activityTitle: `Workflow ${context.workflow} #${context.runNumber} ${conclusion} on [${context.payload.repository?.full_name}](${context.payload.repository?.html_url})`,
          activitySubtitle: `${message} (${name}: ${email})`,
          facts: [
            {
              name: 'Env',
              value: env
            },
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
            status === 'success'
              ? {
                  name: 'Published site',
                  value: `[${publishUrl}](${publishUrl})`
                }
              : {
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
    const templateType = core.getInput('type')
    if (!templateType || ['start', 'finish'].indexOf(templateType) === -1) {
      core.setFailed("'type' input must be 'start' or 'finish'")
      return
    }
    const status = core.getInput('status').toLowerCase()
    const email = core.getInput('email')
    const name = core.getInput('name')
    const message = core.getInput('message')
    const env = core.getInput('env')
    const publishUrl = core.getInput('publish-url')

    const { context } = github

    switch (templateType) {
      case 'start':
        await notifyStarted({
          token,
          webhookUri,
          context,
          email,
          name,
          message,
          env
        })
        break
      case 'finish':
      default:
        await notifyFinished({
          token,
          webhookUri,
          context,
          publishUrl,
          status,
          email,
          name,
          message,
          env
        })
        break
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
