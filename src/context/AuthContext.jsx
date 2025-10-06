import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('admin')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setIsAdmin(true);
      } else {
        // Try to insert current user as admin once (works only if table is empty per RLS policy)
        const email = (await supabase.auth.getUser()).data.user?.email;
        if (email) {
          await supabase.from('admin').insert({ id: userId, email });
          // Re-check
          const { data: after } = await supabase
            .from('admin')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
          setIsAdmin(!!after);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  // First-time admin signup: only works if admin_users table is empty due to RLS policy
  const signUpFirstAdmin = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { data, error };

  // If email confirmation is disabled, a session will be present and we can insert immediately.
    // If confirmation is enabled, the insert will run after the user returns and is signed in.
    const userId = data?.user?.id || (await supabase.auth.getUser())?.data?.user?.id;
    if (userId) {
      // Attempt to create admin record (RLS allows only when table is empty)
      await supabase.from('admin').insert({ id: userId, email });
      // Check if created
      const { data: adminRec } = await supabase
        .from('admin')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      checkAdminStatus(userId);
      if (!adminRec) {
        // Admin already exists or insert blocked; ensure this account doesn't linger signed-in
        await supabase.auth.signOut();
        return { data: null, error: { message: 'Admin is already configured. Signup is disabled.' }, isAdminCreated: false };
      }
      return { data, error: null, isAdminCreated: true };
    }
    return { data, error: null, isAdminCreated: false };
  };

  // Send password reset email with redirect back to our app
  const sendPasswordResetEmail = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    return { data, error };
  };

  // Complete password reset or change for logged-in user
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    isAdmin,
    loading,
    signIn,
    signUpFirstAdmin,
    sendPasswordResetEmail,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
