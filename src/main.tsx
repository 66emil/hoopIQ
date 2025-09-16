import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Landing } from './components/Landing';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <Landing onStartLearning={() => { window.location.href = '/app/tactics'; }} /> },
  { path: '/app/*', element: <App /> }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
