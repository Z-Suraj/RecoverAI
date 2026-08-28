import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Merchant } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string) => Promise<void>;
  signup: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
  updateMerchantSettings: (settings: Partial<Merchant['recoverySettings']>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuth = async () => {
    try {
      const data = await apiClient.getMe();
      setUser(data.user);
      setMerchant(data.merchant);
    } catch (err) {
      console.error('Error fetching initial auth:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuth();
  }, []);

  const login = async (email?: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email);
      setUser(res.user);
      await fetchAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.signup(name, email);
      setUser(res.user);
      await fetchAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const completeOnboarding = async (data: any) => {
    const updatedMerchant = await apiClient.completeOnboarding(data);
    setMerchant(updatedMerchant);
  };

  const updateMerchantSettings = async (settings: Partial<Merchant['recoverySettings']>) => {
    const updatedMerchant = await apiClient.updateMerchantSettings(settings);
    setMerchant(updatedMerchant);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        completeOnboarding,
        updateMerchantSettings,
        refreshAuth: fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
