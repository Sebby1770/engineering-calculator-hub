'use client';

import AdUnit from './AdUnit';

export function AdBanner({ className = '' }: { className?: string }) {
  return <AdUnit size="banner" className={`w-full max-w-4xl mx-auto ${className}`} />;
}

export function AdSidebar({ className = '' }: { className?: string }) {
  return (
    <div className={`sticky top-24 ${className}`}>
      <AdUnit size="sidebar" />
    </div>
  );
}

export function AdInContent({ className = '' }: { className?: string }) {
  return <AdUnit size="inContent" className={`w-full max-w-3xl mx-auto my-8 ${className}`} />;
}

export function AdFooter({ className = '' }: { className?: string }) {
  return <AdUnit size="footer" className={`w-full max-w-5xl mx-auto ${className}`} />;
}

export function AdBetweenCards({ className = '' }: { className?: string }) {
  return <AdUnit size="betweenCards" className={`w-full ${className}`} />;
}
