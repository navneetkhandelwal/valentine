import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export interface PhotoMetadata {
  id: number;
  path: string;
  url: string;
  uploadedAt: string;
}

export interface UserProfile {
  username: string;
  email?: string;
  partnerName: string;
  message: string;
  role?: 'admin' | 'member';
  userId?: string;
}

export interface DayContent {
  customMessage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  quote?: string;
  songUrl?: string;
  ctaLabel?: string;
  hideNoButton?: boolean;
}

interface AdminSettings {
  featuredUsername: string;
  users: Array<{ username: string; role: 'admin' | 'member'; partnerName: string; createdAt: string }>;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    username: string,
    email: string,
    password: string,
    partnerName?: string,
    role?: 'admin' | 'member',
    adminPasscode?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadPhoto: (day: string, file: File) => Promise<{ success: boolean; photo?: PhotoMetadata; error?: string }>;
  deletePhoto: (day: string, photoId: number) => Promise<void>;
  getPublicProfile: (username: string) => Promise<any>;
  updateDayContent: (day: string, content: DayContent) => Promise<void>;
  getDayContent: (username: string, day: string) => Promise<DayContent>;
  getFeaturedPage: (day: string) => Promise<any>;
  getAdminSettings: () => Promise<AdminSettings | null>;
  updateFeaturedUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3b2037e0`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('currentUser');

    if (storedToken && storedUser) {
      setAccessToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (
    username: string,
    email: string,
    password: string,
    partnerName?: string,
    role: 'admin' | 'member' = 'member',
    adminPasscode?: string,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ username, email, password, partnerName, role, adminPasscode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error during signup' };
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          identifier,
          ...(identifier.includes('@') && { email: identifier }),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setAccessToken(data.accessToken);
      setUser(data.user);

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('currentUser', JSON.stringify(data.user));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error during login' };
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.profile);
        localStorage.setItem('currentUser', JSON.stringify(data.profile));
      } else {
        console.error('Profile update error:', data.error);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const uploadPhoto = async (day: string, file: File) => {
    if (!accessToken) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload/${day}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      return { success: true, photo: data.photo };
    } catch (error) {
      console.error('Photo upload error:', error);
      return { success: false, error: 'Network error during upload' };
    }
  };

  const deletePhoto = async (day: string, photoId: number) => {
    if (!accessToken) return;

    try {
      await fetch(`${API_BASE}/photo/${day}/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
      });
    } catch (error) {
      console.error('Photo delete error:', error);
    }
  };

  const getPublicProfile = async (username: string) => {
    try {
      const response = await fetch(`${API_BASE}/public/${username}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get public profile error:', error);
      return null;
    }
  };

  const updateDayContent = async (day: string, content: DayContent) => {
    if (!accessToken) return;

    try {
      await fetch(`${API_BASE}/day-content/${day}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
        body: JSON.stringify(content),
      });
    } catch (error) {
      console.error('Update day content error:', error);
    }
  };

  const getDayContent = async (username: string, day: string) => {
    try {
      const response = await fetch(`${API_BASE}/day-content/${username}/${day}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      return data.content || {};
    } catch (error) {
      console.error('Get day content error:', error);
      return {};
    }
  };

  const getFeaturedPage = async (day: string) => {
    try {
      const response = await fetch(`${API_BASE}/featured/${day}`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get featured page error:', error);
      return null;
    }
  };

  const getAdminSettings = async () => {
    if (!accessToken) return null;
    try {
      const response = await fetch(`${API_BASE}/admin/settings`, {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Get admin settings error:', error);
      return null;
    }
  };

  const updateFeaturedUsername = async (username: string) => {
    if (!accessToken) return { success: false, error: 'Not authenticated' };
    try {
      const response = await fetch(`${API_BASE}/admin/featured`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
          ...(accessToken && { 'X-User-Token': accessToken }),
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: data.error || 'Failed to update featured user' };
      return { success: true };
    } catch (error) {
      console.error('Update featured user error:', error);
      return { success: false, error: 'Network error while updating featured user' };
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        signup,
        logout,
        updateProfile,
        uploadPhoto,
        deletePhoto,
        getPublicProfile,
        updateDayContent,
        getDayContent,
        getFeaturedPage,
        getAdminSettings,
        updateFeaturedUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
