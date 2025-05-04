
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Session, SupabaseClient } from '@supabase/supabase-js';

// Define the context shape
interface AuthContextType {
  supabase: SupabaseClient;
  session: Session | null;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null); // State for auth errors

  useEffect(() => {
    console.log("AuthProvider useEffect started");
    setIsLoading(true);
    setAuthError(null);

    // Get initial session
    console.log("AuthProvider: Attempting getSession...");
    supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
      console.log("AuthProvider: getSession completed.", { initialSession, sessionError });
      if (sessionError) {
        console.error("Error getting initial session:", sessionError);
        setAuthError(`Error getting initial session: ${sessionError.message}`);
      }
      setSession(initialSession);
      // Set loading to false after initial check completes
      setIsLoading(false); 
    }).catch(catchError => {
        console.error("Catch block error getting initial session:", catchError);
        setAuthError(`Catch block error getting initial session: ${catchError.message}`);
        setIsLoading(false); // Stop loading on catch
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      console.log("onAuthStateChange event:", _event, "Session:", currentSession);
      setSession(currentSession);
      // Consider SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, PASSWORD_RECOVERY etc.
      // INITIAL_SESSION is triggered after getSession completes if user was already logged in.
      // If user logs in/out, a specific event is triggered.
      setIsLoading(false); // Stop loading once we get any event after the initial check
    });

    // Cleanup listener
    return () => {
      console.log("AuthProvider useEffect cleanup");
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    supabase,
    session,
    isLoading,
  };

  // Visual Debug Output for Auth Loading
  const AuthDebugDisplay = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'rgba(255, 255, 0, 0.8)', padding: '5px', zIndex: 9999, fontSize: '10px', borderBottom: '1px solid black' }}>
      Auth Debug: isLoading={isLoading.toString()}, Session={session ? `Exists (User ID: ${session.user.id})` : 'null'}, Error={authError || 'none'}
    </div>
  );

  return (
    <AuthContext.Provider value={value}>
      <AuthDebugDisplay />
      {/* Render children only when loading is complete? Or always render? Let's always render for now to see if children cause issues */}
      {children}
      {/* Alternative: Render children only when not loading, show specific loading screen otherwise */}
      {/* {isLoading ? <div>Global Auth Loading...</div> : children} */}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

