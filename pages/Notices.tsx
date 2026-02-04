
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AppView, User, MinistryNotice, AppNotification } from '../types';
import { notifyLeaderAction } from '../utils/notifications';

interface NoticesProps {
  onNavigate: (view: AppView) => void;
  user: User | null;
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
  onAddNotification?: (type: 'song' | 'notice' | 'event', title: string, message: string) => void;
  notices: MinistryNotice[];
  onAddNotice: (notice: Partial<MinistryNotice>) => void;
  onUpdateNotice: (notice: MinistryNotice) => void;
  onDeleteNotice: (id: string) => void;
}

const Notices: React.FC<NoticesProps> = ({
  onNavigate,
  user,
  notifications,
  onMarkNotificationsAsRead,
  onAddNotification,
  notices,
  onAddNotice,
  onUpdateNotice,
  onDeleteNotice
}) => {
  const isLeader = user?.role === 'Leader';

  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<MinistryNotice | null>(null);
  const [formData, setFormData] = useState<Partial<MinistryNotice>>({
    title: '', content: '', category: 'General', isPinned: false
  });

  const handleOpenModal = (notice?: MinistryNotice) => {
    if (notice) {
      setEditingNotice(notice);
      setFormData(notice);
    } else {
      setEditingNotice(null);
      setFormData({ title: '', content: '', category: 'General', isPinned: false });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      onUpdateNotice({ ...editingNotice, ...formData } as MinistryNotice);
    } else {
      const newNoticeData: Partial<MinistryNotice> = {
        ...formData as MinistryNotice,
        date: new Date().toISOString().split('T')[0],
        author: user?.name || 'Administración'
      };
      onAddNotice(newNoticeData);

      // Notify team
      notifyLeaderAction(user?.name || 'Administración', 'notice', formData.title || '');
      if (onAddNotification) {
        onAddNotification('notice', 'Nuevo Aviso Oficial', `${user?.name || 'Administración'} acaba de publicar: ${formData.title}`);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Eliminar el aviso oficial "${title}"?`)) {
      onDeleteNotice(id);
      if (onAddNotification) {
        onAddNotification('notice', 'Aviso Eliminado', `${user?.name || 'Administración'} ha eliminado el aviso: ${title}`);
      }
    }
  };

  const categories: MinistryNotice['category'][] = ['Leadership', 'Music Team', 'Community', 'General'];

  return (
    <Layout
      activeView={AppView.NOTICES}
      onNavigate={onNavigate}
      user={user}
      title="Avisos del Ministerio"
      notifications={notifications}
      onMarkRead={onMarkNotificationsAsRead}
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-slate-900 dark:text-white text-4xl font-extrabold tracking-tight mb-3">Avisos Oficiales</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light leading-relaxed">
            Comunicados de la directiva y anuncios importantes para el ministerio.
          </p>
        </div>

        {isLeader && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-xl">campaign</span>
            Publicar Aviso
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {[...notices].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)).map(notice => (
          <div
            key={notice.id}
            className={`group relative flex gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-xl border transition-all animate-fade-in ${notice.isPinned ? 'border-primary/30 bg-primary/[0.02]' : 'border-slate-100 dark:border-slate-800'
              }`}
          >
            <div className="hidden sm:flex flex-col items-center">
              <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${notice.category === 'Leadership' ? 'bg-primary/10 text-primary' :
                notice.category === 'Music Team' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                <span className="material-symbols-outlined">{
                  notice.category === 'Leadership' ? 'diversity_3' :
                    notice.category === 'Music Team' ? 'music_note' : 'notifications'
                }</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${notice.category === 'Leadership' ? 'text-primary bg-primary/10' :
                    notice.category === 'Music Team' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                    }`}>{notice.category}</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{notice.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="material-symbols-outlined text-primary text-xl" title="Fijado">push_pin</span>
                  )}
                  {isLeader && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(notice)} className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={() => handleDelete(notice.id, notice.title)} className="p-1 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-3xl whitespace-pre-wrap">
                {notice.content}
              </p>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="material-symbols-outlined text-base">person</span>
                  {notice.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">calendar_today</span>
                  {notice.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-800/30">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingNotice ? 'Editar Aviso' : 'Publicar Nuevo Aviso'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título del Aviso</label>
                <input
                  required autoFocus placeholder="e.g. Reunión Urgente de Directiva"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
                  <select
                    className="w-full h-12 px-3 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none cursor-pointer"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="size-5 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                      checked={formData.isPinned}
                      onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                    />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">Fijar en la parte superior</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contenido del Mensaje</label>
                <textarea
                  required
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none min-h-[160px] resize-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                  placeholder="Escribe el comunicado oficial aquí..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 h-12 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-100 transition-all">Cancelar</button>
                <button type="submit" className="px-10 h-12 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Publicar Ahora</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Notices;
