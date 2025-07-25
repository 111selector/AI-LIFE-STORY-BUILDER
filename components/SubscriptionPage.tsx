import React from 'react';
import { SUBSCRIPTION_PLANS, PAYMENT_METHOD_KEYS } from '../constants';
import { SubscriptionTier, User } from '../types';
import IconCrown from './icons/IconCrown';
import { useTranslations } from '../hooks/useTranslations';
import { ArrowLeft } from 'lucide-react';

interface SubscriptionPageProps {
  user: User;
  onUpgrade: (tier: SubscriptionTier) => void;
  setView: (view: string) => void;
}

const tierStyles: Record<SubscriptionTier, { bg: string, button: string, ring: string }> = {
    [SubscriptionTier.FREE]: { bg: 'bg-slate-700', button: 'bg-slate-600', ring: 'ring-slate-500'},
    [SubscriptionTier.BASIC]: { bg: 'bg-blue-900/30', button: 'bg-blue-600 hover:bg-blue-700', ring: 'ring-blue-500'},
    [SubscriptionTier.PRO]: { bg: 'bg-purple-900/30', button: 'bg-purple-600 hover:bg-purple-700', ring: 'ring-purple-500'},
    [SubscriptionTier.PREMIUM]: { bg: 'bg-yellow-900/30', button: 'bg-yellow-500 hover:bg-yellow-600', ring: 'ring-yellow-400'},
}

const CheckIcon: React.FC = () => (
    <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
);

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ user, onUpgrade, setView }) => {
  const { t } = useTranslations();
  const plans = Object.values(SUBSCRIPTION_PLANS);

  const getButtonText = (planTier: SubscriptionTier, planPrice: number) => {
    const userPlanPrice = SUBSCRIPTION_PLANS[user.subscriptionTier].price;
    if (user.subscriptionTier !== SubscriptionTier.FREE && userPlanPrice < planPrice) {
        return t('upgrade');
    }
    if (planPrice === 0) {
        return t('startFree');
    }
    return t('getPlan', { tier: planTier });
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="relative mb-12">
        <button onClick={() => setView('dashboard')} className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToDashboard')}</span>
        </button>
        <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-white">{t('chooseYourPlan')}</h1>
            <p className="text-slate-300 mt-2 max-w-2xl mx-auto">{t('subscriptions_intro')} <span className="font-bold text-purple-400">{user.subscriptionTier}</span>.</p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <div key={plan.tier} className={`rounded-xl p-6 flex flex-col border ${plan.tier === SubscriptionTier.PRO ? 'border-purple-500' : 'border-slate-700'} ${tierStyles[plan.tier].bg} ${plan.tier === user.subscriptionTier ? 'ring-2 ' + tierStyles[plan.tier].ring : ''}`}>
            <div className="flex-grow">
              <h2 className="text-2xl font-bold text-white flex items-center">
                {plan.tier === SubscriptionTier.PRO && <IconCrown className="w-6 h-6 mr-2 text-purple-400" />}
                {plan.tier === SubscriptionTier.PREMIUM && <IconCrown className="w-6 h-6 mr-2 text-yellow-400" />}
                {plan.tier}
              </h2>
              <p className="text-4xl font-black text-white my-4">${plan.price}<span className="text-base font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-3 text-slate-300">
                {plan.featureKeys.map(featureKey => (
                  <li key={featureKey} className="flex items-start">
                    <CheckIcon/>
                    <span>{t(featureKey as any)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8">
                {user.subscriptionTier === plan.tier ? (
                     <button disabled className="w-full text-center py-3 px-6 rounded-lg font-bold bg-green-600 text-white cursor-default">
                        {t('currentPlan_label')}
                    </button>
                ) : (
                    <button onClick={() => onUpgrade(plan.tier)} className={`w-full text-center py-3 px-6 rounded-lg font-bold text-white transition-transform transform hover:scale-105 ${tierStyles[plan.tier].button}`}>
                       {getButtonText(plan.tier, plan.price)}
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <h3 className="text-lg font-bold text-white">{t('paymentMethods')}</h3>
        <div className="flex flex-wrap justify-center items-center gap-4 mt-4 text-slate-400">
          {PAYMENT_METHOD_KEYS.map(key => t(key as any)).join(' • ')}
        </div>
        <p className="text-xs text-slate-500 mt-4">{t('paymentDisclaimer')}</p>
      </div>
    </div>
  );
};

export default SubscriptionPage;