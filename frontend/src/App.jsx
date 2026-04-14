import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header style={{ 
          background: '#1a1a1a', 
          color: 'white', 
          padding: '1rem 2rem',
          marginBottom: '2rem'
        }}>
          <nav style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            display: 'flex',
            gap: '2rem',
            alignItems: 'center'
          }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
                RestoreFast
              </Link>
            </h1>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Projects
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
