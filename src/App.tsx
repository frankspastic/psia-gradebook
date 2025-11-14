import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';
import EmailComposer from './pages/EmailComposer';
import Settings from './pages/Settings';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinkClass = (path: string) => {
    return `px-4 py-2 rounded-lg ${
      isActive(path)
        ? 'text-black-700'
        : 'text-gray-700'
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-700">PSIA Gradebook</h1>
          <p className="text-sm text-gray-500 mt-1">Class Management</p>
        </div>
        <nav className="px-4 space-y-2">
          <Link to="/" className={navLinkClass('/')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">📊</span>
              <span>Dashboard</span>
            </div>
          </Link>
          <Link to="/classes" className={navLinkClass('/classes')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">🎓</span>
              <span>Classes</span>
            </div>
          </Link>
          <Link to="/students" className={navLinkClass('/students')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">👥</span>
              <span>Students</span>
            </div>
          </Link>
          <Link to="/assignments" className={navLinkClass('/assignments')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">📝</span>
              <span>Assignments</span>
            </div>
          </Link>
          <Link to="/grades" className={navLinkClass('/grades')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">📈</span>
              <span>Grades</span>
            </div>
          </Link>
          <Link to="/email" className={navLinkClass('/email')}>
            <div className="flex items-center">
              <span className="text-xl mr-3">✉️</span>
              <span>Send Email</span>
            </div>
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <Link to="/settings" className={navLinkClass('/settings')}>
              <div className="flex items-center">
                <span className="text-xl mr-3">⚙️</span>
                <span>Settings</span>
              </div>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:classId" element={<Students />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/assignments/:classId" element={<Assignments />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/grades/:classId" element={<Grades />} />
          <Route path="/email" element={<EmailComposer />} />
          <Route path="/email/:classId" element={<EmailComposer />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
