import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Story, StoryChoice, User, SubscriptionTier, StorySegment } from '../types';
import { generateInitialStory, continueStory, generateStoryConclusion, generateSceneImage } from '../services/geminiService';
import { saveStory, canAddStoryStep } from '../services/storyService';
import IconSparkles from './icons/IconSparkles';
import { useTranslations } from '../hooks/useTranslations';
import { ArrowLeft } from 'lucide-react';

interface StoryCreatorProps {
    user: User;
    storyToContinue: Story | null;
    setView: (view: string, context?: any) => void;
}

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
    <div className="flex justify-center items-center space-x-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <span className="text-slate-400">{text}</span>
    </div>
);

const SceneVisual: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [key, setKey] = useState(Date.now());
    const [isAnimating, setIsAnimating] = useState(true);

    const replayAnimation = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setKey(Date.now());
            setIsAnimating(true);
        }, 50);
    };

    return (
        <div className="mt-4 relative group">
            <div
                key={key}
                className={`w-full aspect-video bg-cover bg-center rounded-lg overflow-hidden bg-slate-700 ${isAnimating ? 'animate-kenburns' : ''}`}
                style={{ backgroundImage: `url(${imageUrl})` }}
            ></div>
            <button onClick={replayAnimation} className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Replay Scene
            </button>
        </div>
    );
};


const StoryCreator: React.FC<StoryCreatorProps> = ({ user, storyToContinue, setView }) => {
    const [story, setStory] = useState<Story | null>(storyToContinue);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [protagonist, setProtagonist] = useState(storyToContinue?.protagonist || '');
    const [setting, setSetting] = useState(storyToContinue?.setting || '');
    const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
    
    const endOfStoryRef = useRef<HTMLDivElement>(null);
    const { t, language } = useTranslations();

    useEffect(() => {
        endOfStoryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [story?.segments]);

    const handleBackToDashboard = () => {
        if (window.confirm(t('story_creator_back_warning'))) {
            setView('dashboard');
        }
    };
    
    const handleStartStory = async () => {
        if (!protagonist || !setting) {
            setError(t('error_define_hero'));
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const initialChoice: StoryChoice = await generateInitialStory(protagonist, setting, language);
            const newStory: Story = {
                id: `story_${Date.now()}`,
                title: `${protagonist} in ${setting}`,
                protagonist,
                setting,
                segments: [{ id: `seg_${Date.now()}`, ...initialChoice }],
                createdAt: new Date().toISOString(),
                isComplete: false,
            };
            setStory(newStory);
            saveStory(newStory);
            generateImageForSegment(newStory.segments[0].id, initialChoice.videoSuggestion);
        } catch (e: any) {
            setError(t('error_starting_story', { message: e.message }));
        } finally {
            setIsLoading(false);
        }
    };

    const generateImageForSegment = async (segmentId: string, prompt: string) => {
        if (user.subscriptionTier === SubscriptionTier.FREE) return; // Image generation for paid users only
        setIsGeneratingImage(true);
        const imageUrl = await generateSceneImage(prompt);
        setStory(currentStory => {
            if (!currentStory) return null;
            const updatedSegments = currentStory.segments.map(seg => seg.id === segmentId ? { ...seg, generatedImageUrl: imageUrl } : seg);
            const updatedStory = { ...currentStory, segments: updatedSegments };
            saveStory(updatedStory);
            return updatedStory;
        });
        setIsGeneratingImage(false);
    };

    const handleContinue = async () => {
        if (!story || !selectedChoice) return;
        
        if (!canAddStoryStep(story, user)) {
             setError(t('limitAlert', { limit: 5 }));
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const currentSegment = story.segments[story.segments.length - 1];

        const storyHistoryText = story.segments.map(s => s.paragraph).join('\n\n');

        try {
            const nextChoice = await continueStory(storyHistoryText, selectedChoice, language);
            
            const updatedStory: Story = {
                ...story,
                segments: [
                    ...story.segments.slice(0, -1),
                    {...currentSegment, chosenPath: selectedChoice},
                    { id: `seg_${Date.now()}`, ...nextChoice },
                ],
            };
            setStory(updatedStory);
            saveStory(updatedStory);
            setSelectedChoice(null);
            generateImageForSegment(updatedStory.segments[updatedStory.segments.length - 1].id, nextChoice.videoSuggestion);
        } catch (e: any) {
             setError(t('error_continuing_story', { message: e.message }));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEndStory = async () => {
        if (!story) return;
        setIsLoading(true);
        setError(null);
        const storyHistoryText = story.segments.map(s => s.paragraph).join('\n\n');
        
        try {
            const { conclusion, summary } = await generateStoryConclusion(storyHistoryText, language);
            const finalSegment: StorySegment = {
                 id: `seg_final_${Date.now()}`,
                 paragraph: conclusion,
                 videoSuggestion: 'A final, beautiful shot of the story\'s main setting as the sun sets.',
                 choices: [],
                 chosenPath: t('endStoryAndSummary')
            };
            generateImageForSegment(finalSegment.id, finalSegment.videoSuggestion);

            const updatedStory: Story = {
                ...story,
                segments: [...story.segments, finalSegment],
                isComplete: true,
                summary,
                conclusion,
            };
            setStory(updatedStory);
            saveStory(updatedStory);
        } catch (e: any) {
            setError(t('error_ending_story', { message: e.message }));
        } finally {
            setIsLoading(false);
        }
    };


    if (!story) {
        return (
            <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8 text-center">
                <IconSparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h1 className="text-3xl font-black text-white mb-4">{t('startANewStory')}</h1>
                <p className="text-slate-300 mb-8">{t('creator_intro')}</p>
                <div className="space-y-6">
                    <input type="text" value={protagonist} onChange={(e) => setProtagonist(e.target.value)} placeholder={t('protagonist_placeholder')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <input type="text" value={setting} onChange={(e) => setSetting(e.target.value)} placeholder={t('setting_placeholder')} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                    <button onClick={handleStartStory} disabled={isLoading} className="w-full bg-purple-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                        {isLoading ? <LoadingSpinner text={t('loading_tale')} /> : t('beginAdventure')}
                    </button>
                    {error && <p className="text-red-400 mt-4">{error}</p>}
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="relative text-center mb-8">
                {!story.isComplete && (
                    <button onClick={handleBackToDashboard} className="absolute left-0 top-0 flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 px-0 rounded-lg group">
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="group-hover:underline">{t('backToDashboard')}</span>
                    </button>
                )}
                <h1 className="text-3xl md:text-4xl font-black text-white pt-2">{story.title}</h1>
            </div>

            <p className="text-center text-slate-400 mb-8">{story.isComplete ? t('story_complete') : t('story_unfolds')}</p>
            <div className="space-y-10">
                {story.segments.map((segment) => (
                    <div key={segment.id} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{segment.paragraph}</p>
                        
                        {segment.generatedImageUrl ? (
                            <SceneVisual imageUrl={segment.generatedImageUrl} />
                        ) : (
                           segment.videoSuggestion && isGeneratingImage && <div className="mt-4"><LoadingSpinner text={t('loading_visual')} /></div>
                        )}
                        
                        {segment.chosenPath && (
                            <div className="mt-6">
                                <p className="text-sm text-slate-400">{segment.choices.length > 0 ? t('youChose') : t('path')}</p>
                                <p className="font-bold text-purple-300 p-3 bg-slate-700/50 rounded-md">"{segment.chosenPath}"</p>
                            </div>
                        )}
                        
                        {!story.isComplete && segment.id === story.segments[story.segments.length - 1].id && (
                            <div className="mt-6">
                                <h3 className="font-bold text-white mb-3">{t('whatHappensNext')}</h3>
                                <div className="space-y-3">
                                    {segment.choices.map((choice, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setSelectedChoice(choice)}
                                            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${selectedChoice === choice ? 'bg-purple-800/50 border-purple-500 ring-2 ring-purple-500' : 'bg-slate-700 hover:bg-purple-800/50 border-slate-600 hover:border-purple-500'}`}
                                        >
                                            <span className="font-bold text-white">{i + 1}. {choice}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                    <button onClick={handleContinue} disabled={!selectedChoice || isLoading} className="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                                        {t('continueTheStory')}
                                    </button>
                                    <button onClick={handleEndStory} disabled={isLoading} className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                                        {t('endStoryAndSummary')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {story.isComplete && story.summary && (
                    <div className="bg-slate-800 p-6 rounded-xl border border-purple-500 shadow-lg">
                        <h2 className="text-2xl font-bold text-purple-300 mb-4">{t('storySummary')}</h2>
                        <p className="text-slate-300 whitespace-pre-wrap">{story.summary}</p>
                        <div className="mt-6 flex gap-4">
                             <button onClick={() => setView('dashboard')} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                                {t('backToDashboard')}
                            </button>
                        </div>
                    </div>
                )}

                 <div ref={endOfStoryRef} />
                {isLoading && <div className="p-6"><LoadingSpinner text={t('loading_tale')} /></div>}
                {error && <p className="text-red-400 text-center mt-4">{error}</p>}
                
                 {story.segments.length > 0 && !canAddStoryStep(story, user) && user.subscriptionTier === SubscriptionTier.FREE && !story.isComplete && (
                     <div className="text-center p-6 bg-yellow-900/30 border border-yellow-500 rounded-xl">
                        <h3 className="text-xl font-bold text-yellow-300">{t('freeStoryLimitReached')}</h3>
                        <p className="text-yellow-200 mt-2">{t('freeStoryLimit_desc')}</p>
                        <button onClick={() => setView('subscriptions')} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg">
                            {t('viewPlans')}
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default StoryCreator;