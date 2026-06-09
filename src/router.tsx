import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { TenantIntake } from './pages/TenantIntake';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/:tenant/intake', element: <TenantIntake /> },
]);
