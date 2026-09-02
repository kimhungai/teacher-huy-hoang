import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DB } from '../services/db';

interface UserSession {
  email: string;
  isAdmin: boolean;
  isSuperAdmin?: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 1. Client Admin Account (Tài khoản bàn giao cho Khách hàng)
const CLIENT_ADMIN_EMAIL = 'huynhkimhungabmthaydangtu@gmail.com';

// 2. Super Admin / Author Backup Account (Tài khoản Tác giả dự phòng cao nhất)
const SUPER_ADMIN_EMAIL = 'huynhkimhung727@gmail.com';
const SUPER_ADMIN_PASS = 'Admin@2020';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isEmailAdmin = (emailStr: string) => {
    const norm = emailStr.toLowerCase().trim();
    return norm === CLIENT_ADMIN_EMAIL || norm === SUPER_ADMIN_EMAIL;
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const email = data.session.user.email || '';
          const isSuper = email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
          setUser({ email, isAdmin: isEmailAdmin(email), isSuperAdmin: isSuper });
        }
      } else {
        const localSession = localStorage.getItem('teacher_admin_session');
        if (localSession) {
          try {
            const parsed = JSON.parse(localSession);
            setUser(parsed);
          } catch {
            localStorage.removeItem('teacher_admin_session');
          }
        }
      }
      setLoading(false);
    };

    initAuth();

    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || '';
          const isSuper = email.toLowerCase().trim() === SUPER_ADMIN_EMAIL;
          setUser({ email, isAdmin: isEmailAdmin(email), isSuperAdmin: isSuper });
        } else {
          setUser(null);
        }
      });
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (inputEmail: string, inputPass: string): Promise<boolean> => {
    const normalizedEmail = inputEmail.toLowerCase().trim();

    // Fetch current settings for dynamic password validation
    const settings = await DB.getSiteSettings();

    // 1. Kiểm tra Đăng nhập Tài khoản Tác giả Dự phòng (Super Admin: huynhkimhung727@gmail.com / superAdminPassword)
    const targetSuperPass = settings?.superAdminPassword || SUPER_ADMIN_PASS;
    if (normalizedEmail === SUPER_ADMIN_EMAIL && inputPass === targetSuperPass) {
      const superSession: UserSession = {
        email: SUPER_ADMIN_EMAIL,
        isAdmin: true,
        isSuperAdmin: true
      };
      setUser(superSession);
      localStorage.setItem('teacher_admin_session', JSON.stringify(superSession));
      return true;
    }

    // 2. Kiểm tra Đăng nhập Tài khoản Bàn giao Khách hàng (Client Admin)
    const clientAccounts = settings?.clientAdminAccounts || [];
    const matchedClient = clientAccounts.find(
      acc => acc.email.toLowerCase().trim() === normalizedEmail && acc.password === inputPass
    );

    const primaryContactEmail = (settings?.contactEmail || CLIENT_ADMIN_EMAIL).toLowerCase().trim();
    const primaryAdminPass = settings?.adminPassword || 'Admin@123';
    const isFallbackMatch =
      (normalizedEmail === primaryContactEmail || normalizedEmail === CLIENT_ADMIN_EMAIL) &&
      inputPass === primaryAdminPass;

    if (matchedClient || isFallbackMatch) {
      const adminSession: UserSession = {
        email: matchedClient ? matchedClient.email : normalizedEmail,
        isAdmin: true,
        isSuperAdmin: false
      };
      setUser(adminSession);
      localStorage.setItem('teacher_admin_session', JSON.stringify(adminSession));
      return true;
    }

    // 3. Supabase Auth fallback
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: inputEmail, password: inputPass });
      if (!error) {
        const isSuper = normalizedEmail === SUPER_ADMIN_EMAIL;
        setUser({ email: inputEmail, isAdmin: true, isSuperAdmin: isSuper });
        return true;
      }
    }

    return false;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('teacher_admin_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: Boolean(user?.isAdmin),
        isSuperAdmin: Boolean(user?.isSuperAdmin),
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
