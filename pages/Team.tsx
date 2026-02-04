
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AppView, User, TeamMember, AppNotification } from '../types';

interface TeamProps {
  onNavigate: (view: AppView) => void;
  user: User | null;
  members: TeamMember[];
  onUpdateMembers: (updatedMembers: TeamMember[]) => void;
  onDeleteMember?: (member: TeamMember) => void;
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
}

const Team: React.FC<TeamProps> = ({
  onNavigate, user, members, onUpdateMembers, onDeleteMember, notifications, onMarkNotificationsAsRead
}) => {
  const isLeader = user?.role === 'Leader';

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Musician',
    status: 'Activo' as 'Activo' | 'Descanso' | 'Pendiente',
    instrument: '',
    avatar: '',
    username: '',
    password: ''
  });

  const handleToggleStatus = (id: string) => {
    if (!isLeader) return;
    onUpdateMembers(members.map(m =>
      m.id === id ? { ...m, status: m.status === 'Activo' ? 'Descanso' : 'Activo' } : m
    ));
  };

  const handleOpenModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        ...formData,
        ...member,
        username: '', // Not needed for edit usually, or we could fetch it
        password: ''
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: 'Musician',
        status: 'Activo',
        instrument: '',
        avatar: '',
        username: '',
        password: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      onUpdateMembers(members.map(m => m.id === editingMember.id ? { ...m, ...formData } as TeamMember : m));
    }
    setShowModal(false);
  };

  const filteredMembers = activeFilter === 'Todos'
    ? members
    : members.filter(m => {
      if (activeFilter === 'Voces') return m.instrument === 'Voz';
      if (activeFilter === 'Teclas') return m.instrument === 'Piano';
      if (activeFilter === 'Percusión') return m.instrument === 'Batería';
      if (activeFilter === 'Liderazgo') return m.role !== 'Musician';
      return true;
    });

  return (
    <Layout
      activeView={AppView.TEAM}
      onNavigate={onNavigate}
      user={user}
      title="Directorio del Equipo"
      notifications={notifications}
      onMarkRead={onMarkNotificationsAsRead}
    >
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-slate-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Ministerio de Alabanza</p>
          <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Miembros del Ministerio</h1>
        </div>

      </div>

      <div className="flex flex-wrap gap-3 mb-8 items-center">
        <span className="text-sm font-bold text-slate-500 mr-2">Filtrar por:</span>
        {['Todos', 'Voces', 'Percusión', 'Teclas', 'Liderazgo'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex h-9 items-center justify-center gap-2 rounded-full px-5 shadow-sm transition-all border ${activeFilter === filter
              ? 'bg-primary text-white border-primary'
              : 'bg-white dark:bg-gray-800 text-slate-900 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
              }`}
          >
            <span className="text-sm font-semibold">{filter}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className={`group relative flex flex-col bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border-2 transition-all duration-300 hover:shadow-md ${member.status === 'Activo' ? 'border-accent-gold/20' : 'border-transparent opacity-80'
              }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div
                onClick={() => handleToggleStatus(member.id)}
                className={`flex h-6 items-center gap-1.5 rounded-full px-2.5 cursor-pointer transition-colors ${member.status === 'Activo' ? 'bg-accent-gold/10 hover:bg-accent-gold/20' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                  }`}
              >
                <span className={`size-1.5 rounded-full ${member.status === 'Activo' ? 'bg-accent-gold' : 'bg-gray-400'}`}></span>
                <p className={`${member.status === 'Activo' ? 'text-accent-gold' : 'text-gray-500'} text-[10px] font-bold uppercase tracking-widest leading-none`}>
                  {member.status}
                </p>
              </div>
              {isLeader && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="text-gray-400 hover:text-primary transition-colors h-6 w-6 flex items-center justify-center"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined !text-lg">edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!onDeleteMember) return;
                      if (confirm(`¿Eliminar la cuenta de ${member.name}? Esta acción no se puede deshacer.`)) {
                        onDeleteMember(member);
                      }
                    }}
                    className="px-2.5 h-7 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                    title="Eliminar cuenta"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div
                  className={`size-24 bg-center bg-no-repeat bg-cover rounded-full ring-4 ${member.status === 'Activo' ? 'ring-accent-gold/20' : 'ring-gray-100 dark:ring-gray-800 grayscale'
                    }`}
                  style={{ backgroundImage: `url(${member.avatar})` }}
                ></div>
                {member.isOnline && (
                  <div className="absolute bottom-1 right-1 size-5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                )}
                {member.isConfirmed && (
                  <div className="absolute -top-1 -right-1 size-7 bg-emerald-500 text-white border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center shadow-lg animate-bounce-subtle">
                    <span className="material-symbols-outlined text-[14px] font-black">check</span>
                  </div>
                )}
              </div>
              <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">{member.name}</h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-1">{member.role}</p>
              <p className="text-primary dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6">{member.instrument}</p>

              <div className="w-full flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Activar / Desactivar</span>
                <div className="flex items-center gap-2">
                  <div
                    onClick={() => handleToggleStatus(member.id)}
                    className={`w-10 h-5 rounded-full relative transition-all shadow-inner ${member.status === 'Activo' ? 'bg-primary cursor-pointer' : 'bg-gray-200 dark:bg-gray-700 cursor-pointer text-right'
                      } ${!isLeader ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`absolute top-0.5 size-4 rounded-full bg-white transition-all shadow-sm ${member.status === 'Activo' ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Músico */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1a2130] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center text-center">
              <h3 className="text-xl font-bold text-church-navy dark:text-white">
                Editar Perfil
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-church-navy transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                <input
                  required autoFocus
                  className="form-input w-full rounded-lg text-church-navy dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm font-normal outline-none focus:ring-1 focus:ring-primary"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Instrumento / Área</label>
                  <input
                    required placeholder="e.g. Piano, Bajo, Voz..."
                    className="form-input w-full rounded-lg text-church-navy dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm font-normal outline-none"
                    value={formData.instrument}
                    onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cargo</label>
                  <select
                    className="form-input w-full rounded-lg text-church-navy dark:text-white border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm font-normal outline-none"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="Musician">Músico / Voz</option>
                    <option value="Leader">Líder</option>
                  </select>
                </div>
              </div>


              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Estado Inicial</label>
                <div className="flex gap-4 p-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="status" checked={formData.status === 'Activo'}
                      onChange={() => setFormData({ ...formData, status: 'Activo' })}
                    />
                    <span className="text-sm font-bold text-accent-gold">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="status" checked={formData.status === 'Descanso'}
                      onChange={() => setFormData({ ...formData, status: 'Descanso' })}
                    />
                    <span className="text-sm font-bold text-gray-500">Descanso</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 h-10 rounded-lg text-slate-500 text-sm font-bold">Cancelar</button>
                <button type="submit" className="px-8 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Team;
