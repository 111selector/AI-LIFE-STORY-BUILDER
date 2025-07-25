import React, { useState, useRef, useEffect } from 'react';
import { User, SubscriptionTier } from '../types';
import { APP_NAME } from '../constants';
import IconHome from './icons/IconHome';
import IconBookOpen from './icons/IconBookOpen';
import IconSparkles from './icons/IconSparkles';
import IconCrown from './icons/IconCrown';
import IconGlobe from './icons/IconGlobe';
import { useTranslations } from '../hooks/useTranslations';
import { languages, LanguageCode } from '../i18n/languages';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  setView: (view: string, context?: any) => void;
  onLogout: () => void;
}

const tierColorMap: Record<SubscriptionTier, string> = {
  [SubscriptionTier.FREE]: "text-gray-400",
  [SubscriptionTier.BASIC]: "text-blue-400",
  [SubscriptionTier.PRO]: "text-purple-400",
  [SubscriptionTier.PREMIUM]: "text-yellow-400",
};

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLanguageChange = (langCode: LanguageCode) => {
        setLanguage(langCode);
        setIsOpen(false);
        setSearchTerm('');
    }
    
    const filteredLanguages = Object.keys(languages).filter(code => {
        const lang = languages[code as LanguageCode];
        if (!lang) return false;
        const searchTermLower = searchTerm.toLowerCase();
        return lang.name.toLowerCase().includes(searchTermLower) ||
               lang.nativeName.toLowerCase().includes(searchTermLower);
    });

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                <IconGlobe className="w-5 h-5 text-gray-300" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-50">
                    <div className="p-2 border-b border-slate-700">
                        <input
                            type="text"
                            placeholder="Search language..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            autoFocus
                        />
                    </div>
                    <ul className="py-1 max-h-72 overflow-y-auto">
                        {filteredLanguages.map((code) => (
                            <li key={code}>
                                <button
                                    onClick={() => handleLanguageChange(code as LanguageCode)}
                                    className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${language === code ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}
                                >
                                  <span className="font-medium">{languages[code as LanguageCode].nativeName}</span>
                                  <span className="text-slate-400 ml-2">({languages[code as LanguageCode].name})</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ user, setView, onLogout }) => {
  const { t } = useTranslations();
  
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => setView('dashboard')} className="flex items-center space-x-2 text-white hover:text-purple-400 transition-colors">
              <IconSparkles className="w-8 h-8 text-purple-500" />
              <span className="text-xl font-black tracking-tighter">{APP_NAME}</span>
            </button>
            <div className="hidden md:flex items-center space-x-4">
                 <button onClick={() => setView('dashboard')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white">
                    <IconHome className="w-5 h-5 mr-2" />
                    {t('dashboard')}
                </button>
                <button onClick={() => setView('story-creator')} className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white">
                    <IconBookOpen className="w-5 h-5 mr-2" />
                    {t('newStory')}
                </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <div className="text-sm text-gray-300">{user.name}</div>
                <button onClick={() => setView('subscriptions')} className={`flex items-center space-x-1 text-xs font-bold ${tierColorMap[user.subscriptionTier]} hover:brightness-125 transition`}>
                  <IconCrown className="w-4 h-4"/>
                  <span>{t('currentPlan', { tier: user.subscriptionTier })}</span>
                </button>
              </div>
              <button onClick={onLogout} title="Logout" className="p-2 rounded-full hover:bg-slate-700 transition-colors">
                  <LogOut className="w-5 h-5 text-red-400 hover:text-red-300"/>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;