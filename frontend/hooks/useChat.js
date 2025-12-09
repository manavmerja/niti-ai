import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { chatWithNiti } from '@/services/api'; // Step 1 wali file use kar rahe hain

export function useChat(user) {
  const initialMsg = { id: 1, role: "assistant", content: "Namaste! 🙏 I am Niti.ai. Ask me anything about Indian Government schemes." };
  
  const [messages, setMessages] = useState([initialMsg]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Session State
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // 1. Fetch Sessions (History List) when User logs in
  useEffect(() => {
    if (user) {
      fetchSessions(user.id);
    } else {
      setSessions([]);
      setMessages([initialMsg]);
    }
  }, [user]);

  const fetchSessions = async (userId) => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setSessions(data);
  };

  // 2. Load Specific Chat
  const loadSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setIsLoading(true);
    
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(msg => ({ id: msg.id, role: msg.role, content: msg.content })));
    }
    setIsLoading(false);
  };

  // 3. Start New Chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([initialMsg]);
  };

  // 4. Send Message Logic
  const handleSend = async (overrideText = null) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    setInput("");
    
    // UI Update (Optimistic)
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: textToSend }]);
    setIsLoading(true);

    let activeSession = currentSessionId;

    try {
      // A. Create Session if needed
      if (!activeSession && user) {
        const title = textToSend.slice(0, 30) + "...";
        const { data: newSession } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, title }])
          .select()
          .single();

        if (newSession) {
          activeSession = newSession.id;
          setCurrentSessionId(newSession.id);
          setSessions(prev => [newSession, ...prev]);
        }
      }

      // B. Save User Msg
      if (user && activeSession) {
        await supabase.from('messages').insert([{ 
          role: "user", content: textToSend, user_id: user.id, conversation_id: activeSession 
        }]);
      }

      // C. Call Backend (API Service)
      const botResponse = await chatWithNiti(textToSend);

      // D. Save Bot Msg
      if (user && activeSession) {
        await supabase.from('messages').insert([{ 
          role: "assistant", content: botResponse, user_id: user.id, conversation_id: activeSession 
        }]);
      }

      // Final UI Update
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: botResponse }]);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: "⚠️ Network Error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages, input, setInput, isLoading,
    sessions, currentSessionId,
    handleSend, startNewChat, loadSession
  };
}