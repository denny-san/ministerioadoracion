
import React from 'react';
import { AppView, User, AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  user: User | null;
  title: string;
  notifications?: AppNotification[];
  onMarkRead?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, user, title, notifications = [], onMarkRead, onLogout }) => {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleToggleNotifications = () => {
    if (!showNotifications && unreadCount > 0 && onMarkRead) {
      onMarkRead();
    }
    setShowNotifications(!showNotifications);
  };

  const navItems = [
    { id: AppView.DASHBOARD, icon: 'dashboard', label: 'Dashboard', roles: ['Leader'] },
    { id: AppView.CALENDAR, icon: 'calendar_month', label: 'Calendario', roles: ['Leader', 'Musician'] },
    { id: AppView.SONGS, icon: 'music_note', label: 'Canciones', roles: ['Leader', 'Musician'] },
    { id: AppView.TEAM, icon: 'groups', label: 'Músicos', roles: ['Leader'] },
    { id: AppView.NOTICES, icon: 'notifications', label: 'Noticias', roles: ['Leader', 'Musician'] },
    { id: AppView.PROFILE, icon: 'account_circle', label: 'Mi Perfil', roles: ['Leader', 'Musician'] },
  ].filter(item => item.roles.includes(user?.role || 'Musician'));

  return (
    <div className="flex min-h-screen h-[100dvh] overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-64 bg-navy-dark flex-col justify-between p-6 shrink-0 border-r border-navy-dark/10">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-lg p-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-3xl font-black">church</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-base font-black leading-tight tracking-tighter uppercase">MINISTERIO DE ADORACION</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Panel de Control</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeView === item.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className={`material-symbols-outlined ${activeView === item.id ? 'text-white' : 'text-slate-500'} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </span>
                <span className="text-sm font-bold tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          {user?.role === 'Leader' && (
            <button
              onClick={() => onNavigate(AppView.DASHBOARD)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 bg-white/10 hover:bg-white/20 text-white text-sm font-black transition-all border border-white/10"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Nuevo Evento</span>
            </button>
          )}

          <button
            onClick={() => onLogout ? onLogout() : onNavigate(AppView.LOGIN)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-sm font-black transition-all border border-primary/20"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
        {/* Top Navbar */}
        <header className="flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden bg-primary rounded-lg p-1.5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">church</span>
            </div>
            <h2 className="text-slate-900 dark:text-white text-xl md:text-2xl font-black tracking-tighter truncate max-w-[60vw] md:max-w-none">{title}</h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="hidden sm:relative sm:block sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500"
                placeholder="Buscar..."
                type="text"
              />
            </div>

            <div className="flex items-center gap-2 relative">
              {/* Mobile Logout Button */}
              <button
                onClick={() => onLogout && onLogout()}
                className="md:hidden p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
                aria-label="Cerrar Sesión"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>

              <button
                onClick={handleToggleNotifications}
                className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 ring-1 ring-slate-200 dark:ring-slate-700'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="fixed inset-x-4 top-20 md:absolute md:right-0 md:top-full md:mt-2 md:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-slide-up">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Avisos</span>
                    <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-1 rounded-full">{unreadCount} nuevos</span>
                  </div>
                  <div className="max-h-[60vh] md:max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center">
                        <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">notifications_off</span>
                        <p className="text-sm font-bold text-slate-500">Todo al día</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex gap-4">
                            <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${n.type === 'song' ? 'bg-red-50 text-red-600' :
                              n.type === 'notice' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                              }`}>
                              <span className="material-symbols-outlined text-xl">
                                {n.type === 'song' ? 'library_music' : n.type === 'notice' ? 'campaign' : 'event'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight">{n.title}</p>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-tighter">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => onNavigate(AppView.PROFILE)} className="h-10 w-10 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden hover:ring-2 hover:ring-primary transition-all">
              <img className="w-full h-full object-cover" src={user?.avatar || "https://picsum.photos/seed/user/100/100"} alt="User Profile" />
            </button>
          </div>
        </header>

        <div className="p-5 md:p-10 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 px-4 pb-safe flex justify-around items-center h-20 z-40">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${activeView === item.id ? 'text-primary scale-110' : 'text-slate-400'
                }`}
            >
              <span className={`material-symbols-outlined text-2xl ${activeView === item.id ? 'fill-1 font-black' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate(AppView.PROFILE)}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${activeView === AppView.PROFILE ? 'text-primary scale-110' : 'text-slate-400'}`}
          >
            <div className={`size-6 rounded-full overflow-hidden border-2 transition-all ${activeView === AppView.PROFILE ? 'border-primary' : 'border-transparent'}`}>
              <img src={user?.avatar} className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Perfil</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
