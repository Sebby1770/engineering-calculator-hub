type AdProvider = 'adsense' | 'ezoic' | 'mediavine';
type AdSize = 'banner' | 'sidebar' | 'inContent' | 'footer' | 'betweenCards';

const PROVIDERS: AdProvider[] = ['adsense', 'ezoic', 'mediavine'];

function getProvider(): AdProvider {
  const provider = process.env.NEXT_PUBLIC_AD_PROVIDER;
  return PROVIDERS.includes(provider as AdProvider) ? (provider as AdProvider) : 'adsense';
}

function isConfigured(provider: AdProvider, slots: Record<AdSize, string>) {
  if (provider === 'adsense') {
    return Boolean(process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && Object.values(slots).every(Boolean));
  }

  if (provider === 'ezoic') {
    return Boolean(
      process.env.NEXT_PUBLIC_EZOIC_BANNER_ID &&
        process.env.NEXT_PUBLIC_EZOIC_SIDEBAR_ID &&
        process.env.NEXT_PUBLIC_EZOIC_IN_CONTENT_ID &&
        process.env.NEXT_PUBLIC_EZOIC_FOOTER_ID &&
        process.env.NEXT_PUBLIC_EZOIC_BETWEEN_CARDS_ID
    );
  }

  return Boolean(process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID);
}

const provider = getProvider();
const adsenseSlots: Record<AdSize, string> = {
  banner: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || '',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || '',
  inContent: process.env.NEXT_PUBLIC_ADSENSE_IN_CONTENT_SLOT || '',
  footer: process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || '',
  betweenCards: process.env.NEXT_PUBLIC_ADSENSE_BETWEEN_CARDS_SLOT || '',
};

export const AD_CONFIG = {
  provider,
  adsense: {
    publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
    slots: adsenseSlots,
  },
  ezoic: {
    placeholderIds: {
      banner: Number(process.env.NEXT_PUBLIC_EZOIC_BANNER_ID || 0),
      sidebar: Number(process.env.NEXT_PUBLIC_EZOIC_SIDEBAR_ID || 0),
      inContent: Number(process.env.NEXT_PUBLIC_EZOIC_IN_CONTENT_ID || 0),
      footer: Number(process.env.NEXT_PUBLIC_EZOIC_FOOTER_ID || 0),
      betweenCards: Number(process.env.NEXT_PUBLIC_EZOIC_BETWEEN_CARDS_ID || 0),
    },
  },
  mediavine: {
    siteId: process.env.NEXT_PUBLIC_MEDIAVINE_SITE_ID || '',
  },
  enabled: process.env.NEXT_PUBLIC_AD_ENABLED === 'true' && isConfigured(provider, adsenseSlots),
  showPlaceholders:
    process.env.NEXT_PUBLIC_AD_PLACEHOLDERS === 'true' ||
    (process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_AD_PLACEHOLDERS !== 'false'),
};
