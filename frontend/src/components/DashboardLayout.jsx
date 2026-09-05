import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';

export default function DashboardLayout() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.bgApp,
        color: theme.textMain,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          padding: '2rem 3rem',
          maxWidth: '1440px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          color: theme.textMain,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
