import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isGlobalLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  isGlobalLoading: false,
  loadingMessage: '',
  startLoading: () => {},
  stopLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = useCallback((message = 'Processing...') => {
    setLoadingMessage(message);
    setIsGlobalLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsGlobalLoading(false);
    setLoadingMessage('');
  }, []);

  return (
    <LoadingContext.Provider value={{ isGlobalLoading, loadingMessage, startLoading, stopLoading }}>
      {children}
      {isGlobalLoading && <GlobalLoadingOverlay message={loadingMessage} />}
    </LoadingContext.Provider>
  );
};

const GlobalLoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    aria-live="assertive"
    aria-label="Loading"
  >
    <div className="flex flex-col items-center gap-5 px-8 py-8 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
      {/* Animated spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"
        />
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
        </div>
      </div>
      <p className="text-white text-base font-medium tracking-wide">{message}</p>
      <p className="text-white/60 text-xs text-center max-w-[220px]">
        Please do not close this page or go back
      </p>
    </div>
  </div>
);
