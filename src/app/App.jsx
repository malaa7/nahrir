import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AudioProvider } from '../contexts/AudioContext';

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
    <AudioProvider>
    <RouterProvider router={router} />
    </AudioProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}
