import { Link } from 'react-router-dom';
import { Mail, Linkedin, Twitter, MapPin } from 'lucide-react';
import logo from '../../assets/rema_logo_no_bg.png';

export const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 flex items-center">
                                <img src={logo} alt="REMA Logo" className="h-10 w-auto" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">REMA</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empowering Jordan's real estate market with AI-driven insights and opportunities.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/properties" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Properties</Link></li>
                            <li><Link to="/opportunities" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Opportunities</Link></li>
                            <li><Link to="/calculate" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Calculator</Link></li>
                            <li><Link to="/about" className="text-gray-400 hover:text-primary-light transition-colors text-sm">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link to="/cookies" className="text-gray-400 hover:text-primary-light transition-colors text-sm">Cookie Settings</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-lg mb-6 text-white">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-400">
                                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-primary" />
                                <span>Amman, Jordan</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-400">
                                <Mail size={18} className="flex-shrink-0 text-primary" />
                                <a href="mailto:support@rema.jo" className="hover:text-white transition-colors">support@rema.jo</a>
                            </li>
                            <li className="flex items-center gap-4 pt-2">
                                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white transition-all text-gray-400">
                                    <Linkedin size={18} />
                                </a>
                                <a href="#" className="bg-slate-800 p-2 rounded-full hover:bg-primary hover:text-white transition-all text-gray-400">
                                    <Twitter size={18} />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">© 2025 REMA. All rights reserved.</p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <span className="hover:text-gray-300 cursor-pointer transition-colors">English</span>
                        <span className="hover:text-gray-300 cursor-pointer transition-colors">العربية</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
