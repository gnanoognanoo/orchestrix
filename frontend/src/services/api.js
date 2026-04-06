import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_BASE_URL = 'http://localhost:8000/api';

// These should ideally be in frontend/.env, using dummy values for now 
// so the UI doesn't crash before the user puts in real keys.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const searchPapers = async (query, sessionName = null) => {
  const response = await axios.post(`${API_BASE_URL}/search`, { query, session_name: sessionName });
  return response.data;
};

export const synthesizePapers = async (papers) => {
  const response = await axios.post(`${API_BASE_URL}/synthesize`, { papers });
  return response.data;
};

export const citePapers = async (papers, format = 'txt', style = 'APA') => {
  const response = await axios.post(`${API_BASE_URL}/cite`, { papers, format, style });
  return response.data;
};

export const getSessions = async () => {
    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
}

export const getSessionDetails = async (sessionId) => {
    const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.data;
}

export const deleteSession = async (sessionId) => {
    const response = await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
    return response.data;
}
