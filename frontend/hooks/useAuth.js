import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // 1. Check Active Session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleLoginSuccess(session.user);
      }
    };
    checkUser();

    // 2. Listen for Login/Logout
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleLoginSuccess(session.user);
        setShowAuthModal(false);
      } else {
        setUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // Helper: Jab user login ho jaye
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    
    // Check if Profile is Complete (Occupation/State)
    const { data } = await supabase
      .from('profiles')
      .select('occupation')
      .eq('id', userData.id)
      .single();
      
    if (!data?.occupation) {
      setShowOnboarding(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { 
    user, 
    showOnboarding, setShowOnboarding, 
    showAuthModal, setShowAuthModal, 
    handleLogout 
  };
}