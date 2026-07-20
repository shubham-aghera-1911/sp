import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // A plain <Link to="/"> is a no-op (by design) when you're already on "/",
  // which can look broken. Using navigate() explicitly here, and only when
  // we're not already on the dashboard, makes the logo behave predictably
  // as a "go home" action from anywhere in the app.
  const goHome = () => {
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          onClick={goHome}
          className="flex items-center gap-2 font-display text-lg font-bold text-brand-600 transition-opacity hover:opacity-80 dark:text-brand-400"
          aria-label="Go to dashboard"
        >
          <LayoutGrid size={22} strokeWidth={2.5} />
          TaskFlow
        </button>

        {/* Theme toggle and sign-out live on the Profile page only — this
            keeps the dashboard/board header focused on the work itself. */}
        {user && (
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open profile"
          >
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
              {user.name.split(' ')[0]}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
