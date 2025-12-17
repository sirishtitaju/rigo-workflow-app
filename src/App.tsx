import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ThemeProvider } from './contexts/ThemeContext'
import Explore from './pages/Explore'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}

export default App