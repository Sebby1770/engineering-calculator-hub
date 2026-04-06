// Ad configuration — swap provider details here
export const AD_CONFIG = {
  provider: 'adsense' as 'adsense' | 'ezoic' | 'mediavine',
  adsense: {
    publisherId: 'ca-pub-XXXXXXXXXXXXXXXX', // Replace with your AdSense publisher ID
    slots: {
      banner: '1234567890',
      sidebar: '2345678901',
      inContent: '3456789012',
      footer: '4567890123',
      betweenCards: '5678901234',
    },
  },
  ezoic: {
    placeholderIds: {
      banner: 101,
      sidebar: 102,
      inContent: 103,
      footer: 104,
      betweenCards: 105,
    },
  },
  mediavine: {
    siteId: 'your-site-id',
  },
  // Set to true in production when ads are live
  enabled: false,
};
