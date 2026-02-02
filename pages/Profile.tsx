
import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { AppView, User, AppNotification } from '../types';

interface ProfileProps {
    onNavigate: (view: AppView) => void;
    user: User | null;
    onUpdateUser: (updatedUser: User) => void;
    notifications?: AppNotification[];
    onMarkNotificationsAsRead?: () => void;
    onLogout?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, user, onUpdateUser, notifications, onMarkNotificationsAsRead, onLogout }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
        instrument: user?.instrument || ''
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        // Simulate API call
        setTimeout(() => {
            if (user) {
                onUpdateUser({
                    ...user,
                    ...formData
                });
            }
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 800);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, avatar: value });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Layout
            activeView={AppView.PROFILE}
            onNavigate={onNavigate}
            user={user}
            title="Mi Perfil"
            notifications={notifications}
            onMarkRead={onMarkNotificationsAsRead}
            onLogout={onLogout}
        >
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-slate-100 dark:border-gray-800 overflow-hidden">
                    {/* Header/Cover */}
                    <div className="h-32 bg-gradient-to-r from-primary to-accent-gold relative">
                        <div className="absolute -bottom-12 left-8">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="relative group" onClick={triggerFileSelect}>
                                <div className="size-24 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-lg cursor-pointer transition-transform hover:scale-105 active:scale-95">
                                    <img
                                        src={formData.avatar || "https://picsum.photos/seed/user/200/200"}
                                        alt="Current Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-8 bg-white dark:bg-gray-800 rounded-full shadow-md border border-slate-100 dark:border-gray-700 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="mb-8">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name}</h1>
                            <p className="text-primary font-bold">{user?.role === 'Leader' ? user.title : user?.instrument}</p>
                        </div>

                        {showSuccess && (
                            <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 animate-fade-in">
                                <span className="material-symbols-outlined">check_circle</span>
                                <p className="text-sm font-bold">¡Perfil actualizado correctamente!</p>
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Instrumento / Área</label>
                                    <input
                                        type="text"
                                        disabled={user?.role === 'Leader'}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/50 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60"
                                        value={formData.instrument}
                                        onChange={e => setFormData({ ...formData, instrument: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Foto de Perfil</label>
                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">RECOMENDADO</span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={triggerFileSelect}
                                        className="flex-1 h-12 px-6 rounded-xl bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined">gallery_thumbnail</span>
                                        Elegir de Galería
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, avatar: `https://picsum.photos/seed/${Math.random()}/200/200` })}
                                        className="h-12 px-4 rounded-xl border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-500 transition-all flex items-center gap-2"
                                        title="Generar aleatoria"
                                    >
                                        <span className="material-symbols-outlined">shuffle</span>
                                        <span className="text-xs font-bold hidden md:inline">Aleatoria</span>
                                    </button>
                                </div>

                                <div className="pt-3 border-t border-slate-200 dark:border-gray-700">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight mb-2">O usar enlace directo (URL)</p>
                                    <input
                                        type="text"
                                        placeholder="https://ejemplo.com/foto.jpg"
                                        className="w-full h-10 px-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-slate-600 dark:text-slate-400 text-xs font-medium outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                                        value={formData.avatar}
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-gray-800 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => onNavigate(AppView.DASHBOARD)}
                                    className="px-6 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-10 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSaving ? (
                                        <>
                                            <span className="animate-spin size-4 border-2 border-white/20 border-t-white rounded-full"></span>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined">save</span>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Info */}
                <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800 flex items-start gap-4">
                    <span className="material-symbols-outlined text-amber-600">security</span>
                    <div>
                        <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Seguridad de la cuenta</p>
                        <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed mt-1">
                            Tu contraseña es de uso personal. Si necesitas cambiarla o no puedes acceder a ciertas secciones, contacta con Bladimir Acosta.
                        </p>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800 flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-red-600">warning</span>
                        <div>
                            <p className="text-sm font-bold text-red-900 dark:text-red-400">Zona de Peligro</p>
                            <p className="text-xs text-red-700 dark:text-red-500 leading-relaxed mt-1">
                                Estas acciones son irreversibles y afectarán a toda la plataforma. Procede con precaución.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onLogout ? onLogout() : onNavigate(AppView.LOGIN)}
                            className="flex-1 whitespace-nowrap px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            CERRAR SESIÓN
                        </button>

                        <button
                            onClick={() => {
                                if (confirm("¿ESTÁS SEGURO? Esta acción borrará todas las canciones, avisos y eventos de la plataforma. Esta operación no se puede deshacer.")) {
                                    const keys = [
                                        'youth_ministry_notifications',
                                        'youth_ministry_songs',
                                        'youth_ministry_notices',
                                        'youth_ministry_events'
                                    ];
                                    keys.forEach(k => localStorage.removeItem(k));
                                    window.location.reload();
                                }
                            }}
                            className="whitespace-nowrap px-6 py-3 rounded-xl bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-black hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">restart_alt</span>
                            BORRAR TODO
                        </button>
                    </div>
                </div>
            </div>
        </Layout >
    );
};

export default Profile;
