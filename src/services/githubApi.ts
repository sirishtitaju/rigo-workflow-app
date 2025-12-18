import axios, { AxiosError } from 'axios'

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''
const OWNER = 'sirishtitaju'
const REPO = 'rigo-automation'
const WORKFLOW_FILE_NAME = '.github/workflows/rigohr.yml'
const REF = 'master'
const AUTOMATION_FILE_PATH = 'automation.json'

// Use proxy in development, direct API in production with proper CORS handling
const API_BASE = import.meta.env.DEV ? '/api/github' : 'https://api.github.com'

const githubApi = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Workflow-App',
  },
})

// Add request interceptor for better error handling
githubApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('GitHub API Error:', error.response?.data || error.message)

    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      throw new Error('Network error: Please check your internet connection or try using a CORS proxy.')
    }

    if (error.response?.status === 401) {
      throw new Error('Authentication failed: Please check your GitHub token.')
    }

    if (error.response?.status === 403) {
      throw new Error('Access forbidden: Please check your GitHub token permissions.')
    }

    if (error.response?.status === 404) {
      throw new Error('Repository or file not found.')
    }

    if (error.response?.status === 422) {
      const errorData = error.response.data as { message?: string; errors?: Array<{ message?: string }> }
      const message = errorData?.message || 'Unprocessable Entity'
      const errors = errorData?.errors || []

      if (message.includes('workflow') || errors.some((e) => e.message?.includes('workflow'))) {
        throw new Error('Workflow trigger failed: The workflow file may not exist, may not have workflow_dispatch trigger, or the branch name is incorrect.')
      }

      throw new Error(`GitHub API Error (422): ${message}`)
    }

    throw error
  }
)

export interface AutomationConfig {
  enabled: boolean
  lastRun?: string
  action?: string
}

export interface WorkflowRun {
  status: string
  conclusion?: string
  created_at: string
  updated_at: string
}

export interface Workflow {
  id: number
  name: string
  path: string
  state: string
  created_at: string
  updated_at: string
}

export const githubService = {
  async loadAutomation(): Promise<AutomationConfig> {
    try {
      const response = await githubApi.get(`/repos/${OWNER}/${REPO}/contents/${AUTOMATION_FILE_PATH}`)
      const content = JSON.parse(atob(response.data.content))
      return content
    } catch (error) {
      console.error('Failed to load automation config:', error)
      throw error
    }
  },

  async updateAutomationState(newEnabled: boolean): Promise<AutomationConfig> {
    try {
      // Get the latest file to get the SHA
      const latest = await githubApi.get(`/repos/${OWNER}/${REPO}/contents/${AUTOMATION_FILE_PATH}`)
      const latestSha = latest.data.sha

      const newContent: AutomationConfig = {
        enabled: newEnabled,
        lastRun: new Date().toISOString(),
        action: 'checkout',
      }

      await githubApi.put(`/repos/${OWNER}/${REPO}/contents/${AUTOMATION_FILE_PATH}`, {
        message: `Toggle automation to ${newEnabled}`,
        content: btoa(JSON.stringify(newContent, null, 2)),
        sha: latestSha,
        branch: REF,
      })

      return newContent
    } catch (error) {
      console.error('Failed to update automation state:', error)
      throw error
    }
  },

  async checkWorkflowStatus(): Promise<{ isRunning: boolean; latestRun?: WorkflowRun }> {
    try {
      const response = await githubApi.get(`/repos/${OWNER}/${REPO}/actions/runs`)
      const latestRun = response.data.workflow_runs[0] as WorkflowRun

      return {
        isRunning: latestRun?.status === 'in_progress',
        latestRun
      }
    } catch (error) {
      console.error('Failed to check workflow status:', error)
      throw error
    }
  },

  async listWorkflows(): Promise<Workflow[]> {
    try {
      const response = await githubApi.get(`/repos/${OWNER}/${REPO}/actions/workflows`)
      return response.data.workflows || []
    } catch (error) {
      console.error('Failed to list workflows:', error)
      throw error
    }
  },

  async getDefaultBranch(): Promise<string> {
    try {
      const response = await githubApi.get(`/repos/${OWNER}/${REPO}`)
      return response.data.default_branch || 'main'
    } catch (error) {
      console.error('Failed to get default branch:', error)
      return 'main' // fallback to main
    }
  },

  async checkWorkflowFile(): Promise<{ exists: boolean; hasDispatch: boolean; content?: string }> {
    try {
      const response = await githubApi.get(`/repos/${OWNER}/${REPO}/contents/${WORKFLOW_FILE_NAME}`)
      const content = atob(response.data.content)
      const hasDispatch = content.includes('workflow_dispatch')

      return {
        exists: true,
        hasDispatch,
        content
      }
    } catch (error) {
      console.error(error);
      return {
        exists: false,
        hasDispatch: false
      }
    }
  },

  async triggerWorkflow(): Promise<void> {
    try {
      // Get the correct default branch
      const defaultBranch = await this.getDefaultBranch()
      const branchToUse = defaultBranch // Use default branch instead of hardcoded 'master'

      console.log('Attempting to trigger workflow:', WORKFLOW_FILE_NAME)
      console.log('Repository:', `${OWNER}/${REPO}`)
      console.log('Branch:', branchToUse)

      await githubApi.post(
        `/repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE_NAME)}/dispatches`,
        { ref: branchToUse },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error) {
      console.error('Failed to trigger workflow:', error)

      // If it's a 422 error, let's try to get more info about available workflows
      if (error instanceof Error && error.message.includes('422')) {
        try {
          const workflows = await this.listWorkflows()
          console.log('Available workflows:', workflows.map(w => ({ name: w.name, path: w.path, state: w.state })))

          if (workflows.length === 0) {
            throw new Error('No workflows found in this repository. Make sure the workflow file exists in .github/workflows/')
          }

          const matchingWorkflow = workflows.find(w => w.path === WORKFLOW_FILE_NAME)
          if (!matchingWorkflow) {
            const availablePaths = workflows.map(w => w.path).join(', ')
            throw new Error(`Workflow file '${WORKFLOW_FILE_NAME}' not found. Available workflows: ${availablePaths}`)
          }

          if (matchingWorkflow.state !== 'active') {
            throw new Error(`Workflow '${WORKFLOW_FILE_NAME}' is not active (state: ${matchingWorkflow.state})`)
          }

          // Check if workflow has workflow_dispatch trigger
          try {
            const workflowContent = await githubApi.get(`/repos/${OWNER}/${REPO}/contents/${WORKFLOW_FILE_NAME}`)
            const content = atob(workflowContent.data.content)

            if (!content.includes('workflow_dispatch')) {
              throw new Error(`Workflow '${WORKFLOW_FILE_NAME}' does not have 'workflow_dispatch' trigger. Add 'workflow_dispatch:' to the 'on:' section of your workflow file.`)
            }
          } catch (contentError) {
            console.error('Could not check workflow content:', contentError)
          }

          const defaultBranch = await this.getDefaultBranch()
          throw new Error(`Workflow exists but trigger failed. The default branch is '${defaultBranch}'. Make sure this branch exists and the workflow file is present on it.`)
        } catch (listError) {
          console.error('Failed to get workflow details:', listError)
        }
      }

      throw error
    }
  }
}