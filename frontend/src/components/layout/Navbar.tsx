import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, MessageSquare, Calculator, TrendingUp, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import logo from '../../assets/rema_logo_no_bg.png';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'Properties', path: '/properties', icon: Home },
        { name: 'Opportunities', path: '/opportunities', icon: TrendingUp },
        { name: 'Calculate', path: '/calculate', icon: Calculator },
        { name: 'Ask REMA', path: '/chat', icon: MessageSquare },
    ];

    return (
        <nav className="fixed top-0 left-0 w-full bg-primary text-white z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2 ml-0">
                            <img src={logo} alt="REMA Logo" className="h-9 w-auto filter brightness-0 invert" />
                        </Link>
                        <div className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-2 ${location.pathname === link.path
                                            ? 'bg-primary-dark text-white'
                                            : 'text-gray-300 hover:bg-primary-light hover:text-white'
                                            }`}
                                    >
                                        {link.icon && <link.icon size={16} />}
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            {user && (
                                <Link to="/watchlist" className="p-1 rounded-full text-gray-400 hover:text-white focus:outline-none">
                                    <span className="sr-only">View watchlist</span>
                                    <Heart className="h-6 w-6" />
                                </Link>
                            )}
                            {user && user.is_admin && (
                                <Link to="/admin" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Admin Panel
                                </Link>
                            )}
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-secondary-light">Hi, {user.name.split(' ')[0]}</span>
                                    <button onClick={logout} className="text-sm text-gray-300 hover:text-white">Logout</button>
                                </div>
                            ) : (
                                <Link to="/login" className="bg-secondary hover:bg-secondary-dark text-primary font-bold py-2 px-4 rounded transition-colors">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-light focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-primary-dark">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-primary-light flex items-center gap-2"
                            >
                                {link.icon && <link.icon size={18} />}
                                {link.name}
                            </Link>
                        ))}
                        <Link
                            to="/watchlist"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-primary-light flex items-center gap-2"
                        >
                            <Heart size={18} /> Watchlist
                        </Link>
                        {!user && (
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-white hover:bg-primary-light"
                            >
                                Login
                            </Link>
                        )}
                        {user && user.is_admin && (
                            <Link
                                to="/admin"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:text-white hover:bg-primary-light"
                            >
                                Admin Panel
                            </Link>
                        )}
                        {user && (
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-primary-light"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};
