
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Normalize email/username for comparison
    const searchVal = email.trim().toLowerCase();
    const user = users.find(u => {
      const dbUser = u.username.toLowerCase();
      const matchUsername = dbUser === searchVal || dbUser === `@${searchVal}` || `@${dbUser}` === searchVal;
      const matchEmail = u.email?.toLowerCase() === searchVal;
      const matchPass = u.password ? password === u.password : password === 'password123';

      if (matchUsername || matchEmail) {
        console.log("Usuario encontrado:", u.username, "Pass match:", matchPass);
      }

      return (matchUsername || matchEmail) && matchPass;
    });

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Usa tu @usuario y contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(rgba(185,28,28,0.9),rgba(127,29,29,0.95)),url('https://picsum.photos/seed/church/1920/1080')] bg-cover bg-center">
      <div className="w-full max-w-[450px] animate-fade-in">
        <div className="bg-white dark:bg-[#1a2130] rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/5">
          <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-accent-gold flex items-center justify-center bg-white shadow-lg overflow-hidden">
                <span className="text-primary material-symbols-outlined !text-4xl">church</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-church-navy dark:text-white tracking-tighter uppercase">MINISTERIO DE ADORACION</h1>
            <p className="text-[#636f88] dark:text-gray-400 text-sm mt-1 font-bold uppercase tracking-widest">Plataforma de Gestión</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[#111318] dark:text-gray-200 text-sm font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined !text-sm text-primary">person</span>
                Usuario o Correo
              </label>
              <input
                className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 placeholder:text-[#636f88] dark:placeholder:text-gray-500 px-4 text-sm font-normal transition-all"
                placeholder="@usuario o email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[#111318] dark:text-gray-200 text-sm font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined !text-sm text-primary">lock</span>
                  Contraseña
                </label>
                <button type="button" className="text-primary dark:text-red-400 text-xs font-medium hover:underline">¿Olvidaste tu contraseña?</button>
              </div>
              <input
                className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 placeholder:text-[#636f88] dark:placeholder:text-gray-500 px-4 text-sm font-normal transition-all"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" id="remember" type="checkbox" />
              <label className="text-xs text-[#636f88] dark:text-gray-400" htmlFor="remember">Recordar mi sesión</label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-base font-bold tracking-wide transition-all shadow-lg shadow-primary/20 border-b-2 border-accent-gold/40 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined !text-lg">progress_activity</span>
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <span className="material-symbols-outlined !text-lg">login</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-4 text-accent-gold material-symbols-outlined !text-xs">auto_awesome</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-xs text-[#636f88] dark:text-gray-400 italic">"Lead with heart, serve with joy."</p>
              <div className="flex justify-center gap-4">
                <button type="button" className="text-[#111318] dark:text-gray-300 text-xs font-semibold hover:text-primary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined !text-xs">help_outline</span>
                  Soporte
                </button>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <button type="button" className="text-[#111318] dark:text-gray-300 text-xs font-semibold hover:text-primary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined !text-xs">admin_panel_settings</span>
                  Admin
                </button>
              </div>
            </div>
          </form>
        </div>
        <p className="text-center mt-6 text-church-navy/60 dark:text-white/40 text-xs font-medium">
          © 2024 Youth Ministry Platform • <a className="underline hover:text-primary" href="#">Términos y Privacidad</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
