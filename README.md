# GitHub Workflow App

A React web application for managing GitHub workflow automation. This app was converted from an Expo React Native app to a pure React web application.

## Features

- 🧠 GitHub workflow automation management
- 🌙 Dark/Light theme support
- 📱 Responsive design
- ⚡ Fast development with Vite
- 🎯 TypeScript support

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Build for production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (theme, etc.)
├── pages/             # Page components
├── App.tsx            # Main app component with routing
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with CSS custom properties
- **Axios** - HTTP client for GitHub API

## Deployment

This app can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Any CDN**: Upload the `dist` folder contents

## Learn more

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
