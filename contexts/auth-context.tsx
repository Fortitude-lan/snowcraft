'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { adminloginApi, authApi, syncUserApi } from '@/api/auth';

type User = {
  clerk_id: string;
  id: string;
  email: string;
  username: string;
  address: string;
  created_at: string;
  updated_at: string;
  role?: 'user' | 'admin';
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loginAdmin: (data: { username: string; password: string }) => Promise<void>;
  logoutAdmin: () => void;
  loginUser: (email: string, code: string) => Promise<void>;
  loginUserFromData: (userData: User) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [clerkSynced, setClerkSynced] = useState(false); // 避免重复调用 Clerk 同步
  const { user: clerkUser, isSignedIn } = useUser();

  /** 
   * Clerk 用户同步到后端
   */
  const syncClerkUser = async (clerkUser: any) => {
    if (!clerkUser) return;

    const syncedId = localStorage.getItem("clerkSyncedId");
    if (syncedId === clerkUser.id) return;

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    const clerk_id = clerkUser.id;

    if (!email) return;

    try {
      const res: any = await syncUserApi({
        id: clerk_id,
        email,
        name,
      });

      if (res.code === 200) {
        const userInfo = res.data;

        setUser(userInfo);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("clerkSyncedId", clerk_id);
        setClerkSynced(true);
      }
    } catch (err) {
      console.error("Sync clerk user failed:", err);
    }
  };


  /**
  * 后台管理员登录
  * @param data 登录信息 { username, password }
  * 调用 adminloginApi 获取 token 和用户信息，并保存到 localStorage 和 context
  */
  const loginAdmin = async (data: { username: string; password: string }) => {
    try {
      const res:any = await adminloginApi(data);

      // 保存 token 到 localStorage
      localStorage.setItem('Token', res.access);
      localStorage.setItem('RefreshToken', res.refresh);

      // 更新 context
      setToken(res.access);
      setUser(res.user);

      // 跳转到后台首页
      router.replace('/dashboard');
    } catch (err) {
      console.error('Admin login failed:', err);
      // 可加 toast 提示
    }
  };

  /**
   * 后台管理员登出
   * 清理本地存储，并跳转回后台登录页
   */
  const logoutAdmin = () => {
    // 清理 token 和用户信息
    localStorage.removeItem('Token');
    localStorage.removeItem('RefreshToken');
    localStorage.removeItem('User');

    setToken(null);
    setUser(null);

    // 跳转到后台登录页
    router.replace('/adminlogin');
  };

  /**
   * 前台邮箱验证码登录/注册
   */
  const loginUser = async (email: string, code: string) => {
    const res: any = await authApi.loginOrRegister(email, code);
    const userData: User = res.data?.data;
    if (!userData) throw new Error('未返回用户信息');
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const loginUserFromData = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('clerkSyncedId');
    setUser(null);
    router.replace('/sign-in');
  };

  /** 
   * Clerk 登录变化监听
   */
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncClerkUser(clerkUser);
    }
  }, [clerkUser, isSignedIn]);

  /**
   * 页面刷新/首次加载，从 localStorage 恢复用户信息
   */
  useEffect(() => {
    // 尝试恢复前台用户
    const u = localStorage.getItem('userInfo');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem('userInfo');
      }
    }

    // 尝试恢复管理员
    const t = localStorage.getItem('Token');
    if (t && !user) {
      // 简单处理：只要有 access token 就认为管理员已登录
      setToken(t);
      setUser({ username: 'admin', role: 'admin' } as any);
      // 注意这里 user 结构可以保持简单
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loginAdmin, logoutAdmin, loginUser, loginUserFromData, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
