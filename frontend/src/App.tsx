import { useAuth } from './hooks/useAuth';
import { AuthGate } from './components/auth/AuthGate';
import { AppShell } from './components/layout/AppShell';
import { Loader } from './components/chat/Loader';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const auth = useAuth();

  return (
    <ThemeProvider>
      {auth.initializing ? (
        <div className="flex h-screen w-full items-center justify-center bg-canvas">
          <Loader size={28} />
        </div>
      ) : !auth.user ? (
        <AuthGate auth={auth} />
      ) : (
        <AppShell auth={auth} />
      )}
    </ThemeProvider>
  );
}
