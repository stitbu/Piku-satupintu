
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Hide after 3 seconds of being back online
            setTimeout(() => setIsVisible(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setIsVisible(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isVisible && isOnline) return null;

    return (
        <div 
            className={`
                fixed top-0 left-0 right-0 z-[100] transform transition-transform duration-500 ease-in-out
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}
            `}
        >
            <div className={`
                flex items-center justify-center gap-3 px-4 py-3 text-sm font-bold shadow-xl backdrop-blur-md border-b
                ${isOnline 
                    ? 'bg-emerald-600/90 border-emerald-500/50 text-white' 
                    : 'bg-amber-600/90 border-amber-500/50 text-white'}
            `}>
                <Icon name={isOnline ? "Wifi" : "WifiOff"} size={18} />
                <span>
                    {isOnline 
                        ? "Koneksi Pulih. Sinkronisasi data ke Cloud..." 
                        : "Anda Offline. Data disimpan di Local Storage aman."}
                </span>
            </div>
        </div>
    );
};
