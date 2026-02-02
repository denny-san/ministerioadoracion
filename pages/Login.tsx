
import React, { useState } from 'react';
import { User, UserRegistrationData } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (data: UserRegistrationData) => Promise<void>;
  users: User[];
  isLoading?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, users, isLoading }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  // Email removed as per user request
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'Leader' | 'Musician'>('Musician');
  const [regInstrument, setRegInstrument] = useState('');

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!regName || !regUsername || !regPassword || !regInstrument) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await onRegister({
        name: regName,
        username: regUsername,
        password: regPassword,
        role: regRole,
        instrument: regInstrument
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    // Reset forms
    setEmail('');
    setPassword('');
    setRegName('');
    setRegUsername('');
    // setRegEmail(''); // Removed
    setRegPassword('');
    setRegInstrument('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[linear-gradient(rgba(185,28,28,0.9),rgba(127,29,29,0.95)),url('https://picsum.photos/seed/church/1920/1080')] bg-cover bg-center">
      <div className={`w-full max-w-[450px] animate-fade-in transition-all duration-300 ${isRegistering ? 'max-w-[500px]' : ''}`}>
        <div className="bg-white dark:bg-[#1a2130] rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-white/5">
          <div className="flex flex-col items-center pt-10 pb-6 px-8 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-accent-gold flex items-center justify-center bg-white shadow-lg overflow-hidden">
                <span className="text-primary material-symbols-outlined !text-4xl">church</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-church-navy dark:text-white tracking-tighter uppercase">
              {isRegistering ? 'Crear Cuenta' : 'Ministerio de Adoración'}
            </h1>
            <p className="text-[#636f88] dark:text-gray-400 text-sm mt-1 font-bold uppercase tracking-widest">
              {isRegistering ? 'Únete al equipo' : 'Plataforma de Gestión'}
            </p>
          </div>

          {!isRegistering ? (
            // LOGIN FORM
            <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-medium animate-shake">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#111318] dark:text-gray-200 text-sm font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined !text-sm text-primary">person</span>
                  Usuario
                </label>
                <input
                  className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-12 placeholder:text-[#636f88] dark:placeholder:text-gray-500 px-4 text-sm font-normal transition-all"
                  placeholder="@usuario"
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
                <span className="flex-shrink mx-4 text-xs text-gray-400">¿No tienes cuenta?</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-church-navy dark:text-white text-sm font-bold tracking-wide transition-all border border-gray-200 dark:border-gray-700"
                >
                  Registrarse
                </button>
              </div>
            </form>
          ) : (
            // REGISTRATION FORM
            <form onSubmit={handleRegisterSubmit} className="px-8 pb-10 space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-medium animate-shake">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-[#111318] dark:text-gray-200 text-xs font-semibold">Nombre Completo</label>
                <input
                  className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm"
                  placeholder="Ej. Juan Pérez"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[#111318] dark:text-gray-200 text-xs font-semibold">Usuario</label>
                  <input
                    className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm"
                    placeholder="@juan01"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[#111318] dark:text-gray-200 text-xs font-semibold">Rol</label>
                  <select
                    className="form-select w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'Leader' | 'Musician')}
                  >
                    <option value="Musician">Músico</option>
                    <option value="Leader">Líder</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#111318] dark:text-gray-200 text-xs font-semibold">Contraseña</label>
                <input
                  className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm"
                  placeholder="••••••••"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#111318] dark:text-gray-200 text-xs font-semibold">Instrumento / Área</label>
                <input
                  className="form-input w-full rounded-lg text-[#111318] dark:text-white focus:outline-0 focus:ring-1 focus:ring-primary border border-[#dcdfe5] dark:border-gray-700 bg-white dark:bg-gray-800 h-10 px-4 text-sm"
                  placeholder="Ej. Batería, Voz, Piano"
                  value={regInstrument}
                  onChange={(e) => setRegInstrument(e.target.value)}
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-base font-bold tracking-wide transition-all shadow-lg shadow-primary/20 border-b-2 border-accent-gold/40 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin material-symbols-outlined !text-lg">progress_activity</span>
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear Cuenta</span>
                      <span className="material-symbols-outlined !text-lg">person_add</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="w-full h-10 flex items-center justify-center gap-2 text-[#636f88] dark:text-gray-400 text-sm font-semibold hover:text-primary transition-colors"
                >
                  Volver al Login
                </button>
              </div>
            </form>
          )}
        </div>
        <p className="text-center mt-6 text-church-navy/60 dark:text-white/40 text-xs font-medium">
          © 2026 Youth Ministry Platform • <a className="underline hover:text-primary" href="#">Términos y Privacidad</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
