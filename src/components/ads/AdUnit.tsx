'use client';

import { useEffect, useRef, useState } from 'react';
import { AD_CONFIG } from '@/lib/adConfig';

type AdSize = 'banner' | 'sidebar' | 'inContent' | 'footer' | 'betweenCards';

interface AdUnitProps {
  size: AdSize;
  className?: string;
}

const AD_DIMENSIONS: Record<AdSize, { width: string; minHeight: string; label: string }> = {
  banner: { width: '100%', minHeight: '90px', label: 'Advertisement' },
  sidebar: { width: '300px', minHeight: '600px', label: 'Sponsored' },
  inContent: { width: '100%', minHeight: '250px', label: 'Advertisement' },
  footer: { width: '100%', minHeight: '90px', label: 'Advertisement' },
  betweenCards: { width: '100%', minHeight: '120px', label: 'Sponsored' },
};

export default function AdUnit({ size, className = '' }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load: only render ad when it scrolls into view
  useEffect(() => {
    if (!adRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  // Push ad to AdSense when visible
  useEffect(() => {
    if (!isVisible || !AD_CONFIG.enabled) return;
    try {
      if (AD_CONFIG.provider === 'adsense') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('Ad loading error:', e);
    }
  }, [isVisible]);

  const dims = AD_DIMENSIONS[size];

  // Placeholder shown when ads are not enabled
  if (!AD_CONFIG.enabled) {
    return (
      <div
        ref={adRef}
        className={`relative overflow-hidden rounded-lg border border-dashed ${className}`}
        style={{ width: dims.width, minHeight: dims.minHeight }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface-100/60 dark:bg-surface-800/60 text-surface-400 dark:text-surface-500">
          <span className="text-[10px] uppercase tracking-widest font-medium">{dims.label}</span>
          <span className="text-xs opacity-60">{size} ad unit</span>
        </div>
      </div>
    );
  }

  // Live AdSense integration
  if (AD_CONFIG.provider === 'adsense') {
    const slot = AD_CONFIG.adsense.slots[size];
    return (
      <div ref={adRef} className={className} style={{ width: dims.width, minHeight: dims.minHeight }}>
        <div className="text-[10px] text-center text-surface-400 uppercase tracking-widest mb-1">
          {dims.label}
        </div>
        {isVisible && (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: dims.minHeight }}
            data-ad-client={AD_CONFIG.adsense.publisherId}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        )}
      </div>
    );
  }

  // Ezoic placeholder
  if (AD_CONFIG.provider === 'ezoic') {
    const phId = AD_CONFIG.ezoic.placeholderIds[size];
    return (
      <div ref={adRef} className={className} style={{ width: dims.width, minHeight: dims.minHeight }}>
        {isVisible && <div id={`ezoic-pub-ad-placeholder-${phId}`} />}
      </div>
    );
  }

  return null;
}
