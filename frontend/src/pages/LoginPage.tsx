import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import { MessageSquare } from 'lucide-react';
import logo from '../assets/rema_logo_bg.png';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = await login(email, password);
        if (success) {
            navigate('/properties');
        } else {
            setError('Invalid credentials');
        }
    };

    return (
        <Layout>
            <div className="flex min-h-[calc(100vh-64px)]">
                {/* Left Side - AI Teaser */}
                <div className="hidden lg:flex w-1/3 bg-primary-light text-white p-12 flex-col justify-center items-start">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl w-full max-w-sm transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-secondary p-2 rounded-full">
                                <MessageSquare size={24} className="text-primary" />
                            </div>
                            <span className="font-bold text-lg">Ask REMA</span>
                        </div>
                        <p className="text-gray-200 italic mb-4">
                            "What's the average home price in Amman?"
                        </p>
                        <div className="bg-white/20 h-px w-full mb-3"></div>
                        <p className="text-sm text-gray-300">
                            Login to unlock full AI insights and property predictions.
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-secondary/10">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-secondary/20">
                        <div className="flex justify-center mb-6">
                            <img src={logo} alt="REMA Logo" className="h-16 w-auto" />
                        </div>
                        <h2 className="text-3xl font-bold text-center text-primary mb-2">Welcome Back</h2>
                        <p className="text-center text-gray-500 mb-8">Sign in to access your watchlist</p>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                                <div className="flex justify-end mt-1">
                                    <a href="#" className="text-xs text-primary hover:text-primary-light">Forgot Password?</a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-600">Google</span>
                                </button>
                                <button className="flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <span className="text-sm font-medium text-gray-600">Facebook</span>
                                </button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-primary hover:text-secondary transition-colors">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
