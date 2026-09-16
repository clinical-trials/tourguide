import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import PhoneApp from '../app/components/phone-app';
import '../app/globals.css';
import './fonts.css';

createRoot(document.getElementById('root')!).render(
  <>
    <Home />
    <PhoneApp />
  </>,
);
