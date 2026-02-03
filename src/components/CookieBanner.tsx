import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { saveCookieConsent, hasUserRespondedToCookies, initTracking } from '../utils/analytics';
import { Link } from 'react-router-dom';

export function CookieBanner() {
  // Banner de cookies completamente desactivado
  return null;
}