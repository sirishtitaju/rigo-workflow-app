# CORS Solutions for GitHub API Access

When you run this React web application, you may encounter CORS (Cross-Origin Resource Sharing) errors when trying to access the GitHub API. This is a browser security feature that prevents web pages from making requests to different domains.

## 🚨 The Problem

The GitHub API doesn't allow direct access from web browsers due to CORS restrictions. This means API calls will fail with errors like:

- `Access to fetch at 'https://api.github.com/...' from origin 'http://localhost:5174' has been blocked by CORS policy`
- `Network Error`

## ✅ Solutions

### 1. Development Solutions (Quick & Easy)

#### Option A: Browser Extension (Recommended for Testing)

Install a CORS-disabling browser extension:

- **Chrome/Edge**: "CORS Unblock" or "Disable CORS"
- **Firefox**: "CORS Everywhere"

⚠️ **Warning**: Only use these extensions for development and disable them when browsing other sites.

#### Option B: Chrome with Disabled Security (Not Recommended)

```bash
# macOS/Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"

# Windows
chrome.exe --disable-web-security --user-data-dir="c:\temp\chrome_dev_session"
```

### 2. Production Solutions

#### Option A: Backend Proxy Server

Create a backend service that proxies requests to GitHub API:

```javascript
// Express.js example
app.use(
  '/api/github',
  createProxyMiddleware({
    target: 'https://api.github.com',
    changeOrigin: true,
    pathRewrite: {
      '^/api/github': '',
    },
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  })
);
```

#### Option B: Serverless Functions

Use Vercel Functions, Netlify Functions, or AWS Lambda:

```javascript
// Vercel function example (api/github/[...path].js)
export default async function handler(req, res) {
  const { path } = req.query;
  const apiPath = Array.isArray(path)
    ? path.join('/')
    : path;

  const response = await fetch(
    `https://api.github.com/${apiPath}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      method: req.method,
      body:
        req.method !== 'GET'
          ? JSON.stringify(req.body)
          : undefined,
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
}
```

#### Option C: GitHub Apps

Use GitHub Apps with proper OAuth flow instead of personal access tokens.

### 3. Alternative Approaches

#### Option A: GitHub CLI Integration

Use GitHub CLI commands and execute them via a backend service.

#### Option B: Desktop Application

Convert to an Electron app or use the original React Native version.

## 🎯 Current App Behavior

This app includes:

1. **Automatic CORS Detection**: Shows a helpful notice when CORS errors occur
2. **Demo Mode**: Simulates API responses when the real API is not accessible
3. **Development Proxy**: Configured in `vite.config.ts` for local development
4. **Error Handling**: Clear error messages and fallback behavior

## 🛠️ Quick Start for Development

1. Install a CORS browser extension
2. Run `npm run dev`
3. Open the app in your browser
4. The app will work normally with the GitHub API

## 📚 Learn More

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
