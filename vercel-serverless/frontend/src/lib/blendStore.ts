import { create } from 'zustand';
import { useAuth } from './authStore';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:4001/api';

export interface BlendInvite {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
}

export interface Blend {
  id: string;
  name: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
  user1: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  user2: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  _count?: {
    tracks: number;
  };
  tracks?: BlendTrack[];
}

export interface BlendTrack {
  id: string;
  trackId: string;
  title: string;
  artist: string;
  thumbnail: string | null;
  duration: number | null;
  sourceUserId: string;
  position: number;
}

interface BlendState {
  invites: BlendInvite[];
  blends: Blend[];
  currentBlend: Blend | null;
  loading: boolean;
  lastInvitesFetch: number | null;
  lastBlendsFetch: number | null;
  sendInvite: (email: string) => Promise<void>;
  fetchInvites: (force?: boolean) => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<Blend>;
  rejectInvite: (inviteId: string) => Promise<void>;
  fetchBlends: (force?: boolean) => Promise<void>;
  getBlend: (id: string) => Promise<Blend>;
  regenerateBlend: (id: string) => Promise<Blend>;
  leaveBlend: (id: string) => Promise<any>;
  setCurrentBlend: (blend: Blend | null) => void;
}

export const useBlend = create<BlendState>((set, get) => ({
  invites: [],
  blends: [],
  currentBlend: null,
  loading: false,
  lastInvitesFetch: null,
  lastBlendsFetch: null,

  sendInvite: async (email: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invite');
    }
  },

  fetchInvites: async (force = false) => {
    const token = useAuth.getState().token;
    if (!token) return;

    const state = get();
    const now = Date.now();
    
    // Skip if fetched within last 45 seconds and not forced
    if (!force && state.lastInvitesFetch && (now - state.lastInvitesFetch) < 45000) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/blends/invites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        set({ invites: data.invites, lastInvitesFetch: now });
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error);
    }
  },

  acceptInvite: async (inviteId: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/invites/${inviteId}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invite');
    }

    const data = await response.json();
    
    // Update invites and blends
    const { invites, blends } = get();
    set({
      invites: invites.filter(inv => inv.id !== inviteId),
      blends: [data.blend, ...blends]
    });

    return data.blend;
  },

  rejectInvite: async (inviteId: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/invites/${inviteId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject invite');
    }

    // Remove from invites
    const { invites } = get();
    set({ invites: invites.filter(inv => inv.id !== inviteId) });
  },

  fetchBlends: async (force = false) => {
    const token = useAuth.getState().token;
    if (!token) return;

    const state = get();
    const now = Date.now();
    
    // Skip if fetched within last 30 seconds and not forced
    if (!force && state.lastBlendsFetch && (now - state.lastBlendsFetch) < 30000) {
      return;
    }

    set({ loading: true });
    try {
      const response = await fetch(`${API_URL}/blends`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        set({ blends: data.blends, loading: false, lastBlendsFetch: now });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch blends:', error);
      set({ loading: false });
    }
  },

  getBlend: async (id: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch blend');
    }

    const data = await response.json();
    set({ currentBlend: data.blend });
    return data.blend;
  },

  regenerateBlend: async (id: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/${id}/regenerate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to regenerate blend');
    }

    const data = await response.json();
    set({ currentBlend: data.blend });
    return data.blend;
  },

  leaveBlend: async (id: string) => {
    const token = useAuth.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/blends/${id}/leave`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave blend');
    }

    // Remove from local state
    set(state => ({
      blends: state.blends.filter(b => b.id !== id),
      currentBlend: state.currentBlend?.id === id ? null : state.currentBlend
    }));

    return await response.json();
  },

  setCurrentBlend: (blend: Blend | null) => {
    set({ currentBlend: blend });
  }
}));
