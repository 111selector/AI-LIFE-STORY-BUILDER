import React, { useState } from 'react';
import { useTranslations } from '../hooks/useTranslations';
import IconSparkles from './icons/IconSparkles';
import IconGoogle from './icons/IconGoogle';
import IconFacebook from './icons/IconFacebook';
import IconApple from './icons/IconApple';
import IconMicrosoft from './icons/IconMicrosoft';
import IconTikTok from './icons/IconTikTok';
import { APP_NAME } from '../constants';

interface HomePageProps {
    onLogin: (name: string, email: string) => void;
}

const SocialButton: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
        {icon}
        <span className="text-white font-semibold">{text}</span>
    </button>
);

const HomePage: React.FC<HomePageProps> = ({ onLogin }) => {
    const { t } = useTranslations();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const loginName = isSignUp ? name : (email.split('@')[0] || 'User');
        onLogin(loginName, email);
    };

    const handleSocialLogin = (provider: string) => {
        const mockEmail = `${provider.toLowerCase().replace(' ', '')}user@example.com`;
        onLogin(`${provider} User`, mockEmail);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4" style={{backgroundImage: 'radial-gradient(circle at top, rgba(120, 113, 196, 0.1), transparent 40%)'}}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <IconSparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-black text-white">{APP_NAME}</h1>
                    <p className="text-slate-300 mt-2">{t('imaginationLeads')}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-center mb-6">{isSignUp ? t('createAccount') : t('signIn')}</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <SocialButton icon={<IconGoogle className="w-5 h-5" />} text="Google" onClick={() => handleSocialLogin('Google')} />
                        <SocialButton icon={<IconFacebook className="w-5 h-5" />} text="Facebook" onClick={() => handleSocialLogin('Facebook')} />
                        <SocialButton icon={<IconApple className="w-5 h-5" />} text="Apple" onClick={() => handleSocialLogin('Apple')} />
                        <SocialButton icon={<IconMicrosoft className="w-5 h-5" />} text="Microsoft" onClick={() => handleSocialLogin('Microsoft')} />
                        <SocialButton icon={<IconTikTok className="w-5 h-5" />} text="TikTok" onClick={() => handleSocialLogin('TikTok')} />
                    </div>

                    <div className="flex items-center my-6">
                        <hr className="w-full border-slate-700" />
                        <span className="px-4 text-slate-400 font-semibold text-sm">{t('or')}</span>
                        <hr className="w-full border-slate-700" />
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        {isSignUp && (
                             <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('yourName')} aria-label={t('yourName')} required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                        )}
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('emailAddress')} aria-label={t('emailAddress')} required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('password')} aria-label={t('password')} required className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                        <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-slate-600 transition-colors">
                            {isSignUp ? t('signUp') : t('signIn')}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 mt-6 text-sm">
                        {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                        <button onClick={() => setIsSignUp(!isSignUp)} className="font-semibold text-purple-400 hover:text-purple-300">
                           {isSignUp ? t('signIn') : t('signUp')}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;