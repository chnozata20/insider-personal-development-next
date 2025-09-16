'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/translations/index';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export function Countdown({ 
  initialSeconds = 120, 
  onComplete,
  onResend,
  className = "text-sm text-muted-foreground",
  showSeconds = true,
  format = "mm:ss",
  showProgress = true,
  isSending = false
}) {
  const { language } = useLanguage();
  const t = translations[language];
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsExpired(true);
            if (onComplete) onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, onComplete]);

  const handleResend = async () => {
    if (onResend) {
      await onResend();
      setCountdown(initialSeconds);
      setIsExpired(false);
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    if (format === "mm:ss") {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (format === "minutes") {
      return `${minutes} ${t.minutes}`;
    }

    if (format === "seconds") {
      return `${countdown} ${t.seconds}`;
    }

    return countdown;
  };

  if (isExpired) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <p className="text-sm text-destructive">
          {t.codeExpired}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={isSending}
        >
          {isSending ? t.sending : t.resendCode}
        </Button>
      </div>
    );
  }

  const progress = (countdown / initialSeconds) * 100;

  return (
    <div className="space-y-2">
      {showProgress && (
        <Progress value={progress} className="h-1" />
      )}
      <div className="flex items-center justify-between">
        <p className={className}>
          {t.codeExpiresIn}
        </p>
        <div className="flex items-center space-x-1">
          <span className="font-mono text-sm font-medium">
            {formatTime()}
          </span>
          {showSeconds && countdown <= 30 && (
            <span className="text-xs text-destructive animate-pulse">
              {t.hurry}
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 