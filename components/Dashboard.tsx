import React, { useState, useEffect, useRef } from 'react';
import { User, Story, SubscriptionTier } from '../types';
import { getStories, canCreateStory, canDownloadStory, incrementDownloadsUsed } from '../services/storyService';
import { SUBSCRIPTION_PLANS } from '../constants';
import IconBookOpen from './icons/IconBookOpen';
import IconCrown from './icons/IconCrown';
import { MoreVertical, FileText, Video, Download, Loader2 } from 'lucide-react';
import { downloadTxt, downloadPdf } from '../services/downloadService';
import { downloadVideoPackage } from '../services/videoService';
import { useTranslations } from '../hooks/useTranslations';

interface DashboardProps {
  user: User;
  setView: (view: string, context?: any) => void;
}

const DownloadMenu: React.FC<{story: Story, user: User, setView: Function, t: Function}> = ({ story, user, setView, t }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDownload = (type: 'pdf' | 'video') => {
        setIsOpen(false);
        if (!canDownloadStory(user)) {
            alert(t('downloadLimitReached'));
            setView('subscriptions');
            return;
        }

        const tForDownload = (key: any, replacements?: any) => t(key, replacements);
        
        if (type === 'pdf') {
            if (user.subscriptionTier === SubscriptionTier.BASIC) {
                downloadTxt(story, user, tForDownload);
            } else { // PRO and PREMIUM get PDF
                downloadPdf(story, user, tForDownload);
            }
            incrementDownloadsUsed(user);
            setView('dashboard', { refresh: Date.now() });
        } else if (type === 'video') {
            setIsLoading(true);
            downloadVideoPackage(story, user, tForDownload)
                .then(() => {
                    incrementDownloadsUsed(user);
                    setView('dashboard', { refresh: Date.now() });
                })
                .catch(err => {
                    console.error(err);
                    alert(t('video_generation_error'));
                })
                .finally(() => setIsLoading(false));
        }
    };

    if (!story.isComplete || plan.downloadLimit === 0) {
        return <span className="text-xs text-slate-500 italic">{!story.isComplete ? t('inProgress') : t('downloadsNotAvailable')}</span>;
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('preparing_video_package')}</span>
            </div>
        );
    }
    
    if (!canDownloadStory(user)) {
        return (
             <button onClick={() => setView('subscriptions')} className="bg-yellow-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-yellow-600 transition-colors">
                {t('stories_upgradeToDownload')}
            </button>
        )
    }

    const canDownloadVideo = plan.videoExport;

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{t('stories_download')}</span>
                <MoreVertical className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10">
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => handleDownload('pdf')}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                {user.subscriptionTier === SubscriptionTier.BASIC ? 'Download .txt' : t('download_pdf')}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleDownload('video')}
                                disabled={!canDownloadVideo}
                                className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Video className="w-4 h-4 mr-2" />
                                {t('download_video_package')}
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

const StoryListItem: React.FC<{ story: Story; user: User; onContinue: (story: Story) => void, setView: Function, t: Function, language: string }> = ({ story, user, onContinue, setView, t, language }) => {
    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];
    const maxSteps = plan.tier === SubscriptionTier.FREE ? 5 : 50;
    const progress = story.isComplete ? 100 : Math.min(100, (story.segments.length / maxSteps) * 100);
    const createdDate = new Date(story.createdAt).toLocaleDateString(language);
    
    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition-colors group">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">{story.title}</h3>
                    <p className="text-xs text-slate-400">
                        {t('stories_progress', { count: story.segments.length })}. {story.isComplete ? t('stories_completed') : t('stories_createdOn', { date: createdDate })}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    {story.isComplete ? (
                        <DownloadMenu story={story} user={user} setView={setView} t={t} />
                    ) : (
                        <button onClick={() => onContinue(story)} className="bg-purple-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-purple-700 transition-colors">
                            {t('stories_continue')}
                        </button>
                    )}
                </div>
            </div>
             <div className="w-full bg-slate-700 rounded-full h-1.5 mt-3">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ user, setView }) => {
  const [stories, setStories] = useState<Story[]>([]);
  const { t, language } = useTranslations();
  const userCanCreate = canCreateStory(user);
  const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];

  useEffect(() => {
    setStories(getStories().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [user]);

  const handleContinueStory = (story: Story) => {
    setView('story-creator', { storyToContinue: story });
  };
  
  const handleStartNew = () => {
      if(userCanCreate){
          setView('story-creator', { storyToContinue: null });
      } else {
          alert(t('storyLimitReached', { limit: plan.storyLimit }));
          setView('subscriptions');
      }
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700">
            <h1 className="text-3xl font-bold text-white">{t('welcomeBack', { name: user.name })}</h1>
            <p className="text-slate-300 mt-1">{t('creativeJourneyAwaits')}</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center"><IconBookOpen className="mr-2"/>{t('myStories')}</h2>
          </div>
          <div className="space-y-4">
            {stories.length > 0 ? (
              stories.map(story => <StoryListItem key={story.id} story={story} user={user} onContinue={handleContinueStory} setView={setView} t={t} language={language}/>)
            ) : (
              <div className="text-center py-16 bg-slate-800 rounded-lg border-2 border-dashed border-slate-700">
                <p className="text-slate-400">{t('stories_empty_state_p1')}</p>
                <p className="text-slate-300 mt-2">{t('stories_empty_state_p2')}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">{t('startNewStory')}</h2>
                <p className="text-slate-400 mb-4 text-sm">{t('startNewStory_desc')}</p>
                <button onClick={handleStartNew} disabled={!userCanCreate} className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                    {userCanCreate ? t('createAStory') : t('storyLimitReached')}
                </button>
                 {!userCanCreate && (
                    <button onClick={() => setView('subscriptions')} className="w-full mt-3 bg-yellow-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                        {t('upgradePlan')}
                    </button>
                 )}
                 <div className="mt-6 border-t border-slate-700 pt-4">
                     <h3 className="font-bold text-white flex items-center"><IconCrown className="mr-2 text-purple-400" />{t('subscriptionStatus')}</h3>
                     <div className="text-sm mt-2 space-y-1 text-slate-300">
                        <p>{t('plan')}: <span className="font-bold text-purple-300">{plan.tier}</span></p>
                        <p>{t('stories')}: <span className="font-bold">{user.storiesCreated} / {plan.storyLimit === Infinity ? t('unlimited') : plan.storyLimit}</span></p>
                        <p>{t('downloads')}: <span className="font-bold">{user.downloadsUsed} / {plan.downloadLimit}</span></p>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;