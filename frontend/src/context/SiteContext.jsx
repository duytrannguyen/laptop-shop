import React, { createContext, useContext, useEffect, useState } from 'react';
import { http } from '../api/client';

const DEFAULT_SETTINGS = {
  storeName: 'Laptop Shop - Laptop cũ Cần Thơ',
  shortName: 'Laptop Shop',
  slogan: 'Laptop cũ chất lượng, giá minh bạch',
  hotline: '0816109179',
  email: 'contact@laptopshop.vn',
  supportEmail: '',
  address: 'Số 25, đường B25, KDC 91B, P. An Khánh, Q. Ninh Kiều, TP. Cần Thơ',
  openingHours: '08:30 - 20:00 hàng ngày',
  mapUrl: '',
  logoUrl: '',
  faviconUrl: '',
  logoFooterUrl: '',
  facebookUrl: '',
  facebookGroupUrl: '',
  zaloUrl: '',
  zaloGroupUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  instagramUrl: '',
  googleTagScript: '',
  metaDescription: '',
  maintenanceMode: false,
  popupEnabled: false,
  popupImageUrl: '',
  popupLinkUrl: '',
};

const SiteContext = createContext({ settings: DEFAULT_SETTINGS, refresh: () => {} });

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const refresh = async () => {
    try {
      const response = await http.get('/settings');
      setSettings({ ...DEFAULT_SETTINGS, ...response.data });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return <SiteContext.Provider value={{ settings, refresh }}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
