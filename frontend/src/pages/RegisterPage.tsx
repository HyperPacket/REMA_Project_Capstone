import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/layout/Layout';
import logo from '../assets/rema_logo_bg.png';

export const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: 'Amman',
    });
    const { register, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Exclude city from submission as backend doesn't expect it
        const { city, ...submitData } = formData;
        await register(submitData);
        // Show modal placeholder?
        navigate('/properties');
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-secondary/5">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-primary p-6 text-white text-center flex flex-col items-center">
                        <img src={logo} alt="REMA" className="h-12 w-auto mb-3 bg-white/10 p-1 rounded" />
                        <h2 className="text-2xl font-bold">Join REMA</h2>
                        <p className="text-secondary-light text-sm mt-1">Unlock AI-powered real estate insights</p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+962 7..."
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary outline-none"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" required className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                    <span className="text-sm text-gray-600">I agree to the <a href="#" className="text-primary underline">Terms of Service</a>.</span>
                                </label>
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-lg transition-colors shadow-md"
                                >
                                    Create Account
                                </button>
                            </div>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-secondary">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
