import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { Landing } from './components/Landing';
import { Support } from './components/Support';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { AppBackground } from './components/ui/Backgrounds';
import { LocalizationProvider } from './hooks/useLocalization';
import './index.css';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      <AppBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function LandingRoute() {
  const navigate = useNavigate();
  return (
    <PageShell>
      <Landing onStartLearning={() => navigate('/app/tactics')} />
    </PageShell>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <LandingRoute /> },
  { path: '/support', element: <PageShell><Support /></PageShell> },
  { path: '/privacy', element: <PageShell><PrivacyPolicy /></PageShell> },
  { path: '/app/*', element: <App /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalizationProvider>
      <RouterProvider router={router} />
    </LocalizationProvider>
  </StrictMode>
);
