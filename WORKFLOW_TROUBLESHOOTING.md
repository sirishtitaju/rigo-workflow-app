# GitHub Workflow 422 Error Troubleshooting

When you encounter a **422 Unprocessable Entity** error when trying to trigger a GitHub workflow, it typically means the request was valid but couldn't be processed due to semantic issues.

## 🔍 Quick Diagnosis

Use the **🔍 Debug Workflow Info** button in the app to get detailed information about:

- Repository default branch
- Available workflows
- Whether your target workflow exists
- Whether it has the required `workflow_dispatch` trigger

## 🚨 Common Causes & Solutions

### 1. Workflow File Doesn't Exist

**Error**: `Workflow file '.github/workflows/node.js.yml' not found`

**Solution**:

- Check if the file exists in your repository
- Verify the exact filename (case-sensitive)
- Make sure it's in the `.github/workflows/` directory

### 2. Missing `workflow_dispatch` Trigger

**Error**: `Workflow does not have 'workflow_dispatch' trigger`

**Solution**: Add `workflow_dispatch:` to your workflow file:

```yaml
name: Node.js CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
  workflow_dispatch: # Add this line!

jobs:
  # your jobs here
```

### 3. Wrong Branch Name

**Error**: `Branch 'master' does not exist`

**Solution**:

- Most repositories now use `main` as the default branch
- The app automatically detects and uses the correct default branch
- Check your repository settings to confirm the default branch name

### 4. Workflow is Disabled

**Error**: `Workflow is not active (state: disabled)`

**Solution**:

- Go to your repository's Actions tab
- Find the workflow and enable it
- Make sure Actions are enabled for your repository

### 5. Insufficient Permissions

**Error**: `Access forbidden` or `Authentication failed`

**Solution**:

- Check your GitHub token has the required permissions:
  - `repo` (full repository access)
  - `workflow` (update GitHub Action workflows)
- Generate a new token if needed: https://github.com/settings/tokens

## 🛠️ Step-by-Step Fix

1. **Click the Debug Button**: Use the "🔍 Debug Workflow Info" button to see what's wrong

2. **Check Your Workflow File**: Make sure `.github/workflows/node.js.yml` exists and contains:

   ```yaml
   on:
     workflow_dispatch:
   ```

3. **Verify Branch**: Ensure you're using the correct default branch (usually `main`)

4. **Check Permissions**: Make sure your GitHub token has `repo` and `workflow` scopes

5. **Enable Actions**: Ensure GitHub Actions are enabled in your repository settings

## 📝 Example Working Workflow

Here's a minimal working workflow file (`.github/workflows/node.js.yml`):

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch: # This is required for manual triggering!

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

## 🔧 Testing Your Fix

1. Make the necessary changes to your workflow file
2. Commit and push the changes
3. Wait a moment for GitHub to process the changes
4. Try triggering the workflow again

## 📞 Still Having Issues?

If you're still getting 422 errors after following this guide:

1. Check the browser console for detailed error messages
2. Use the debug button to get specific information about your setup
3. Verify your repository exists and is accessible
4. Make sure you're not hitting GitHub API rate limits

## 🎯 Quick Checklist

- [ ] Workflow file exists at `.github/workflows/node.js.yml`
- [ ] Workflow file contains `workflow_dispatch:` trigger
- [ ] Using correct branch name (usually `main`)
- [ ] GitHub token has proper permissions
- [ ] Repository Actions are enabled
- [ ] Workflow is active (not disabled)

Use the debug button in the app to automatically check most of these items!
