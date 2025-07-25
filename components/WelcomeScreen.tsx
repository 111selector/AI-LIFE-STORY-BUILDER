import React from 'react';
import IconSparkles from './icons/IconSparkles';
import { useTranslations } from '../hooks/useTranslations';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="text-center max-w-2xl mx-auto bg-slate-800/50 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <IconSparkles className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
          {t('welcomeTo')}
        </h1>
        <p className="text-lg text-slate-300 mb-8">
          {t('imaginationLeads')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-white">{t('feature1_title')}</h3>
                <p className="text-slate-400 text-sm">{t('feature1_desc')}</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-white">{t('feature2_title')}</h3>
                <p className="text-slate-400 text-sm">{t('feature2_desc')}</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-white">{t('feature3_title')}</h3>
                <p className="text-slate-400 text-sm">{t('feature3_desc')}</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="font-bold text-white">{t('feature4_title')}</h3>
                <p className="text-slate-400 text-sm">{t('feature4_desc')}</p>
            </div>
        </div>
        
        <button
          onClick={onStart}
          className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg"
        >
          {t('letsBegin')}
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
