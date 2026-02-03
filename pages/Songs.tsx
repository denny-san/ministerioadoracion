
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AppView, User, Song, AppNotification, TeamMember } from '../types';
import { notifyLeaderAction } from '../utils/notifications';

interface SongsProps {
  onNavigate: (view: AppView) => void;
  user: User | null;
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
  onAddNotification?: (type: 'song' | 'notice' | 'event', title: string, message: string) => void;
  onConfirm?: (userId: string, confirmed: boolean) => void;
  songs: Song[];
  onAddSong: (song: Partial<Song>) => void;
  onUpdateSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  members: TeamMember[];
  onLogout?: () => void;
}

const Songs: React.FC<SongsProps> = ({
  onNavigate,
  user,
  notifications,
  onMarkNotificationsAsRead,
  onAddNotification,
  onConfirm,
  songs,
  onAddSong,
  onUpdateSong,
  onDeleteSong,
  members,
  onLogout
}) => {
  const leaderTitle = (user?.title || "").toLowerCase();
  const isWorshipLeader = user?.username === '@Solemny0109' || leaderTitle.includes('ador');
  const isMusician = user?.role === 'Musician';

  const currentMember = members?.find(m => {
    if (user?.username && m.username === user.username) return true;
    if (user?.name && m.name) {
      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normalize(m.name) === normalize(user.name);
    }
    return m.id === user?.id;
  });

  const liveConfirmed = currentMember?.isConfirmed || false;

  const [showModal, setShowModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [formData, setFormData] = useState<Partial<Song>>({
    title: '',
    artist: '',
    key: '',
    type: 'Adoración',
    category: 'Repertorio',
    notes: '',
    rehearsalDate: '',
    rehearsalTime: ''
  });


  const handleOpenModal = (song?: Song) => {
    if (song) {
      setEditingSong(song);
      setFormData(song);
    } else {
      setEditingSong(null);
      setFormData({ title: '', artist: '', key: '', type: 'Adoración', category: 'Repertorio', notes: '', rehearsalDate: '', rehearsalTime: '' });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSong) {
      onUpdateSong({ ...editingSong, ...formData } as Song);
    } else {
      const newSongData: Partial<Song> = {
        ...formData
      };
      if (newSongData.category !== 'Ensayo') {
        delete newSongData.rehearsalDate;
        delete newSongData.rehearsalTime;
      }
      onAddSong(newSongData);

      // Notify team (push + in-app) only for worship leader
      if (isWorshipLeader) {
        notifyLeaderAction(user?.name || 'Administración', 'song', formData.title || '');
        if (onAddNotification) {
          onAddNotification('song', 'Nueva Música', `${user?.name || 'Administración'} acaba de subir: ${formData.title}`);
        }
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Eliminar la canción "${title}"?`)) {
      onDeleteSong(id);
      if (onAddNotification) {
        onAddNotification('song', 'Canción Eliminada', `${user?.name || 'Administración'} ha eliminado: ${title}`);
      }
    }
  };

  const getMusicianNames = (assignedIdentifiers?: string[]) => {
    if (!assignedIdentifiers || assignedIdentifiers.length === 0) return 'Sin asignar';
    return assignedIdentifiers.map(id => {
      // Find member by username, name, or original ID
      const m = members.find(mbr => mbr.username === id || mbr.name === id || mbr.id === id);
      return m?.name;
    }).filter(Boolean).join(', ');
  };

  const categories: ('Ensayo' | 'Culto' | 'Repertorio')[] = ['Ensayo', 'Culto', 'Repertorio'];

  return (
    <Layout
      activeView={AppView.SONGS}
      onNavigate={onNavigate}
      user={user}
      title="Repertorio de Canciones"
      notifications={notifications}
      onMarkRead={onMarkNotificationsAsRead}
      onLogout={onLogout}
    >
      {isMusician && (
        <div className="mb-8">
          <div className={`p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border transition-all ${liveConfirmed
            ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-800'
            : 'bg-amber-50/50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-800'
            }`}>
            <div className="px-3">
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
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Setlist & Repertorio</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm">Gestionado por: {user?.username === '@Solemny0109' ? 'Solemny Matos' : 'Liderazgo'}</p>
        </div>

        {isWorshipLeader && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Nueva Canción
          </button>
        )}
      </div>

      <div className="space-y-12">
        {categories.map(cat => (
          <section key={cat}>
            <div className="flex items-center gap-2 mb-4 px-2">
              <span className="material-symbols-outlined text-primary">
                {cat === 'Ensayo' ? 'history_edu' : cat === 'Culto' ? 'church' : 'library_music'}
              </span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{cat === 'Ensayo' ? 'Ensayo (Jueves)' : cat === 'Culto' ? 'Culto (Domingo)' : 'Repertorio General'}</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-black text-slate-500">
                {songs.filter(s => s.category === cat).length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {songs.filter(s => s.category === cat).map(song => (
                <div
                  key={song.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">{song.type}</span>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{song.title}</h4>
                        <p className="text-sm text-slate-500">{song.artist}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-gray-800 px-2 py-1 rounded text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-gray-700">
                        {song.key}
                      </div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        <span className="truncate"><strong>Músicos:</strong> {getMusicianNames(song.assignedMusicians)}</span>
                      </div>
                      {song.tempo && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-sm">metronome</span>
                          <span><strong>Tempo:</strong> {song.tempo}</span>
                        </div>
                      )}
                    </div>

                    {isWorshipLeader && (
                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800 flex gap-2">
                        <button
                          onClick={() => handleOpenModal(song)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-slate-50 dark:bg-gray-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span> Editar
                        </button>
                        <button
                          onClick={() => handleDelete(song.id, song.title)}
                          className="flex items-center justify-center px-3 py-2 rounded-lg bg-slate-50 dark:bg-gray-800 text-red-500 hover:bg-red-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {songs.filter(s => s.category === cat).length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-100 dark:border-gray-800 rounded-xl">
                  <p className="text-slate-400 text-sm italic">No hay canciones en esta categoría</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Modal de Canción */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingSong ? 'Editar Canción' : 'Agregar Nueva Canción'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                  <input
                    required autoFocus
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Artista</label>
                  <input
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.artist}
                    onChange={e => setFormData({ ...formData, artist: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tono (Key)</label>
                  <input
                    required placeholder="e.g. G"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.key}
                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tempo</label>
                  <input
                    placeholder="e.g. 120 BPM"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.tempo || ''}
                    onChange={e => setFormData({ ...formData, tempo: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                  <select
                    className="w-full h-10 px-2 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as Song['type'] })}
                  >
                    <option value="Entrada">Entrada</option>
                    <option value="Adoración">Adoración</option>
                    <option value="Clímax">Clímax</option>
                    <option value="Ministración">Ministración</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Asignar a Lista</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat} type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`h-9 rounded-lg text-xs font-bold transition-all border ${formData.category === cat
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 dark:bg-gray-800 text-slate-500 border-slate-200 dark:border-gray-700'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {formData.category === 'Ensayo' && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programar Ensayo (Hora RD)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">D�a del Ensayo (RD)</label>
                      <input
                        type="date"
                        required
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.rehearsalDate || ''}
                        onChange={e => setFormData({ ...formData, rehearsalDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Hora del Ensayo (RD)</label>
                      <input
                        type="time"
                        required
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.rehearsalTime || ''}
                        onChange={e => setFormData({ ...formData, rehearsalTime: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex justify-between items-center mb-2">

                  <label className="text-xs font-bold text-slate-500 uppercase">Músicos Asignados</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allMusicians = members.filter(m => m.role === 'Musician').map(m => m.username);
                        setFormData({ ...formData, assignedMusicians: allMusicians });
                      }}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, assignedMusicians: [] })}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:underline"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
                  {members.filter(m => m.role === 'Musician').map(m => (
                    <button
                      key={m.id} type="button"
                      onClick={() => {
                        const current = formData.assignedMusicians || [];
                        const updated = current.includes(m.username)
                          ? current.filter(id => id !== m.username)
                          : [...current, m.username];
                        setFormData({ ...formData, assignedMusicians: updated });
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${(formData.assignedMusicians || []).includes(m.username)
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-slate-500 border border-slate-200 dark:border-gray-700'
                        }`}
                    >
                      {m.name} ({m.instrument})
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Link de Referencia (YouTube/Audio)</label>
                <div className="flex gap-2">
                  <input
                    placeholder="https://youtube.com/..."
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.referenceUrl || ''}
                    onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
                  />
                  {formData.referenceUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(formData.referenceUrl, '_blank')}
                      className="px-3 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Notas de Ministración</label>
                <textarea
                  placeholder="Instrucciones para los músicos..."
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-lg text-slate-500 text-sm font-bold">Cancelar</button>
                <button type="submit" className="px-8 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Guardar Canción</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Songs;
