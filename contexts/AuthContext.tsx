import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import api from '@/lib/api';
import { normalizeRole } from '@/lib/roleUtils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // true until localStorage restore is complete
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  // switchRole is deprecated now that we have real roles, but keeping for compatibility for now
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // isLoading stays true until we've checked localStorage on mount
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from local storage on load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    // Mark initialization complete regardless of whether a user was found
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // POST to Spring Boot backend
      const response = await api.post('/auth/signin', { email, password });
      const data = response.data;

      // The backend returns a StandardResponse. The token may be nested (e.g. data: { massage: '<jwt>' })
      // and role may also be nested (e.g. role: { role: 'ADMIN' }). Normalize both.
      if (data && data.code === 200) {
        // extract token string from various possible shapes
        let token: string | null = null;
        if (data.data) {
          if (typeof data.data === 'string') token = data.data;
          else if (typeof data.data === 'object') {
            // Backend typo: "massage" instead of "message"
            token = (data.data as any).massage || (data.data as any).message || (data.data as any).token || (data.data as any).jwt || null;
          }
        }

        // extract role and other claims from the role map
        let roleVal: string | null = null;
        let idVal = 0;
        let fNameVal = email.split('@')[0];
        let lNameVal = '';
        let deptIdVal: number | undefined = undefined;

        if (data.role) {
          if (typeof data.role === 'string') {
            roleVal = data.role;
          } else if (typeof data.role === 'object') {
            roleVal = (data.role as any).role || null;
            if ((data.role as any).id) idVal = parseInt((data.role as any).id);
            if ((data.role as any).f_Name) fNameVal = (data.role as any).f_Name;
            if ((data.role as any).l_Name) lNameVal = (data.role as any).l_Name;
            if ((data.role as any).departmentId) deptIdVal = parseInt((data.role as any).departmentId);
          }
        }

        if (token) {
          localStorage.setItem('token', token);

          console.log("[Auth] Full response data:", data);
          console.log("[Auth] Extracted roleVal:", roleVal, "deptId:", deptIdVal);

          if (!roleVal) {
            console.error("[Auth] Role not found in response. Cannot authenticate.");
            return false;
          }

          roleVal = data.role && typeof data.role === 'object' ? (data.role as any).role : data.role;
          deptIdVal = data.role && typeof data.role === 'object' ? (data.role as any).departmentId : null;
          const deptNameVal = data.role && typeof data.role === 'object' ? (data.role as any).departmentName : null;

          const normalizedRole = normalizeRole(roleVal);
          const loggedInUser: User = {
            id: idVal,
            f_Name: fNameVal,
            l_Name: lNameVal,
            email: email,
            contactNo: '',
            gender: '',
            role: normalizedRole,
            state: true,
            departmentId: deptIdVal,
            department: deptNameVal || ''
          };

          setUser(loggedInUser);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          localStorage.setItem('role', normalizedRole);
          if (deptIdVal) localStorage.setItem('departmentId', deptIdVal.toString());
          if (deptNameVal) localStorage.setItem('departmentName', deptNameVal);

          console.log("Login successful, user:", loggedInUser);
          return true;
        } else {
          console.error("Token not found in response data:", data.data);
        }
      } else {
        console.error("Login response error:", data);
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    console.warn("switchRole used: this overrides/sets the role for testing.");
    const updatedUser: User = user
      ? { ...user, role }
      : {
        id: 999,
        f_Name: 'Demo',
        l_Name: 'User',
        email: 'demo@example.com',
        contactNo: '',
        gender: '',
        role,
        state: true
      };

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.setItem('role', role);
    // Set a dummy token for quick login to pass route guards if they check for it
    localStorage.setItem('token', 'demo-token');
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      switchRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
