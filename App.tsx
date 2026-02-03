
import React, { useState, useEffect } from 'react';
import { AppView, User, TeamMember, UserRegistrationData } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Songs from './pages/Songs';
import Team from './pages/Team';
import MusicianView from './pages/MusicianView';
import Notices from './pages/Notices';
import Profile from './pages/Profile';
import { requestNotificationPermission } from './utils/notifications';
import { AppNotification, Song, MinistryNotice, MinistryEvent } from './types';

// Firebase Imports
import { db, COLLECTIONS, subscribeToCollection, requestPushPermission, onMessageListener } from './firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('youth_ministry_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = localStorage.getItem('youth_ministry_currentView');
    return (saved as AppView) || AppView.LOGIN;
  });

  // Helper function to load from localStorage (Fallback)
  const getInitialState = <T,>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(`youth_ministry_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  };

  // Global App States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [notices, setNotices] = useState<MinistryNotice[]>([]);
  const [events, setEvents] = useState<MinistryEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stop loading once we have data OR once a timeout expires (to prevent infinite loading)
  useEffect(() => {
    if (users.length > 0) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 5000); // Max 5s wait
      return () => clearTimeout(timer);
    }
  }, [users.length]);

  // Real-time Cloud Sync
  useEffect(() => {
    const unsubSongs = subscribeToCollection(COLLECTIONS.SONGS, (data) => setSongs(data));
    const unsubNotices = subscribeToCollection(COLLECTIONS.NOTICES, (data) => setNotices(data));
    const unsubEvents = subscribeToCollection(COLLECTIONS.EVENTS, (data) => setEvents(data));
    const unsubMembers = subscribeToCollection(COLLECTIONS.MEMBERS, (data) => setMembers(data));
    const unsubUsers = subscribeToCollection(COLLECTIONS.USERS, (data) => setUsers(data));
    const unsubNotifs = subscribeToCollection(COLLECTIONS.NOTIFICATIONS, (data) => setNotifications(data));

    return () => {
      unsubSongs();
      unsubNotices();
      unsubEvents();
      unsubMembers();
      unsubUsers();
      unsubNotifs();
    };
  }, []);

  // 🧹 Deduplication & Seeding Logic
  useEffect(() => {
    const runCleanupAndSeed = async () => {
      if (isLoading || users.length === 0) return;

      // 1. Cleanup existing duplicates in MEMBERS
      const seenNames = new Set();
      for (const m of members) {
        if (seenNames.has(m.name)) {
          console.log("Removing duplicate member:", m.name);
          try { await deleteDoc(doc(db, COLLECTIONS.MEMBERS, m.id)); } catch (e) { }
        } else {
          seenNames.add(m.name);
        }
      }

      // 2. Cleanup existing duplicates in USERS
      const seenUsernames = new Set();
      for (const u of users) {
        const un = u.username.toLowerCase();
        if (seenUsernames.has(un)) {
          console.log("Removing duplicate user:", u.username);
          try { await deleteDoc(doc(db, COLLECTIONS.USERS, u.id)); } catch (e) { }
        } else {
          seenUsernames.add(un);
        }
      }

      // 3. Ensure full roster exists
      const roster = [
        { name: 'Bladimir Acosta', username: '@Bladimir0109', role: 'Leader', title: 'Presidente', instrument: 'Dirección', avatar: 'https://picsum.photos/seed/bladimir/100/100' },
        { name: 'Ester Montilla', username: '@Ester0109', role: 'Leader', title: 'Vicepresidenta', instrument: 'Dirección', avatar: 'https://picsum.photos/seed/ester/100/100' },
        { name: 'Solemny Matos', username: '@Solemny0109', role: 'Leader', title: 'Líder de Adoración', instrument: 'Voz / Guitarra', avatar: 'https://picsum.photos/seed/solemny/100/100' },
        { name: 'Denny Sánchez', username: '@Denny0109', role: 'Musician', title: 'Músico', instrument: 'Batería', avatar: 'https://picsum.photos/seed/denny/100/100' },
        { name: 'Sandy', username: '@Sandy0109', role: 'Musician', title: 'Músico', instrument: 'Piano #1', avatar: 'https://picsum.photos/seed/sandy/100/100' },
        { name: 'Raibel Mejía', username: '@Raibel0109', role: 'Musician', title: 'Músico', instrument: 'Piano #2', avatar: 'https://picsum.photos/seed/raibel/100/100' },
        { name: 'Franny Ramírez', username: '@Franny', role: 'Musician', title: 'Músico', instrument: 'Voz', avatar: 'https://picsum.photos/seed/franny/100/100' },
        { name: 'Yasmel Carvajal', username: '@Yasmel0109', role: 'Musician', title: 'Músico', instrument: 'Voz', avatar: 'https://picsum.photos/seed/yasmel/100/100' },
        { name: 'Débora', username: '@Debora0109', role: 'Musician', title: 'Músico', instrument: 'Voz', avatar: 'https://picsum.photos/seed/debora/100/100' },
        { name: 'Natacha Ramírez', username: '@Natacha0109', role: 'Musician', title: 'Músico', instrument: 'Voz', avatar: 'https://picsum.photos/seed/natacha/100/100' },
        { name: 'Yocandra Feliz', username: '@Yocandra0109', role: 'Musician', title: 'Músico', instrument: 'Voz', avatar: 'https://picsum.photos/seed/yocandra/100/100' }
      ];

      for (const m of roster) {
        const mLower = m.username.toLowerCase();
        const userExists = users.some(u => u.username.toLowerCase() === mLower || u.username.toLowerCase() === mLower.replace('@', ''));
        const memberExists = members.some(mb => mb.name === m.name);

        if (!userExists) {
          try { await addDoc(collection(db, COLLECTIONS.USERS), { ...m, password: 'password123', timestamp: serverTimestamp() }); } catch (e) { }
        }
        if (!memberExists) {
          try {
            await addDoc(collection(db, COLLECTIONS.MEMBERS), {
              name: m.name,
              username: m.username, // Added username
              role: m.title || 'Músico',
              status: 'Activo',
              instrument: m.instrument,
              avatar: m.avatar,
              timestamp: serverTimestamp()
            });
          } catch (e) { }
        }
      }
    };

    runCleanupAndSeed();
  }, [users.length, members.length, isLoading]);

  // Migration: Ensure existing members have their @username for correct filtering
  useEffect(() => {
    if (isLoading || users.length === 0 || members.length === 0) return;

    const migrateMembers = async () => {
      for (const m of members) {
        if (!m.username) {
          const correspondingUser = users.find(u => u.name === m.name);
          if (correspondingUser) {
            console.log("Migrating member to include username:", m.name);
            try { await updateDoc(doc(db, COLLECTIONS.MEMBERS, m.id), { username: correspondingUser.username }); } catch (e) { }
          }
        }
      }
    };
    migrateMembers();
  }, [members.length, users.length, isLoading]);

  // Migration: Convert Song assignments from Member IDs to Usernames
  useEffect(() => {
    if (isLoading || songs.length === 0 || members.length === 0) return;

    const migrateSongs = async () => {
      for (const s of songs) {
        if (!s.assignedMusicians) continue;

        // Check if any ID in the array looks like a Firestore ID (longer than 15 chars and no @)
        const needsUpdate = s.assignedMusicians.some(id => id.length > 15 && !id.startsWith('@'));

        if (needsUpdate) {
          let wasConverted = false;
          const newAssignments = s.assignedMusicians.map(id => {
            if (id.startsWith('@')) return id;
            const member = members.find(m => m.id === id);
            if (member?.username) {
              wasConverted = true;
              return member.username;
            }
            return id;
          });

          if (wasConverted) {
            console.log("Migrating song assignments for:", s.title);
            try { await updateDoc(doc(db, COLLECTIONS.SONGS, s.id), { assignedMusicians: newAssignments }); } catch (e) { }
          }
        }
      }
    };
    migrateSongs();
  }, [songs.length, members.length, isLoading]);

  // Persistent user and view (still in localStore for speed/login state)
  useEffect(() => {
    localStorage.setItem('youth_ministry_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('youth_ministry_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    // Request permission and get token
    const initNotifications = async () => {
      const token = await requestPushPermission();
      if (token && user) {
        // Save token to user profile if it's new
        if (user.fcmToken !== token) {
          console.log("Saving new FCM token for user:", user.username);
          try {
            await updateDoc(doc(db, COLLECTIONS.USERS, user.id), { fcmToken: token });
          } catch (e) {
            console.error("Error saving FCM token:", e);
          }
        }
      }
    };

    if (user) {
      initNotifications();
    }

    // Foreground listener
    const unsubscribe = onMessageListener().then(payload => {
      // @ts-ignore
      const { title, body } = payload.notification;
      addAppNotification('notice', title, body);
      new Notification(title, { body, icon: '/vite.svg' });
    });

    return () => {
      // Cleanup if needed
    };
  }, [user]);

  const addAppNotification = async (type: 'song' | 'notice' | 'event', title: string, message: string) => {
    const newNotification = {
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    };

    try {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...newNotification,
        serverTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };

  const markNotificationsAsRead = async () => {
    notifications.forEach(async (n) => {
      if (!n.isRead) {
        try {
          await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), { isRead: true });
        } catch (e) { }
      }
    });
  };

  const handleAddSong = async (song: Partial<Song>) => {
    try {
      await addDoc(collection(db, COLLECTIONS.SONGS), { ...song, timestamp: serverTimestamp() });

      // Auto-create rehearsal event when a leader publishes an Ensayo song set (manual RD date/time)
      if (song.category === 'Ensayo' && user?.role === 'Leader') {
        const date = song.rehearsalDate;
        const time = song.rehearsalTime;

        if (date && time) {
          const hasSameEnsayo = events.some(e =>
            e.type === 'Ensayo' && e.date === date && e.time === time
          );

          if (!hasSameEnsayo) {
            await addDoc(collection(db, COLLECTIONS.EVENTS), {
              title: 'Ensayo Semanal',
              date,
              time,
              type: 'Ensayo',
              notes: 'Creado al publicar canciones de ensayo (hora RD).',
              timestamp: serverTimestamp()
            });
          }
        }
      }
    } catch (e) { console.error(e); }
  };

  const handleUpdateSong = async (song: Song) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.SONGS, song.id), { ...song });
    } catch (e) { console.error(e); }
  };

  const handleDeleteSong = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SONGS, id));
    } catch (e) { console.error(e); }
  };

  const handleAddNotice = async (notice: Partial<MinistryNotice>) => {
    try {
      await addDoc(collection(db, COLLECTIONS.NOTICES), { ...notice, timestamp: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const handleUpdateNotice = async (notice: MinistryNotice) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.NOTICES, notice.id), { ...notice });
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.NOTICES, id));
    } catch (e) { console.error(e); }
  };

  const handleAddEvent = async (event: Partial<MinistryEvent>) => {
    try {
      await addDoc(collection(db, COLLECTIONS.EVENTS), { ...event, timestamp: serverTimestamp() });
    } catch (e) { console.error(e); }
  };

  const handleUpdateEvent = async (event: MinistryEvent) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.EVENTS, event.id), { ...event });
    } catch (e) { console.error(e); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
    } catch (e) { console.error(e); }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentView(userData.role === 'Musician' ? AppView.SONGS : AppView.DASHBOARD);
  };

  const handleRegister = async (registrationData: UserRegistrationData) => {
    try {
      // 1. Double check if username exists (client-side safety)
      const usernameLower = registrationData.username.toLowerCase();
      const exists = users.some(u => u.username.toLowerCase() === usernameLower || u.username.toLowerCase() === `@${usernameLower}` || `@${u.username.toLowerCase()}` === usernameLower);

      if (exists) {
        throw new Error('El nombre de usuario ya está en uso.');
      }

      // 2. Create User document
      const newUserDoc = {
        name: registrationData.name,
        username: registrationData.username.startsWith('@') ? registrationData.username : `@${registrationData.username}`,
        password: registrationData.password,
        role: registrationData.role,
        instrument: registrationData.instrument,
        avatar: `https://picsum.photos/seed/${registrationData.username.replace('@', '')}/100/100`,
        timestamp: serverTimestamp()
      };

      const userRef = await addDoc(collection(db, COLLECTIONS.USERS), newUserDoc);

      // 3. Create Member document
      await addDoc(collection(db, COLLECTIONS.MEMBERS), {
        name: newUserDoc.name,
        username: newUserDoc.username,
        role: newUserDoc.role === 'Leader' ? 'Líder' : 'Músico',
        status: 'Activo',
        instrument: newUserDoc.instrument,
        avatar: newUserDoc.avatar,
        timestamp: serverTimestamp()
      });

      // 4. Auto login
      const createdUser: User = {
        id: userRef.id,
        ...newUserDoc
      } as User;

      handleLogin(createdUser);
      console.log("Usuario registrado y logueado exitosamente");
    } catch (e) {
      console.error("Error en el registro:", e);
      throw e;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(AppView.LOGIN);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, COLLECTIONS.USERS, user.id));
    } catch (e) {
      console.error("Error deleting user:", e);
    }

    const memberToDelete = members.find(m =>
      m.username === user.username ||
      m.name === user.name ||
      m.id === user.id
    );

    if (memberToDelete) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.MEMBERS, memberToDelete.id));
      } catch (e) {
        console.error("Error deleting member profile:", e);
      }
    }

    setUser(null);
    setCurrentView(AppView.LOGIN);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);

    // 1. Update USER record (for login/profile)
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, updatedUser.id), {
        ...updatedUser,
        timestamp: serverTimestamp() // Update timestamp to prevent overwriting by seed logic
      });
      console.log("User profile updated in Firestore");
    } catch (e) {
      console.error("Error updating user profile:", e);
    }

    // 2. Update MEMBER record (for public team view)
    // Find member by matching username or name
    const memberToUpdate = members.find(m =>
      m.username === updatedUser.username ||
      m.name === updatedUser.name
    );

    if (memberToUpdate) {
      try {
        await updateDoc(doc(db, COLLECTIONS.MEMBERS, memberToUpdate.id), {
          name: updatedUser.name,
          instrument: updatedUser.instrument,
          avatar: updatedUser.avatar
        });
        console.log("Member profile synced in Firestore");
      } catch (e) {
        console.error("Error syncing member profile:", e);
      }
    }
  };

  const handleUpdateMembers = (updatedMembers: TeamMember[]) => {
    // This local state will be updated by onSnapshot anyway, 
    // but we can trigger cloud updates for specific members if needed.
    // However, most components call sub-handlers. 
    // If a bulk update is needed, it would need a batch.
    setMembers(updatedMembers);
  };


  const handleConfirmParticipation = async (userId: string, isConfirmed: boolean) => {
    // Current user data from auth/localStorage
    const currentUser = user;
    if (!currentUser) return;

    // Find the member doc that matches this user (by username or name)
    const member = members.find(m =>
      m.username === currentUser.username ||
      m.name === currentUser.name ||
      m.id === currentUser.id
    );

    if (member) {
      try {
        await updateDoc(doc(db, COLLECTIONS.MEMBERS, member.id), { isConfirmed });
        console.log(`Participación de ${member.name} actualizada a: ${isConfirmed}`);
      } catch (e) {
        console.error("Error confirmando participación:", e);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.LOGIN:
        return <Login users={users} onLogin={handleLogin} onRegister={handleRegister} isLoading={isLoading} />;
      case AppView.DASHBOARD:
        return <Dashboard
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          user={user}
          members={members}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          songs={songs}
          notices={notices}
          events={events}
        />;
      case AppView.CALENDAR:
        return <Calendar
          onNavigate={setCurrentView}
          user={user}
          events={events}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onAddNotification={addAppNotification}
          onLogout={handleLogout}
        />;
      case AppView.SONGS:
        return <Songs
          onNavigate={setCurrentView}
          user={user}
          members={members}
          songs={songs}
          onAddSong={handleAddSong}
          onUpdateSong={handleUpdateSong}
          onDeleteSong={handleDeleteSong}
          onConfirm={handleConfirmParticipation}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onAddNotification={addAppNotification}
          onLogout={handleLogout}
        />;
      case AppView.TEAM:
        return <Team
          onNavigate={setCurrentView}
          user={user}
          members={members}
          onUpdateMembers={handleUpdateMembers}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onLogout={handleLogout}
        />;
      case AppView.MUSICIAN_VIEW:
        return <MusicianView
          onNavigate={setCurrentView}
          user={user}
          onConfirm={handleConfirmParticipation}
          members={members}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          songs={songs}
          notices={notices}
          onLogout={handleLogout}
        />;
      case AppView.NOTICES:
        return <Notices
          onNavigate={setCurrentView}
          user={user}
          notices={notices}
          onAddNotice={handleAddNotice}
          onUpdateNotice={handleUpdateNotice}
          onDeleteNotice={handleDeleteNotice}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onAddNotification={addAppNotification}
          onLogout={handleLogout}
        />;
      case AppView.PROFILE:
        return <Profile
          onNavigate={setCurrentView}
          user={user}
          onUpdateUser={handleUpdateUser}
          onDeleteAccount={handleDeleteAccount}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          onLogout={handleLogout}
        />;
      default:
        return <Dashboard
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          user={user}
          members={members}
          notifications={notifications}
          onMarkNotificationsAsRead={markNotificationsAsRead}
          songs={songs}
          notices={notices}
          events={events}
        />;
    }
  };

  return (
    <div className="font-display">
      {renderView()}
    </div>
  );
};

export default App;
