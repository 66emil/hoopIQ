import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import { Landing } from './components/Landing';
import './index.css';

function LandingRoute() {
  const navigate = useNavigate();
  return <Landing onStartLearning={() => navigate('/app/tactics')} />;
}

const router = createBrowserRouter([
  { path: '/', element: <LandingRoute /> },
  { path: '/app/*', element: <App /> }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
