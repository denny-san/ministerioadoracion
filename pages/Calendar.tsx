
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { AppView, User, MinistryEvent, AppNotification } from '../types';
import { notifyLeaderAction } from '../utils/notifications';

interface CalendarProps {
  onNavigate: (view: AppView) => void;
  user: User | null;
  notifications?: AppNotification[];
  onMarkNotificationsAsRead?: () => void;
  onAddNotification?: (type: 'song' | 'notice' | 'event', title: string, message: string) => void;
  events: MinistryEvent[];
  onAddEvent: (event: Partial<MinistryEvent>) => void;
  onUpdateEvent: (event: MinistryEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  onNavigate,
  user,
  notifications,
  onMarkNotificationsAsRead,
  onAddNotification,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const isLeader = user?.role === 'Leader';

  // Current date for navigation
  const [currentDate, setCurrentDate] = useState(new Date()); // Dynamic current date

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MinistryEvent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: 'Ensayo' as MinistryEvent['type'],
    notes: ''
  });

  // Calendar Helpers
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // CRUD Handlers
  const handleOpenModal = (event?: MinistryEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        date: event.date,
        time: event.time,
        type: event.type,
        notes: event.notes || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        date: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        time: '19:00',
        type: 'Ensayo',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      onUpdateEvent({ ...editingEvent, ...formData } as MinistryEvent);
    } else {
      const newEventData: Partial<MinistryEvent> = {
        ...formData as MinistryEvent
      };
      onAddEvent(newEventData);

      // Notify team
      notifyLeaderAction(user?.name || 'Administración', 'event', formData.title);
      if (onAddNotification) {
        onAddNotification('event', 'Nuevo Evento Agendado', `${user?.name || 'Administración'} ha programado: ${formData.title}`);
      }
    }
    setShowModal(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`¿Eliminar el evento "${title}"?`)) {
      onDeleteEvent(id);
      if (onAddNotification) {
        onAddNotification('event', 'Evento Cancelado', `${user?.name || 'Administración'} ha eliminado el evento: ${title}`);
      }
      setShowModal(false);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Ensayo': return 'bg-primary/10 text-primary border-primary';
      case 'Culto': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-500';
      case 'Actividad': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-500';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white border-slate-400';
    }
  };

  return (
    <Layout
      activeView={AppView.CALENDAR}
      onNavigate={onNavigate}
      user={user}
      title="Calendario"
      notifications={notifications}
      onMarkRead={onMarkNotificationsAsRead}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
            {monthNames[month]} {year}
          </p>
          <p className="text-slate-500 dark:text-gray-400 text-sm font-normal">Gestiona ensayos y servicios juveniles</p>
        </div>

        <div className="flex items-center gap-4">
          {isLeader && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-sm"
            >
              <span className="material-symbols-outlined">add</span>
              Nuevo Evento
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-xs font-bold uppercase hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all"
            >
              Hoy
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-all">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/20">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-gray-800 bg-slate-50/20 dark:bg-gray-800/5"></div>
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();

            return (
              <div
                key={dayNum}
                className={`min-h-[120px] p-2 border-r border-b border-slate-100 dark:border-gray-800 transition-colors hover:bg-slate-50/30 dark:hover:bg-gray-800/20 ${isToday ? 'bg-primary/5' : ''
                  }`}
              >
                <span className={`text-sm font-bold ${isToday ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full' : 'text-slate-400'
                  }`}>{dayNum}</span>

                <div className="mt-2 space-y-1">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleOpenModal(event)}
                      className={`${getTypeStyles(event.type)} text-[10px] font-bold px-2 py-1 rounded border-l-2 cursor-pointer hover:opacity-80 transition-opacity truncate shadow-sm`}
                      title={`${event.title} - ${event.time}`}
                    >
                      {event.time} {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Título</label>
                <input
                  autoFocus
                  required
                  disabled={!isLeader}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-70"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    disabled={!isLeader}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none disabled:opacity-70"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Hora</label>
                  <input
                    type="time"
                    required
                    disabled={!isLeader}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none disabled:opacity-70"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Evento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Ensayo', 'Culto', 'Actividad', 'Otro'].map(type => (
                    <button
                      key={type}
                      type="button"
                      disabled={!isLeader}
                      onClick={() => setFormData({ ...formData, type: type as MinistryEvent['type'] })}
                      className={`h-9 rounded-lg text-xs font-bold transition-all border ${formData.type === type
                        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                        : 'bg-slate-50 dark:bg-gray-800 text-slate-500 border-slate-200 dark:border-gray-700 hover:bg-slate-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Notas</label>
                <textarea
                  disabled={!isLeader}
                  className="w-full p-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none min-h-[80px] resize-none disabled:opacity-70"
                  placeholder="Detalles adicionales..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                {editingEvent && isLeader && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingEvent.id, editingEvent.title)}
                    className="px-4 h-10 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold transition-all"
                  >
                    Eliminar
                  </button>
                )}
                <div className="flex-1 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 h-10 rounded-lg text-slate-500 text-sm font-bold hover:bg-slate-100 dark:hover:bg-gray-800 transition-all"
                  >
                    {isLeader ? 'Cancelar' : 'Cerrar'}
                  </button>
                  {isLeader && (
                    <button
                      type="submit"
                      className="px-6 h-10 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Guardar
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Calendar;

