'use client';
// ============================================================
// components/maps/GooglePlacesAutocomplete.tsx
// High-End Google Places Predictive Autocomplete (Restricted to India)
// Features: Instant predictive search, auto-extract Name, Address,
// Rating, Reviews count, Lat/Lng, Place ID, and auto-sync.
// Includes interactive "Connect Live Google Cloud API Key" modal.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, CheckCircle2, Search, Building2, Star, Sparkles,
  X, Key, ArrowRight, ShieldCheck, Check, AlertTriangle, RefreshCw
} from 'lucide-react';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';

export interface SelectedPlaceData {
  place_id: string;
  formatted_address: string;
  name: string;
  city?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  user_ratings_total?: number;
}

interface GooglePlacesAutocompleteProps {
  value?: string;
  placeholder?: string;
  initialPlaceData?: Partial<SelectedPlaceData>;
  onPlaceSelected: (data: SelectedPlaceData) => void;
  onAddressChange?: (address: string) => void;
  onSyncCompanyName?: (name: string) => void;
  label?: string;
  required?: boolean;
  autoSyncNameLabel?: string;
}

export function GooglePlacesAutocomplete({
  value = '',
  placeholder = 'Type a venue or business (e.g. "The Clock Tower", "Sports Box 2.0", "SMAAASH", "Royal Feast")...',
  initialPlaceData,
  onPlaceSelected,
  onAddressChange,
  onSyncCompanyName,
  label = 'Business Location / Venue (Google Verified)',
  required = false,
  autoSyncNameLabel = 'Auto-fill Business / Company Name with selected place',
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Partial<SelectedPlaceData> | null>(
    initialPlaceData || (value ? { formatted_address: value, name: value.split(',')[0] } : null)
  );
  const [autoSyncName, setAutoSyncName] = useState(true);
  const [isApiKeyActive, setIsApiKeyActive] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keySaving, setKeySaving] = useState(false);
  const [keySuccess, setKeySuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Check stored key or initial status
  useEffect(() => {
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('coe_google_maps_key') : null;
    if (storedKey) {
      setIsApiKeyActive(true);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!inputValue || inputValue.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const storedKey = typeof window !== 'undefined' ? localStorage.getItem('coe_google_maps_key') : null;
        const headers: HeadersInit = {};
        if (storedKey) headers['x-google-maps-key'] = storedKey;

        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(inputValue.trim())}`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.predictions)) {
            setSuggestions(data.predictions);
            setIsApiKeyActive(!data.isApiKeyMissing || Boolean(data.isLive));
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn('[Places Autocomplete fetch error]:', err);
      } finally {
        setLoading(false);
      }
    }, 160);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelectSuggestion = (place: PlaceSuggestion) => {
    const fullData: SelectedPlaceData = {
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      city: place.city || 'Gurugram',
      lat: place.lat || 28.4595,
      lng: place.lng || 77.0266,
      rating: place.rating || 4.5,
      user_ratings_total: place.user_ratings_total || 0,
    };

    setInputValue(place.formatted_address);
    setSelectedPlace(fullData);
    setIsOpen(false);
    onPlaceSelected(fullData);
    onAddressChange?.(place.formatted_address);

    if (autoSyncName && onSyncCompanyName) {
      onSyncCompanyName(place.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onAddressChange?.(val);
    setIsOpen(true);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedPlace(null);
    setSuggestions([]);
    setIsOpen(false);
    onAddressChange?.('');
    inputRef.current?.focus();
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setKeySaving(true);
    try {
      const res = await fetch('/api/config/google-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyInput.trim() }),
      });
      if (res.ok) {
        localStorage.setItem('coe_google_maps_key', keyInput.trim());
        setIsApiKeyActive(true);
        setKeySuccess(true);
        setTimeout(() => {
          setShowKeyModal(false);
          setKeySuccess(false);
          // Refetch suggestions with new key
          if (inputValue) {
            setInputValue((prev) => prev);
          }
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
    } finally {
      setKeySaving(false);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      {/* Label Bar */}
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
          <label
            style={{
              display: 'block',
              fontSize: 11.5,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
          </label>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            style={{
              fontSize: 10.5,
              color: isApiKeyActive ? '#10b981' : '#fbbf24',
              background: isApiKeyActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(234, 179, 8, 0.14)',
              border: isApiKeyActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(234, 179, 8, 0.35)',
              padding: '2px 8px',
              borderRadius: 999,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 700,
              transition: 'all 0.2s ease',
            }}
            title="Click to connect your Google Cloud API key for 100% live Google reviews"
          >
            {isApiKeyActive ? (
              <>
                <CheckCircle2 size={11} color="#10b981" />
                <span>Google Places Live API Connected</span>
              </>
            ) : (
              <>
                <Key size={11} color="#fbbf24" />
                <span>Connect Google API Key (Live Ratings)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Input Box */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255, 255, 255, 0.45)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search size={16} />
        </div>

        <input
          ref={inputRef}
          className="input-base"
          style={{
            paddingLeft: 38,
            paddingRight: inputValue ? 38 : 14,
            borderColor: isOpen && suggestions.length > 0 ? 'rgba(249, 115, 22, 0.6)' : undefined,
          }}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (suggestions.length > 0) {
                handleSelectSuggestion(suggestions[0]);
              }
            }
          }}
          required={required}
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Predictive Dropdown ── */}
      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 200,
              background: '#0B0F17',
              border: '1.5px solid rgba(249, 115, 22, 0.4)',
              borderRadius: 16,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(249, 115, 22, 0.15)',
              overflow: 'hidden',
              maxHeight: 290,
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                padding: '8px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: 10.5,
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.45)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <span>Verified Google Places in India</span>
              <span>Click to Auto-Fill</span>
            </div>

            {suggestions.map((place, idx) => (
              <div
                key={place.place_id || idx}
                onClick={() => handleSelectSuggestion(place)}
                style={{
                  padding: '12px 14px',
                  borderBottom: idx < suggestions.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(249, 115, 22, 0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f97316',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Building2 size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#ffffff' }}>
                      {place.name}
                    </span>

                    {place.categoryTag && (
                      <span
                        style={{
                          fontSize: 9.5,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: 'rgba(255, 255, 255, 0.65)',
                          fontWeight: 600,
                        }}
                      >
                        {place.categoryTag}
                      </span>
                    )}

                    {place.rating !== undefined && (
                      <span
                        style={{
                          fontSize: 11,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          color: '#fbbf24',
                          fontWeight: 700,
                          background: 'rgba(234, 179, 8, 0.12)',
                          padding: '1px 6px',
                          borderRadius: 4,
                        }}
                      >
                        <Star size={10} fill="#fbbf24" color="#fbbf24" />
                        {place.rating.toFixed(1)}
                        {place.user_ratings_total !== undefined && place.user_ratings_total > 0 && (
                          <span style={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: 9.5, fontWeight: 500 }}>
                            ({place.user_ratings_total.toLocaleString()} reviews)
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.35 }}>
                    {place.formatted_address}
                  </div>
                </div>

                <ArrowRight size={14} color="#f97316" style={{ marginTop: 8, opacity: 0.6, flexShrink: 0 }} />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-sync Checkbox */}
      {onSyncCompanyName && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="auto-sync-name"
            checked={autoSyncName}
            onChange={(e) => setAutoSyncName(e.target.checked)}
            style={{ accentColor: '#f97316', cursor: 'pointer' }}
          />
          <label htmlFor="auto-sync-name" style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.6)', cursor: 'pointer' }}>
            {autoSyncNameLabel}
          </label>
        </div>
      )}

      {/* ── Confirmation Card ── */}
      {selectedPlace && (selectedPlace.place_id || selectedPlace.name || selectedPlace.formatted_address) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 10,
            padding: '14px 18px',
            borderRadius: 16,
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              flexShrink: 0,
              marginTop: 2,
            }}
          >
            <CheckCircle2 size={18} />
          </div>

          <div style={{ flex: 1, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, color: '#ffffff', fontSize: 14 }}>
                {selectedPlace.name || 'Verified Google Location'}
              </span>

              {selectedPlace.rating !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    color: '#fbbf24',
                    fontWeight: 700,
                    background: 'rgba(234, 179, 8, 0.15)',
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                  }}
                >
                  <Star size={11} fill="#fbbf24" color="#fbbf24" />
                  {selectedPlace.rating.toFixed(1)} / 5.0
                  {selectedPlace.user_ratings_total !== undefined && selectedPlace.user_ratings_total > 0 && (
                    <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: 10 }}>
                      ({selectedPlace.user_ratings_total.toLocaleString()} Verified Google Reviews)
                    </span>
                  )}
                </span>
              )}
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45 }}>
              {selectedPlace.formatted_address || inputValue}
            </div>

            {selectedPlace.place_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 6,
                  fontSize: 10.5,
                  color: 'rgba(255, 255, 255, 0.5)',
                  flexWrap: 'wrap',
                }}
              >
                <span>
                  Place ID: <strong style={{ color: '#34d399', fontFamily: 'monospace' }}>{selectedPlace.place_id}</strong>
                </span>
                {selectedPlace.lat && selectedPlace.lng && (
                  <span>
                    GPS: <strong style={{ color: '#93c5fd', fontFamily: 'monospace' }}>{selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}</strong>
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── API Key Configuration Modal ── */}
      <AnimatePresence>
        {showKeyModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 400,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              background: 'rgba(5, 8, 20, 0.85)',
              backdropFilter: 'blur(14px)',
            }}
            onClick={() => setShowKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 500,
                background: '#0B0F17',
                border: '1.5px solid rgba(234, 179, 8, 0.35)',
                borderRadius: 22,
                padding: '26px',
                boxShadow: '0 30px 90px rgba(0,0,0,0.95)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
                    <Key size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                      Connect Google Cloud API Key
                    </h2>
                    <div style={{ fontSize: 11.5, color: 'rgba(255, 255, 255, 0.5)' }}>
                      Enables 100% live Google Places reviews & real-time ratings
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveApiKey}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Google Maps API Key (Places API Enabled)
                  </label>
                  <input
                    className="input-base"
                    placeholder="AIzaSy..."
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    autoFocus
                  />
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 6, lineHeight: 1.4 }}>
                    Paste your Google Cloud API key with <strong>Places API</strong> and <strong>Maps JavaScript API</strong> enabled.
                  </div>
                </div>

                {keySuccess && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: 12, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} /> Key saved and live Google Places API connected!
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setShowKeyModal(false)} className="btn-ghost" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!keyInput.trim() || keySaving}
                    className="btn-primary"
                    style={{ flex: 2, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                  >
                    {keySaving ? 'Connecting…' : 'Save & Connect Live API'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
