import { useState, useEffect } from 'react';
import { NativeMacSideNotch } from './components/native/NativeMacSideNotch';
import { NativeMacDashboard } from './components/dashboard/NativeMacDashboard';

export default function App() {
  const [isDashboardPage, setIsDashboardPage] = useState<boolean>(() => {
    return (
      window.location.search.includes('page=dashboard') ||
      window.location.search.includes('page=settings') ||
      window.location.hash === '#dashboard' ||
      window.location.hash === '#settings'
    );
  });

  useEffect(() => {
    const handleHashChange = () => {
      setIsDashboardPage(
        window.location.search.includes('page=dashboard') ||
        window.location.search.includes('page=settings') ||
        window.location.hash === '#dashboard' ||
        window.location.hash === '#settings'
      );
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isDashboardPage) {
    return <NativeMacDashboard />;
  }

  return (
    <div className="w-full h-full bg-transparent select-none overflow-hidden relative flex items-start justify-end">
      {/* 100% PURE APPLE DYNAMIC NOTCH (TOP RIGHT) */}
      <NativeMacSideNotch />
    </div>
  );
}
