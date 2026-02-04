import React from 'react';
import Layout from '../components/Layout';
import { AppView, User, TeamMember, AppNotification, Song, MinistryNotice, MinistryEvent } from '../types';

interface DashboardProps {
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  user: User | null;
  members: TeamMember[];
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
  songs: Song[];
  notices: MinistryNotice[];
  events: MinistryEvent[];
}

const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onLogout,
  user,
  members,
  notifications,
  onMarkNotificationsAsRead,
  songs,
  notices,
  events
}) => {
  // Filter musicians and vocalists excluding main administrative leadership
  const musicians = members.filter(m => m.instrument !== 'Voz' && m.role !== 'Presidente' && m.role !== 'Vicepresidenta');
  const vocalists = members.filter(m => m.instrument === 'Voz' && m.role !== 'Presidente' && m.role !== 'Vicepresidenta');

  // Dynamic Stats Logic
  const now = new Date();
  const upcomingEvents = [...events].filter(e => new Date(e.date + 'T' + (e.time || '00:00')) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextGeneralEvent = upcomingEvents.find(e => e.type !== 'Ensayo');
  const nextRehearsal = upcomingEvents.find(e => e.type === 'Ensayo');

  const nextService = upcomingEvents.find(e => e.type === 'Culto');
  const serviceSetlist = songs.filter(s => s.category === 'Culto');

  const formatDateSimple = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
  };

  return (
    <Layout
      activeView={AppView.DASHBOARD}
      onNavigate={onNavigate}
      onLogout={onLogout}
      user={user}
      title="Dashboard de Liderazgo"
      notifications={notifications}
      onMarkNotificationsAsRead={onMarkNotificationsAsRead}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Bienvenido, {user?.name || 'Líder'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg mt-1 font-medium">
          {user?.title || 'Gestión de ministerio'} • Youth Ministry Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Próximo Evento</p>
            <span className="material-symbols-outlined text-primary">event</span>
          </div>
          {nextGeneralEvent ? (
            <>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{nextGeneralEvent.title}</h3>
              <p className="text-slate-900 dark:text-slate-300 font-semibold mt-1 capitalize">{formatDateSimple(nextGeneralEvent.date)}, {nextGeneralEvent.time}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">Programado</span>
              </div>
            </>
          ) : (
            <p className="text-slate-400 italic text-sm py-4">Sin eventos generales</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Próximo Ensayo</p>
            <span className="material-symbols-outlined text-primary">rebase_edit</span>
          </div>
          {nextRehearsal ? (
            <>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">{nextRehearsal.title}</h3>
              <p className="text-slate-900 dark:text-slate-300 font-semibold mt-1 capitalize">{formatDateSimple(nextRehearsal.date)}, {nextRehearsal.time}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold">Ensayo Semanal</span>
              </div>
            </>
          ) : (
            <p className="text-slate-400 italic text-sm py-4">Sin ensayos agendados</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Confirmaciones</p>
            <span className="material-symbols-outlined text-primary">check_circle</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {members.filter(m => m.isConfirmed).length} / {members.filter(m => m.role === 'Musician').length}
          </h3>
          <p className="text-slate-900 dark:text-slate-300 font-semibold mt-1">Equipo Confirmado</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${(members.filter(m => m.isConfirmed).length / (members.filter(m => m.role === 'Musician').length || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resumen de Actividad</h2>
        <button className="text-primary font-bold text-sm hover:underline">Ver todo</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Setlist */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Setlist: {nextService ? formatDateSimple(nextService.date) : 'Próximo Culto'}
            </h4>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">DOMINGO</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {serviceSetlist.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                No hay canciones asignadas para este domingo
              </div>
            ) : (
              serviceSetlist.map((song, index) => (
                <div key={song.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">{index + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white">{song.title}</p>
                    <p className="text-xs text-slate-500">{song.artist} • {song.key}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300">more_vert</span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 text-center border-t border-slate-100 dark:border-slate-700">
            <button className="text-sm font-bold text-primary hover:underline" onClick={() => onNavigate(AppView.SONGS)}>
              Gestionar Repertorio
            </button>
          </div>
        </div>

        {/* Team State */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Confirmación de Participación</h4>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">EQUIPO SEMANAL</span>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Musicians Group */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Músicos (Instrumentos)</p>
                <div className="space-y-3">
                  {musicians.map((member) => (
                    <div key={member.id} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700">
                        <img className="w-full h-full object-cover" src={member.avatar} alt={member.name} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{member.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{member.instrument}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${member.isConfirmed
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                            }`}>
                            {member.isConfirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocalists Group */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Voces</p>
                <div className="space-y-3">
                  {vocalists.map((member) => (
                    <div key={member.id} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 dark:border-slate-700">
                        <img className="w-full h-full object-cover" src={member.avatar} alt={member.name} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{member.name}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{member.instrument}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${member.isConfirmed
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                            }`}>
                            {member.isConfirmed ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all border border-slate-200 dark:border-slate-700">
              ENVIAR RECORDATORIO DE CONFIRMACIÓN
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Avisos Recientes</h2>
          <button className="text-primary font-bold text-sm hover:underline" onClick={() => onNavigate(AppView.NOTICES)}>Ver todos</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.length === 0 ? (
            <div className="col-span-full p-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
              <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">campaign</span>
              <p className="text-slate-500 font-medium italic">No hay avisos publicados</p>
            </div>
          ) : (
            notices.slice(0, 3).map(notice => (
              <div key={notice.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">{notice.title}</h4>
                  {notice.isPinned && <span className="material-symbols-outlined text-amber-500 text-sm">push_pin</span>}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{notice.content}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{notice.date}</span>
                  <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{notice.author}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout >
  );
};

export default Dashboard;

