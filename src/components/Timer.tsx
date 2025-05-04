
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed unused Select imports
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface TimerProps {
  initialMinutes?: number;
  onTimerEnd?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialMinutes = 45, onTimerEnd }) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(initialMinutes.toString());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const presets = [30, 45, 60, 90];

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => console.error("Error playing sound:", error));
    }
  }, []);

  const showBrowserNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nivela Pro Timer', {
        body: 'O tempo de pausa terminou!',
        icon: '/icons/icon-192x192.png',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showBrowserNotification();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio('/sounds/timer-end.mp3');
        audioRef.current.preload = 'auto';
    }

    if (isActive && totalSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isActive) {
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      playNotificationSound();
      showBrowserNotification(); // Added missing dependency
      if (onTimerEnd) onTimerEnd();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // Added showBrowserNotification and playNotificationSound to dependency array
  }, [isActive, totalSeconds, onTimerEnd, showBrowserNotification, playNotificationSound]);

  const toggleTimer = () => {
    if (totalSeconds > 0) {
      setIsActive(!isActive);
    }
  };

  const resetTimer = (minutes: number) => {
    setIsActive(false);
    setTotalSeconds(minutes * 60);
    setCustomMinutes(minutes.toString());
  };

  const handlePresetClick = (minutes: number) => {
    resetTimer(minutes);
    setShowSettings(false);
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMinutes(e.target.value);
  };

  const applyCustomTime = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      resetTimer(minutes);
      setShowSettings(false);
    } else {
      alert('Por favor, insira um valor válido em minutos.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-xs mx-auto p-4 border rounded-lg shadow-sm bg-card text-card-foreground text-center">
      <h3 className="text-lg font-medium mb-4">Tempo de Pausa</h3>

      {showSettings ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Selecione um tempo predefinido ou insira um valor customizado.</p>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <Button key={preset} variant="outline" onClick={() => handlePresetClick(preset)}>
                {preset} min
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={customMinutes}
              onChange={handleCustomTimeChange}
              placeholder="Minutos"
              min="1"
              className="flex-grow"
            />
            <Button onClick={applyCustomTime}>Aplicar</Button>
          </div>
          <Button variant="ghost" onClick={() => setShowSettings(false)} className="w-full">Cancelar</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-6xl font-bold font-mono text-primary dark:text-white">
            {formatTime(totalSeconds)}
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" onClick={() => resetTimer(parseInt(customMinutes, 10) || initialMinutes)} title="Resetar">
              <RotateCcw className="h-5 w-5" />
            </Button>
            <Button variant="default" size="icon" onClick={toggleTimer} title={isActive ? 'Pausar' : 'Iniciar'} className="w-16 h-16 rounded-full text-2xl">
              {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} title="Configurações">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;

