
import React from 'react';
import Layout from '../components/Layout';
import { AppView, User, Song, AppNotification, MinistryNotice, TeamMember } from '../types';

interface MusicianViewProps {
  onNavigate: (view: AppView) => void;
  user: User | null;
  onConfirm: (userId: string, confirmed: boolean) => void;
  isConfirmed?: boolean;
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
  songs: Song[];
  notices: MinistryNotice[];
  members: TeamMember[];
}

const MusicianView: React.FC<MusicianViewProps> = ({
  onNavigate,
  user,
  onConfirm,
  isConfirmed: _unused, // We'll derive it from members list for real-time
  notifications,
  onMarkNotificationsAsRead,
  songs,
  notices,
  members // We need to add this to props
}) => {
  // Derive real-time confirmation status from the global members list
  // Derive real-time confirmation status and identity from the global members list
  // We use a robust matching strategy (username -> name normalization -> ID)
  const currentMember = members?.find(m => {
    if (user?.username && m.username === user.username) return true;
    if (user?.name && m.name) {
      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normalize(m.name) === normalize(user.name);
    }
    return m.id === user?.id;
  });

  const liveConfirmed = currentMember?.isConfirmed || false;

  // Filter assigned songs for the musician. 
  // We check for Username, Member ID, and Name to ensure 100% visibility for everyone.
  const mySongs = songs.filter(s => {
    if (!s.assignedMusicians) return false;
    const matchByUsername = user?.username && s.assignedMusicians.includes(user.username);
    const matchByMemberId = currentMember?.id && s.assignedMusicians.includes(currentMember.id);
    const matchByName = user?.name && s.assignedMusicians.includes(user.name);
    return matchByUsername || matchByMemberId || matchByName;
  });
  // Sort notices: pinned first, then by date descending
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <Layout
      activeView={AppView.MUSICIAN_VIEW}
      onNavigate={onNavigate}
      user={user}
      title="Mis Canciones & Ensayos"
      notifications={notifications}
      onMarkRead={onMarkNotificationsAsRead}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-4 border-b border-gray-200 dark:border-gray-800 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Hola, {user?.name}</p>
          <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
            <p className="text-base font-bold leading-normal">{user?.instrument} • {mySongs.length} canciones asignadas esta semana</p>
          </div>
        </div>

        {/* Participation Confirmation Section */}
        <div className={`p-1.5 rounded-2xl flex items-center gap-1 border transition-all ${liveConfirmed
          ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800'
          : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800'
          }`}>
          <div className="px-4 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mi Participación</p>
            <p className={`text-sm font-bold ${liveConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {liveConfirmed ? '✓ Confirmado' : '⚠ Pendiente'}
            </p>
          </div>
          <button
            onClick={() => onConfirm && user && onConfirm(user.id, !liveConfirmed)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg ${liveConfirmed
              ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-emerald-500/10'
              : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
              }`}
          >
            {liveConfirmed ? 'Cancelar' : 'Confirmar Mi Parte'}
          </button>
        </div>
      </div>

      <div className="space-y-10">

        {/* Rehearsal Section */}
        {mySongs.filter(s => s.category === 'Ensayo').length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 bg-slate-100 dark:bg-gray-800 p-3 rounded-lg border-l-4 border-slate-400">
              <span className="material-symbols-outlined">schedule</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ensayo Semanal</h2>
                <p className="text-xs text-slate-500 uppercase font-black">Jueves • 7:30 PM • Salón Principal</p>
              </div>
            </div>

            <div className="grid gap-6">
              {mySongs.filter(s => s.category === 'Ensayo').map(song => (
                <div key={song.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{song.type}</span>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{song.title}</h3>
                      <p className="text-slate-500">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tono</p>
                        <p className="text-lg font-black text-primary">{song.key}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/[0.03] dark:bg-primary/[0.05] p-4 rounded-xl border border-primary/10 mb-6">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Notas de Ministración</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{song.notes}"
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => song.referenceUrl && window.open(song.referenceUrl, '_blank')}
                      className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-black hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                      disabled={!song.referenceUrl}
                    >
                      <span className="material-symbols-outlined text-sm">play_circle</span>
                      {song.referenceUrl ? 'VER REFERENCIA' : 'SIN REFERENCIA'}
                    </button>
                    <button className="flex items-center gap-2 border border-slate-200 dark:border-gray-700 px-4 py-2 rounded-lg text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all">
                      <span className="material-symbols-outlined text-sm">description</span>
                      CIFRADO / LETRA
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Service Section */}
        {mySongs.filter(s => s.category === 'Culto').length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6 bg-primary/10 p-3 rounded-lg border-l-4 border-primary">
              <span className="material-symbols-outlined text-primary">church</span>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Servicio de Jóvenes</h2>
                <p className="text-xs text-primary uppercase font-black">Domingo • 6:30 PM</p>
              </div>
            </div>

            <div className="grid gap-6">
              {mySongs.filter(s => s.category === 'Culto').map(song => (
                <div key={song.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">{song.type}</span>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{song.title}</h3>
                      <p className="text-slate-500">{song.artist}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center px-4 py-2 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tono</p>
                        <p className="text-lg font-black text-primary">{song.key}</p>
                      </div>
                    </div>
                  </div>

                  {song.notes && (
                    <div className="bg-primary/[0.03] dark:bg-primary/[0.05] p-4 rounded-xl border border-primary/10 mb-6">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <span className="material-symbols-outlined text-sm">sticky_note_2</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Notas de Ministración</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                        "{song.notes}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4 text-center">
                    <button
                      onClick={() => song.referenceUrl && window.open(song.referenceUrl, '_blank')}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      disabled={!song.referenceUrl}
                    >
                      <span className="material-symbols-outlined">play_circle</span>
                      {song.referenceUrl ? 'REFERENCIA' : 'SIN LINK'}
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-slate-200 dark:border-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all">
                      <span className="material-symbols-outlined">description</span>
                      RECURSOS
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Leader Contact Section */}
      <div className="mt-16 p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="size-20 rounded-full bg-primary border-4 border-white/10 flex items-center justify-center shadow-2xl overflow-hidden shrink-0">
            <img src="https://picsum.photos/seed/solemny/200/200" alt="Solemny" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Tu Líder de Alabanza</p>
            <p className="text-3xl font-black">Solemny Matos</p>
            <p className="text-primary text-sm font-medium">@Solemny0109 • En línea ahora</p>
          </div>
        </div>
        <button className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl h-14 px-8 bg-primary text-white text-lg font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 relative z-10 scale-100 active:scale-95">
          <span className="material-symbols-outlined !text-2xl">chat_bubble</span>
          CONSULTAR DUDA
        </button>
      </div>
    </Layout>
  );
};

export default MusicianView;
