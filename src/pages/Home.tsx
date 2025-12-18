import { useEffect, useState, useCallback } from 'react'
import { githubService } from '../services/githubApi'
import CorsNotice from '../components/CorsNotice'
import './Home.css'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [automationEnabled, setAutomationEnabled] = useState<boolean | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [lastRunTime, setLastRunTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCorsNotice, setShowCorsNotice] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  const fetchAllStatus = useCallback(async () => {
    setRefreshing(true)
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        checkWorkflowStatus(),
        loadAutomation(),
      ])
    } catch (error) {
      console.error('Error fetching status', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch status'
      setError(errorMessage)

      // Show CORS notice if it's a network/CORS error
      if (errorMessage.includes('CORS') || errorMessage.includes('Network error')) {
        setShowCorsNotice(true)
      }

      // Enable demo mode if API is not accessible
      if (!demoMode) {
        setDemoMode(true)
        setAutomationEnabled(true)
        setIsRunning(false)
        setLastRunTime(new Date().toISOString())
        setLastAction('checkout')
      }
    }

    setRefreshing(false)
    setLoading(false)
  }, [demoMode])

  useEffect(() => {
    fetchAllStatus()
  }, [fetchAllStatus])

  const getExpectedRunType = () => {
    const utcHour = new Date().getUTCHours()
    if (utcHour === 3) return '🟢 Check-In is expected now'
    if (utcHour === 12) return '🟢 Check-Out is expected now'
    return '⏳ Not check-in or check-out time'
  }

  const loadAutomation = useCallback(async () => {
    try {
      const config = await githubService.loadAutomation()
      setAutomationEnabled(config.enabled)
      setLastRunTime(config.lastRun ?? null)
      setLastAction(config.action ?? null)
    } catch (err) {
      console.error('Failed to load automation config:', err)
      throw err
    }
  }, [])

  const updateAutomationState = async (newEnabled: boolean) => {
    if (demoMode) {
      // Demo mode - simulate the action
      setAutomationEnabled(newEnabled)
      setLastRunTime(new Date().toISOString())
      setLastAction('checkout')
      alert(`[DEMO] Automation turned ${newEnabled ? 'on' : 'off'}`)
      return
    }

    try {
      setError(null)
      const newContent = await githubService.updateAutomationState(newEnabled)

      alert(`Automation turned ${newEnabled ? 'on' : 'off'}`)
      setAutomationEnabled(newContent.enabled)
      setLastRunTime(newContent.lastRun ?? null)
      setLastAction(newContent.action ?? null)
    } catch (err) {
      console.error('Failed to update automation state:', err)
      const errorMessage = err instanceof Error ? err.message : 'Could not update automation state.'
      setError(errorMessage)
      alert(errorMessage)
    }
  }

  const checkWorkflowStatus = useCallback(async () => {
    try {
      const { isRunning } = await githubService.checkWorkflowStatus()
      setIsRunning(isRunning)
    } catch (err) {
      console.error('Failed to check workflow status:', err)
      throw err
    }
  }, [])

  const debugWorkflow = async () => {
    if (demoMode) {
      alert('[DEMO] Debug mode not available in demo')
      return
    }

    try {
      setError(null)
      console.log('=== WORKFLOW DEBUG INFO ===')

      // Get workflows
      const workflows = await githubService.listWorkflows()
      console.log('Available workflows:', workflows)

      // Get default branch
      const defaultBranch = await githubService.getDefaultBranch()
      console.log('Default branch:', defaultBranch)

      // Check specific workflow file
      const workflowCheck = await githubService.checkWorkflowFile()
      console.log('Workflow file check:', workflowCheck)

      // Build debug message
      let debugMessage = `Debug Info:\n\nDefault Branch: ${defaultBranch}\n\n`

      if (workflows.length === 0) {
        debugMessage += 'No workflows found in repository!'
      } else {
        debugMessage += `Available Workflows (${workflows.length}):\n`
        workflows.forEach(w => {
          debugMessage += `• ${w.name} (${w.path}) - ${w.state}\n`
        })
      }

      debugMessage += `\nTarget Workflow: .github/workflows/node.js.yml\n`
      debugMessage += `• Exists: ${workflowCheck.exists ? 'Yes' : 'No'}\n`
      debugMessage += `• Has workflow_dispatch: ${workflowCheck.hasDispatch ? 'Yes' : 'No'}\n`

      if (!workflowCheck.exists) {
        debugMessage += '\n❌ The workflow file does not exist!'
      } else if (!workflowCheck.hasDispatch) {
        debugMessage += '\n❌ The workflow file exists but does not have workflow_dispatch trigger!'
      } else {
        debugMessage += '\n✅ Workflow file looks good!'
      }

      alert(debugMessage)

    } catch (err) {
      console.error('Debug failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Debug failed'
      alert(`Debug Error: ${errorMessage}`)
    }
  }

  const triggerWorkflow = async () => {
    if (demoMode) {
      // Demo mode - simulate the action
      alert('[DEMO] Workflow manually triggered!')
      setIsRunning(true)
      // Simulate workflow completion after 3 seconds
      setTimeout(() => setIsRunning(false), 3000)
      return
    }

    try {
      setError(null)
      await githubService.triggerWorkflow()
      alert('Workflow manually triggered!')
      setIsRunning(true)
    } catch (err) {
      console.error('Failed to trigger workflow:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger workflow.'
      setError(errorMessage)
      alert(errorMessage)
    }
  }

  return (
    <>
      {showCorsNotice && (
        <CorsNotice onDismiss={() => setShowCorsNotice(false)} />
      )}

      <div className="home-container">
        <div className="refresh-controls">
          <button
            onClick={fetchAllStatus}
            disabled={refreshing}
            className="refresh-button"
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        <h1 className="heading">
          🧠 RigoHR Automation
          {demoMode && <span className="demo-badge">DEMO MODE</span>}
        </h1>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button
              onClick={() => setError(null)}
              className="error-close"
              aria-label="Close error"
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="card">
              <div className="status-item">
                <span className="label">Automation Status:</span>
                <span className="status">
                  {automationEnabled ? '✅ Enabled' : '❌ Disabled'}
                </span>
              </div>

              <div className="status-item">
                <span className="label">Workflow Status:</span>
                <span className="status">
                  {isRunning ? '🟢 Running' : '🔴 Not Running'}
                </span>
              </div>

              <div className="status-item">
                <span className="label">Last Automation Run:</span>
                <span className="status">
                  {lastRunTime ? new Date(lastRunTime).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  }) : 'N/A'}
                </span>
              </div>

              <div className="status-item">
                <span className="label">Last Action Run:</span>
                <span className="status">
                  {lastAction ? lastAction.charAt(0).toUpperCase() + lastAction.slice(1) : 'N/A'}
                </span>
              </div>

              <div className="status-item">
                <span className="label">Expected Run:</span>
                <span className="status">{getExpectedRunType()}</span>
              </div>
            </div>

            <div className="button-group">
              <button
                className={`action-button ${automationEnabled ? 'danger' : 'success'}`}
                onClick={() => updateAutomationState(!automationEnabled)}
              >
                {automationEnabled ? '🛑 Disable Automation' : '✅ Enable Automation'}
              </button>
            </div>

            <div className="button-group">
              <button
                className="action-button primary"
                onClick={triggerWorkflow}
                disabled={isRunning || !automationEnabled}
              >
                🚀 Trigger Workflow
              </button>
            </div>

            {!demoMode && (
              <div className="button-group">
                <button
                  className="action-button debug"
                  onClick={debugWorkflow}
                >
                  🔍 Debug Workflow Info
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}