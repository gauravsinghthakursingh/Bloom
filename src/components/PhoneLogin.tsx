import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth';
import { Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { authService } from '../services/authService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion, AnimatePresence } from 'motion/react';

export const PhoneLogin = ({ onComplete }: { onComplete: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          window.recaptchaVerifier?.render().then((widgetId: any) => {
            window.recaptchaVerifier?.reset(widgetId);
          });
        }
      });
    }

    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      console.log('Sending OTP to:', formattedPhone);
      
      const result = await authService.signInWithPhone(formattedPhone, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Phone authentication is not enabled in Firebase Console.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send OTP. Please check the number.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setError('No verification in progress.');
      return;
    }
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(verificationCode);
      await authService.syncProfile(result.user);
      onComplete();
    } catch (err: any) {
      console.error('OTP Verify Error:', err);
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div id="recaptcha-container"></div>
      
      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.form
            key="phone-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSendOTP}
            className="space-y-4"
          >
            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
                <Phone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Login with Phone</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">We'll send you a 6-digit verification code</p>
            </div>

            <Input
              label="Phone Number"
              placeholder="9876543210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              icon={<span className="text-gray-400 dark:text-gray-500 text-sm font-bold">+91</span>}
              error={error}
            />

            <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
              Send OTP
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifyOTP}
            className="space-y-4"
          >
            <div className="text-center space-y-2 mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enter OTP</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verification code sent to +91 {phoneNumber}</p>
            </div>

            <Input
              label="OTP Code"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              className="text-center text-2xl tracking-[1em] font-bold dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              error={error}
            />

            <Button type="submit" className="w-full h-12 text-lg" isLoading={loading}>
              Verify & Login
            </Button>
            
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-sm text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              Change phone number
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
