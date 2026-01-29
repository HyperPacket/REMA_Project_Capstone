import { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import type { DashboardStats, PropertyListResponse, UserListResponse } from '../api/admin';
import { Navbar } from '../components/layout/Navbar';
import { Search } from 'lucide-react';

export const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Properties State
    const [propsData, setPropsData] = useState<PropertyListResponse | null>(null);
    const [propSearch, setPropSearch] = useState('');
    const [loadingProps, setLoadingProps] = useState(true);

    // Users State
    const [usersData, setUsersData] = useState<UserListResponse | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [deleteLoading, setDeleteLoading] = useState<string | number | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'properties') {
            fetchProperties();
        } else {
            fetchUsers();
        }
    }, [activeTab]);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'properties') fetchProperties();
        }, 500);
        return () => clearTimeout(timer);
    }, [propSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'users') fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [userSearch]);

    const fetchStats = async () => {
        try {
            setStats(await adminApi.getStats());
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProperties = async () => {
        setLoadingProps(true);
        try {
            setPropsData(await adminApi.getProperties(1, 50, propSearch));
        } finally {
            setLoadingProps(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            setUsersData(await adminApi.getUsers(1, 50, userSearch));
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDeleteProperty = async (id: number) => {
        if (!confirm('Permanently delete this property?')) return;
        setDeleteLoading(id);
        try {
            await adminApi.deleteProperty(id);
            await fetchProperties();
            await fetchStats();
        } catch (err) {
            console.error(err);
            alert('Failed to delete property');
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Permanently delete this user?')) return;
        setDeleteLoading(id);
        try {
            await adminApi.deleteUser(id);
            await fetchUsers();
            await fetchStats();
        } catch (err) {
            console.error(err);
            alert('Failed to delete user');
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
            <Navbar />

            <main className="container mx-auto px-4 py-8 mt-16 max-w-7xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Dashboard</h1>
                        <p className="text-zinc-400">Overview and management</p>
                    </div>

                    {/* Tabs */}
                    <div className="bg-zinc-900/50 p-1 rounded-lg border border-zinc-800 flex">
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'properties'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Properties
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            Users
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {activeTab === 'properties' ? (
                    <div className="space-y-6">
                        {/* Counter Card */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Properties</p>
                                <h2 className="text-4xl font-bold text-white mt-1">
                                    {stats?.total_properties.toLocaleString() || '-'}
                                </h2>
                            </div>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID, city, or location..."
                                value={propSearch}
                                onChange={(e) => setPropSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-medium tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Price</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {loadingProps ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                                    ) : propsData?.items.map((prop) => (
                                        <tr key={prop.id} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-zinc-500 group-hover:text-zinc-300">#{prop.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{prop.neighborhood}</div>
                                                <div className="text-sm text-zinc-500">{prop.city}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-emerald-400">
                                                {prop.price.toLocaleString()} JOD
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteProperty(prop.id)}
                                                    disabled={deleteLoading === prop.id}
                                                    className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition-all"
                                                >
                                                    {deleteLoading === prop.id ? '...' : 'Delete'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingProps && propsData?.items.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No properties found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Counter Card */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Users</p>
                                <h2 className="text-4xl font-bold text-white mt-1">
                                    {stats?.total_users.toLocaleString() || '-'}
                                </h2>
                            </div>
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-800/50 text-zinc-400 text-xs uppercase font-medium tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {loadingUsers ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                                    ) : usersData?.items.map((user) => (
                                        <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-xs text-zinc-600 group-hover:text-zinc-500 truncate max-w-[100px]" title={user.id}>
                                                {user.id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{user.name}</div>
                                                {user.is_admin && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded ml-1">ADMIN</span>}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!user.is_admin && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        disabled={deleteLoading === user.id}
                                                        className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded text-sm font-medium transition-all"
                                                    >
                                                        {deleteLoading === user.id ? '...' : 'Delete'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {!loadingUsers && usersData?.items.length === 0 && (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
