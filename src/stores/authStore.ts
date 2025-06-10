import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  setUserAndSession: (user: User | null, session: Session | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // Initially true to check for existing session
  error: null,
  setUserAndSession: (user, session) => set({ user, session, isLoading: false, error: null }),
  clearAuth: () => set({ user: null, session: null, isLoading: false, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
}));

// Function to initialize auth state from session, can be called on app load
export const initializeAuthStore = async (supabaseClient: any) => { // supabaseClient type can be SupabaseClient
  useAuthStore.getState().setLoading(true);
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    if (session) {
      useAuthStore.getState().setUserAndSession(session.user, session);
    } else {
      useAuthStore.getState().clearAuth();
    }
  } catch (error: any) {
    useAuthStore.getState().setError(error);
    useAuthStore.getState().clearAuth(); // Ensure clean state on error
  } finally {
    useAuthStore.getState().setLoading(false);
  }
};
