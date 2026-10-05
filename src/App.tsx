import { HashRouter, Route, Routes } from 'react-router-dom';
import { ThemeToggle } from './components/common/ThemeToggle';
import { ToastContainer } from './components/common/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { TreeEditorPage } from './pages/TreeEditorPage';
import { TreeRunnerPage } from './pages/TreeRunnerPage';

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="fixed top-3 right-3 z-40">
          <ThemeToggle />
        </div>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/trees/:treeId/edit" element={<TreeEditorPage />} />
          <Route path="/trees/:treeId/run" element={<TreeRunnerPage />} />
        </Routes>
      </div>
      <ToastContainer />
    </HashRouter>
  );
}
