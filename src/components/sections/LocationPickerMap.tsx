'use client'

import * as React from 'react'
import { MapPin, Navigation, Search, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  fetchAutocompletePredictions, 
  fetchPlaceDetails, 
  fetchReverseGeocode, 
  isOlaMapsConfigured 
} from '@/lib/olaMapsService'
import 'maplibre-gl/dist/maplibre-gl.css'
import { resolveGoogleMapsUrlAction } from '@/app/actions/eventActions'

export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null;
  // Match @lat,lng
  const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  // Match q=lat,lng or ll=lat,lng
  const qMatch = url.match(/(?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  // Match !3d(lat)!4d(lng)
  const bangMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bangMatch) {
    return { lat: parseFloat(bangMatch[1]), lng: parseFloat(bangMatch[2]) };
  }
  return null;
}

interface LocationPickerMapProps {
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
  googleMapsUrl?: string;
  onChange: (data: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  }) => void;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  address = '',
  googleMapsUrl = '',
  onChange,
}: LocationPickerMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any | null>(null);
  const markerRef = React.useRef<any | null>(null);
  
  const [maplibregl, setMaplibregl] = React.useState<any>(null);
  const [isOlaConfigured, setIsOlaConfigured] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(address);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
  const [coordsInput, setCoordsInput] = React.useState({
    lat: latitude ? String(latitude) : '',
    lng: longitude ? String(longitude) : '',
  });

  // Client-side import of maplibre-gl
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      import('maplibre-gl').then((mod) => {
        setMaplibregl(mod.default || mod);
      });
      setIsOlaConfigured(isOlaMapsConfigured());
    }
  }, []);

  // Keep search query updated if address changes externally
  React.useEffect(() => {
    if (address && address !== searchQuery) {
      setSearchQuery(address);
    }
  }, [address]);

  // Keep manual coords input fields sync'd with props
  React.useEffect(() => {
    setCoordsInput({
      lat: latitude ? String(latitude) : '',
      lng: longitude ? String(longitude) : '',
    });
  }, [latitude, longitude]);

  // Autocomplete typing logic
  React.useEffect(() => {
    if (!searchQuery.trim() || searchQuery === address) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const predictions = await fetchAutocompletePredictions(searchQuery);
      setSuggestions(predictions);
      setIsLoadingSuggestions(false);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Handle Maps URL parsing if pasted
  React.useEffect(() => {
    if (!googleMapsUrl) return;

    const handleUrl = async () => {
      // First, try client-side parsing (works for coordinates already in the URL)
      let parsed = parseGoogleMapsUrl(googleMapsUrl);
      
      // If client-side parsing fails, and it looks like a shortened URL, resolve it on the server
      if (!parsed && (googleMapsUrl.includes("maps.app.goo.gl") || googleMapsUrl.includes("goo.gl/maps"))) {
        try {
          const result = await resolveGoogleMapsUrlAction(googleMapsUrl);
          if (result.success && result.resolvedUrl) {
            parsed = parseGoogleMapsUrl(result.resolvedUrl);
          }
        } catch (error) {
          console.error("Error resolving shortened Google Maps URL:", error);
        }
      }

      if (parsed) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter([parsed.lng, parsed.lat]);
          mapInstanceRef.current.setZoom(15);
          if (markerRef.current) {
            markerRef.current.setLngLat([parsed.lng, parsed.lat]);
          }
          handleReverseGeocode(parsed.lat, parsed.lng);
        } else {
          onChange({
            latitude: parsed.lat,
            longitude: parsed.lng,
          });
        }
      }
    };

    handleUrl();
  }, [googleMapsUrl, maplibregl]);

  const handleReverseGeocode = async (lat: number, lng: number) => {
    const result = await fetchReverseGeocode(lat, lng);
    if (result) {
      let streetAddress = '';
      let city = '';
      let state = '';
      let country = '';
      let pincode = '';

      if (result.address_components) {
        result.address_components.forEach((component: any) => {
          const types = component.types || [];
          if (types.includes('street_number')) {
            streetAddress = component.long_name + ' ' + streetAddress;
          }
          if (types.includes('route')) {
            streetAddress = streetAddress + ' ' + component.long_name;
          }
          if (types.includes('locality') || types.includes('sublocality_level_1')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('country')) {
            country = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });
      }

      streetAddress = streetAddress.trim() || result.formatted_address;

      onChange({
        latitude: lat,
        longitude: lng,
        address: result.formatted_address || streetAddress,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        pincode: pincode || undefined,
      });
      setSearchQuery(result.formatted_address || streetAddress);
    } else {
      onChange({ latitude: lat, longitude: lng });
    }
  };

  const handleSelectSuggestion = async (suggestion: any) => {
    setSearchQuery(suggestion.description);
    setSuggestions([]);
    
    const details = await fetchPlaceDetails(suggestion.place_id);
    if (details && details.geometry && details.geometry.location) {
      const lat = details.geometry.location.lat;
      const lng = details.geometry.location.lng;

      let streetAddress = '';
      let city = '';
      let state = '';
      let country = '';
      let pincode = '';

      if (details.address_components) {
        details.address_components.forEach((component: any) => {
          const types = component.types || [];
          if (types.includes('street_number')) {
            streetAddress = component.long_name + ' ' + streetAddress;
          }
          if (types.includes('route')) {
            streetAddress = streetAddress + component.long_name;
          }
          if (types.includes('locality') || types.includes('sublocality_level_1')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (types.includes('country')) {
            country = component.long_name;
          }
          if (types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });
      }

      streetAddress = streetAddress.trim() || details.formatted_address || suggestion.description;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter([lng, lat]);
        mapInstanceRef.current.setZoom(15);
      }
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }

      onChange({
        latitude: lat,
        longitude: lng,
        address: details.formatted_address || streetAddress,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        pincode: pincode || undefined,
      });
    }
  };

  // Initialize Maplibre GL Map
  React.useEffect(() => {
    if (maplibregl && mapContainerRef.current && isOlaConfigured && !mapInstanceRef.current) {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
      const defaultLng = longitude ? Number(longitude) : -122.4194;
      const defaultLat = latitude ? Number(latitude) : 37.7749;

      // Initialize map instance
      mapInstanceRef.current = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?api_key=${apiKey}`,
        center: [defaultLng, defaultLat],
        zoom: latitude && longitude ? 15 : 4,
        attributionControl: false,
        validateStyle: false,
        transformRequest: (url: string) => {
          if (url.includes('olamaps.io') && !url.includes('api_key=')) {
            const separator = url.includes('?') ? '&' : '?';
            return {
              url: `${url}${separator}api_key=${apiKey}`
            };
          }
          return { url };
        }
      });

      // Suppress console error crash overlay in next.js dev mode
      mapInstanceRef.current.on('error', () => {
        // Silently catch styling/missing source warnings
      });

      // Add zoom navigation control
      mapInstanceRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Initialize Pin Marker
      markerRef.current = new maplibregl.Marker({
        draggable: true,
        color: '#ff7759'
      })
        .setLngLat([defaultLng, defaultLat])
        .addTo(mapInstanceRef.current);

      // Handle marker dragend
      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current.getLngLat();
        handleReverseGeocode(lngLat.lat, lngLat.lng);
      });

      // Handle map clicks to place marker
      mapInstanceRef.current.on('click', (e: any) => {
        const { lng, lat } = e.lngLat;
        markerRef.current.setLngLat([lng, lat]);
        handleReverseGeocode(lat, lng);
      });
    }
  }, [maplibregl, isOlaConfigured]);

  // Sync marker position if coordinates change externally
  React.useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      const center = mapInstanceRef.current.getCenter();
      if (!center || Math.abs(center.lat - lat) > 0.0001 || Math.abs(center.lng - lng) > 0.0001) {
        mapInstanceRef.current.setCenter([lng, lat]);
        markerRef.current.setLngLat([lng, lat]);
      }
    }
  }, [latitude, longitude]);

  const handleUseMyLocation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([lng, lat]);
            mapInstanceRef.current.setZoom(15);
            if (markerRef.current) {
              markerRef.current.setLngLat([lng, lat]);
            }
          }
          handleReverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not access your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleManualCoordsSubmit = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const lat = parseFloat(coordsInput.lat);
    const lng = parseFloat(coordsInput.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter([lng, lat]);
        mapInstanceRef.current.setZoom(15);
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }
      }
      handleReverseGeocode(lat, lng);
    } else {
      alert('Please enter valid numerical latitude and longitude coordinates.');
    }
  };

  const handleManualSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange({ address: val });
  };

  return (
    <div className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 bg-card p-5 shadow-sm relative text-left">
      <div className="space-y-2 relative">
        <Label htmlFor="map-search" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Search Location / Address
        </Label>
        <div className="relative">
          <Input
            id="map-search"
            value={searchQuery}
            onChange={handleManualSearchChange}
            placeholder={isOlaConfigured ? "Search location via Ola Maps..." : "Type venue address..."}
            className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 pl-9 pr-28 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs text-foreground"
          />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-accent" />
          
          <Button
            onClick={handleUseMyLocation}
            size="sm"
            type="button"
            className="absolute right-1.5 top-1.5 h-7 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 px-3 flex items-center gap-1 transition-all"
          >
            <Navigation className="h-3 w-3" />
            Locate Me
          </Button>
        </div>

        {/* Custom Autocomplete List */}
        {suggestions.length > 0 && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#1a1a22]/95 backdrop-blur-xl p-1.5 shadow-2xl space-y-0.5 custom-scrollbar">
            {suggestions.map((suggestion: any) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs hover:bg-accent/10 dark:hover:bg-accent/15 text-foreground hover:text-accent font-semibold transition-all flex items-center gap-2.5"
              >
                <MapPin className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                <span className="truncate">{suggestion.description}</span>
              </button>
            ))}
          </div>
        )}

        {isLoadingSuggestions && (
          <div className="absolute right-32 top-3">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-slate-950">
        {isOlaConfigured ? (
          <div ref={mapContainerRef} className="h-full w-full animate-fade-in relative z-10" style={{ touchAction: 'none' }} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-5 text-center bg-[#101014] relative">
            <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -inset-2 rounded-full bg-accent/20 blur-md animate-pulse" />
                <MapPin className="relative h-8 w-8 text-accent animate-bounce" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Ola Maps Standby</span>
              <p className="max-w-[220px] mt-1 text-[9px] leading-relaxed text-slate-400">
                Ola Maps API Key not initialized. Enter address and coordinates manually.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Coordinate Entry / Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 dark:border-white/5 pt-3.5">
        <div className="flex items-center gap-1.5">
          {latitude && longitude ? (
            <div className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">
              <Check className="h-2.5 w-2.5 stroke-[3px]" />
              {Number(latitude).toFixed(4)}°, {Number(longitude).toFixed(4)}°
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-2.5 w-2.5 animate-pulse" />
              No Coordinates Selected
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-muted-foreground font-bold uppercase text-[8px] tracking-wider mr-1">Manual Coords:</span>
          <Input
            value={coordsInput.lat}
            onChange={(e) => setCoordsInput(prev => ({ ...prev, lat: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualCoordsSubmit(e);
              }
            }}
            placeholder="Latitude"
            className="h-7 w-20 rounded-lg bg-background/80 text-[10px] border border-border dark:border-white/10 px-2 font-mono text-center focus-visible:ring-accent focus-visible:border-accent/50 text-foreground transition-all"
          />
          <Input
            value={coordsInput.lng}
            onChange={(e) => setCoordsInput(prev => ({ ...prev, lng: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleManualCoordsSubmit(e);
              }
            }}
            placeholder="Longitude"
            className="h-7 w-20 rounded-lg bg-background/80 text-[10px] border border-border dark:border-white/10 px-2 font-mono text-center focus-visible:ring-accent focus-visible:border-accent/50 text-foreground transition-all"
          />
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleManualCoordsSubmit(e);
            }}
            className="h-7 rounded-full bg-accent hover:opacity-90 text-[9px] font-bold uppercase tracking-wider text-white px-3.5 transition-all shadow-sm"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  )
}
