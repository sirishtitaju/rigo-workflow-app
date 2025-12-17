import axios, { AxiosError } from 'axios'

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''
const OWNER = 'sirishtitaju'
const REPO = 'rigo-automation'
const WORKFLOW_FILE_NAME = '.github/workflows/node.js.yml'
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

  async triggerWorkflow(): Promise<void> {
    try {
      await githubApi.post(
        `/repos/${OWNER}/${REPO}/actions/workflows/${encodeURIComponent(WORKFLOW_FILE_NAME)}/dispatches`,
        { ref: REF },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (error) {
      console.error('Failed to trigger workflow:', error)
      throw error
    }
  }
}