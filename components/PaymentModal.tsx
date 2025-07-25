import React, { useState, useEffect } from 'react';
import { SubscriptionPlan, SubscriptionTier } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { PAYMENT_METHOD_KEYS } from '../constants';
import { CreditCard, Smartphone, Wallet, Apple, X } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  plan: Omit<SubscriptionPlan, 'features' | 'featureKeys'>;
}

const PaymentMethodIcon: React.FC<{ method: string; className?: string }> = ({ method, className }) => {
    const baseClass = "w-6 h-6";
    const finalClass = `${baseClass} ${className || ''}`;
    switch (method) {
        case 'creditCard': return <CreditCard className={finalClass} />;
        case 'mobileMoney': return <Smartphone className={finalClass} />;
        case 'paypal': return <Wallet className={finalClass} />; // Generic wallet icon
        case 'googlePay': return <Wallet className={finalClass} />; // Generic wallet icon
        case 'applePay': return <Apple className={finalClass} />;
        default: return <Wallet className={finalClass} />;
    }
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, plan }) => {
    const { t } = useTranslations();
    const [selectedMethod, setSelectedMethod] = useState<string>(PAYMENT_METHOD_KEYS[0]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Mock state for controlled credit card form
    const [mockCardNumber, setMockCardNumber] = useState('');
    const [mockExpiry, setMockExpiry] = useState('');
    const [mockCvc, setMockCvc] = useState('');
    
    useEffect(() => {
        // Reset form state when payment method changes
        setMockCardNumber('');
        setMockExpiry('');
        setMockCvc('');
    }, [selectedMethod]);


    const handlePayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            onConfirm();
        }, 2000); // Simulate network delay
    };

    if (!isOpen) return null;

    const renderPaymentForm = () => {
        switch (selectedMethod) {
            case 'creditCard':
                return (
                    <div className="space-y-4">
                        <input type="text" name="cardNumber" value={mockCardNumber} onChange={(e) => setMockCardNumber(e.target.value)} placeholder={t('card_number')} className="w-full bg-slate-700/50 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                        <div className="flex gap-4">
                            <input type="text" name="expiry" value={mockExpiry} onChange={(e) => setMockExpiry(e.target.value)} placeholder={t('expiry_date')} className="w-1/2 bg-slate-700/50 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                            <input type="text" name="cvc" value={mockCvc} onChange={(e) => setMockCvc(e.target.value)} placeholder={t('cvc')} className="w-1/2 bg-slate-700/50 border border-slate-600 rounded-md p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none" />
                        </div>
                    </div>
                );
            case 'mobileMoney':
                const mobileMoneyInstructions = t('mobile_money_instructions', { price: String(plan.price) }).replace(/\n/g, '<br />');
                return (
                     <div className="text-center text-slate-300 leading-relaxed p-4 bg-slate-700/50 rounded-lg">
                        <p dangerouslySetInnerHTML={{ __html: mobileMoneyInstructions }}></p>
                    </div>
                );
            case 'paypal':
                 const paypalInstructions = t('paypal_instructions', { price: `$${plan.price}` }).replace(/\n/g, '<br />');
                return (
                     <div className="text-center text-slate-300 leading-relaxed p-4 bg-slate-700/50 rounded-lg">
                       <p dangerouslySetInnerHTML={{ __html: paypalInstructions }}></p>
                    </div>
                );
            case 'googlePay':
                return <p className="text-center text-slate-300">{t('pay_with_google')}</p>;
            case 'applePay':
                return <p className="text-center text-slate-300">{t('pay_with_apple')}</p>;
            default:
                return null;
        }
    };
    
    const isCardFormValid = !!(mockCardNumber && mockExpiry && mockCvc);
    const isButtonDisabled = isProcessing || (selectedMethod === 'creditCard' && !isCardFormValid);
    const isManualPayment = selectedMethod === 'mobileMoney' || selectedMethod === 'paypal';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[100] p-4" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 transform transition-all">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">{t('payment_modal_title')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: Plan details */}
                    <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">{t('plan_to_purchase')}</h3>
                        <p className="text-3xl font-black text-white">{plan.tier}</p>
                        <p className="text-5xl font-black text-purple-400 mt-4">${plan.price}<span className="text-xl font-normal text-slate-400">/mo</span></p>
                    </div>

                    {/* Right side: Payment selection */}
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-300 mb-4">{t('select_payment_method')}</h3>
                        <div className="space-y-3 mb-6">
                            {PAYMENT_METHOD_KEYS.map(methodKey => (
                                <button
                                    key={methodKey}
                                    onClick={() => setSelectedMethod(methodKey)}
                                    className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${selectedMethod === methodKey ? 'bg-purple-800/50 border-purple-500' : 'bg-slate-700/50 border-slate-600 hover:border-purple-600'}`}
                                >
                                    <PaymentMethodIcon method={methodKey} className={selectedMethod === methodKey ? 'text-purple-400' : 'text-slate-400'} />
                                    <span className="font-bold text-white ml-3">{t(methodKey as any)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700">
                    <div className="bg-yellow-900/30 border border-yellow-500 rounded-lg p-3 mb-6 text-center">
                        <p className="text-yellow-200 text-sm" dangerouslySetInnerHTML={{ __html: t('payment_modal_disclaimer') }}></p>
                    </div>

                    <div className="mb-6 min-h-[120px] flex items-center justify-center">
                        {renderPaymentForm()}
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={isButtonDisabled}
                        className="w-full bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all text-lg flex justify-center items-center"
                    >
                        {isProcessing ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                {t('processing_payment')}
                            </>
                        ) : (
                            isManualPayment ? t('payment_sent_button') : t('pay_now', { price: plan.price })
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;