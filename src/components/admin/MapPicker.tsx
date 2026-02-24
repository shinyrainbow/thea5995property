'use client';

// =============================================================================
// THE A 5995 - Map Pin Picker Component with Address Search
// =============================================================================

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

interface MapPickerProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onLocationChange: (lat: number, lng: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '0.75rem',
};

// Default center: Bangkok
const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };

// Libraries to load — must be a stable reference to avoid re-renders
const LIBRARIES: ('places')[] = ['places'];

export default function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const center = latitude && longitude
    ? { lat: latitude, lng: longitude }
    : DEFAULT_CENTER;

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange],
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const onPlaceChanged = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setMarkerPos({ lat, lng });
      onLocationChange(lat, lng);

      // Pan and zoom the map to the selected place
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(16);
      }
    }
  }, [onLocationChange]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[350px] bg-luxury-100 rounded-xl flex items-center justify-center">
        <div className="text-luxury-400 text-sm flex items-center gap-2">
          <MapPin className="w-5 h-5 animate-pulse" />
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Address Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-400 pointer-events-none z-10" />
        <Autocomplete
          onLoad={onAutocompleteLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: { country: 'th' },
            fields: ['geometry', 'formatted_address', 'name'],
          }}
        >
          <input
            type="text"
            placeholder="Search address or place name..."
            className="w-full pl-10 pr-4 py-2.5 border border-luxury-200 rounded-lg text-primary-700 placeholder:text-luxury-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all text-sm"
          />
        </Autocomplete>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={markerPos ? 15 : 12}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {markerPos && <Marker position={markerPos} />}
      </GoogleMap>

      {markerPos ? (
        <p className="text-xs text-luxury-500">
          Pin: {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text-xs text-luxury-400">Search for an address or click on the map to set location</p>
      )}
    </div>
  );
}
