import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import * as axios from 'axios'

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    if (!token) {
      core.setFailed("'github-token' input can't be empty")
      return
    }

    const webhookUri = core.getInput('webhook-uri')
    if (!webhookUri) {
      core.setFailed("'webhook-uri' input can't be empty")
      return
    }

    const position = core.getInput('position')
    if (!position || ['start', 'finish'].indexOf(position) == -1) {
      core.setFailed("'position' input must be 'start' or 'finish'")
      return
    }

    const context: Context = github.context

    switch (position) {
      case 'start': 
        return notifyStarted(token, webhookUri, context)
      case 'finish':
        return notifyFinished(token, webhookUri, context)
    }
    

  } catch (error) {
    core.setFailed(error.message)
  }
}


async function notifyStarted(token: string, webhookUri: string, context: Context): Promise<void> {
 
  try {
   
    const octokit = github.getOctokit(token)

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

    const themeColor ='90C978'

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      summary: `${context.payload.repository?.full_name} workflow started`,
      sections: [
        {
          activityTitle: `Workflow '${context.workflow}' #${context.runNumber} started`,
          activitySubtitle: `on [${context.payload.repository?.full_name}](${context.payload.repository?.html_url})`,
          facts: [
            {
              name:
              context.eventName === 'pull_request' ? 'Pull request' : 'Branch',
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
    core.debug(JSON.stringify(response.data))

  } catch (error) {
    core.setFailed(error.message)
  }
}

async function notifyFinished(token: string, webhookUri: string, context: Context): Promise<void> {
  try {
    const token = core.getInput('github-token')
    if (!token) {
      core.setFailed("'github-token' input can't be empty")
      return
    }

    const webhookUri = core.getInput('webhook-uri')
    if (!webhookUri) {
      core.setFailed("'webhook-uri' input can't be empty")
      return
    }

    const position = core.getInput('position')
    if (!position || ['start', 'finish'].indexOf(position) == -1) {
      core.setFailed("'position' input must be 'start' or 'finish'")
      return
    }

    const context = github.context
    const octokit = github.getOctokit(token)

    const jobList = await octokit.actions.listJobsForWorkflowRun({
      repo: context.repo.repo,
      owner: context.repo.owner,
      run_id: context.runId
    })

    const jobs = jobList.data.jobs

    console.log(JSON.stringify(jobs))

    const job = jobs.find(j => j.name === context.job)

    console.log(JSON.stringify(job))

    const stoppedStep = job?.steps.find(
      s =>
        s.conclusion === 'failure' ||
        s.conclusion === 'timed_out' ||
        s.conclusion === 'cancelled' ||
        s.conclusion === 'action_required'
    )

    const lastStep = stoppedStep
      ? stoppedStep
      : job?.steps.reverse().find(s => s.status === 'completed')

    const wr = await octokit.actions.getWorkflowRun({
      owner: context.repo.owner,
      repo: context.repo.repo,
      run_id: context.runId
    })

   console.log(JSON.stringify(wr.data))

    const repository_url = context.payload.repository?.html_url
    const commit_author = context.actor

    const themeColor =
      lastStep?.conclusion === 'success'
        ? '90C978'
        : lastStep?.conclusion === 'cancelled'
        ? 'FFF175'
        : 'C23B23'
    const conclusion =
      lastStep?.conclusion === 'success'
        ? 'SUCCEEDED'
        : lastStep?.conclusion === 'cancelled'
        ? 'CANCELLED'
        : 'FAILED'

    const webhookBody = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: `${themeColor}`,
      summary: `${commit_author} commited new changes`,
      sections: [
        {
          activityTitle: `Workflow '${context.workflow}' #${context.runNumber} ${conclusion}`,
          activitySubtitle: `on [${context.payload.repository?.full_name}](${repository_url})`,
          facts: [
            {
              name:
              context.eventName === 'pull_request' ? 'Pull request' : 'Branch',
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
    core.debug(JSON.stringify(response.data))

  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
