'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/api/auth';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'enterEmail' | 'enterCode'>('enterEmail');
    const [message, setMessage] = useState('');
    const { loginUser, loginUserFromData } = useAuth();


    const handleSendCode = async () => {
        if (!email) return setMessage('请输入邮箱');
        try {
            await authApi.requestCode(email); // ✅ 调用统一 axios 封装
            setStep('enterCode');
            setMessage('验证码已发送，请查收邮箱');
        } catch (err: any) {
            setMessage(err.response?.data?.error || '发送验证码失败');
        }
    };


    const handleLoginOrRegister = async () => {
        if (!email || !code) return setMessage('请输入验证码');
        try {
            // 调用接口
            const res: any = await authApi.loginOrRegister(email, code);
            const userData = res.data; // 后端返回的用户信息

            if (!userData) throw new Error("未返回用户信息");

            // 直接通知 AuthProvider 更新状态
            loginUserFromData(userData); // ⚡ 新增一个方法只更新状态而不重复请求

            setMessage('登录成功！');

            // 可选：跳转页面
            // router.push('/'); 
        } catch (err: any) {
            setMessage(err.response?.data?.message || err.message || '验证码错误');
        }
    };



    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
            <h1 className="text-2xl mb-4">邮箱登录 / 注册</h1>

            {step === 'enterEmail' && (
                <>
                    <input
                        type="email"
                        placeholder="请输入邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border mb-4"
                    />
                    <button
                        onClick={handleSendCode}
                        className="w-full bg-blue-500 text-white py-2 rounded"
                    >
                        发送验证码
                    </button>
                </>
            )}

            {step === 'enterCode' && (
                <>
                    <input
                        type="text"
                        placeholder="请输入验证码"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full p-2 border mb-4"
                    />
                    <button
                        onClick={handleLoginOrRegister}
                        className="w-full bg-green-500 text-white py-2 rounded"
                    >
                        登录 / 注册
                    </button>
                </>
            )}

            {message && <p className="mt-4 text-red-500">{message}</p>}
        </div>
    );
}
