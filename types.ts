
export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CALENDAR = 'CALENDAR',
  SONGS = 'SONGS',
  TEAM = 'TEAM',
  MUSICIAN_VIEW = 'MUSICIAN_VIEW',
  NOTICES = 'NOTICES',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'Leader' | 'Musician' | 'Admin';
  title?: string;
  email?: string;
  password?: string;
  avatar: string;
  instrument?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  tempo?: string;
  resources?: string[];
  notes?: string;
  type: 'Entrada' | 'Adoración' | 'Clímax' | 'Ministración' | 'General';
  category?: 'Ensayo' | 'Culto' | 'Repertorio';
  assignedMusicians?: string[]; // Array of User IDs
  referenceUrl?: string;
}

export interface Setlist {
  id: string;
  eventId: string;
  songs: Song[];
}

export interface TeamMember {
  id: string;
  name: string;
  username: string; // Added for robust cloud matching
  role: string;
  status: 'Activo' | 'Descanso' | 'Pendiente';
  instrument: string;
  avatar: string;
  isOnline?: boolean;
  isConfirmed?: boolean;
}

export interface MinistryNotice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Leadership' | 'Music Team' | 'Community' | 'General';
  isPinned?: boolean;
}

export interface MinistryEvent {
  id: string;
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  time: string;
  type: 'Ensayo' | 'Culto' | 'Actividad' | 'Otro';
  notes?: string;
  location?: string;
}
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'song' | 'notice' | 'event';
  isRead: boolean;
}
