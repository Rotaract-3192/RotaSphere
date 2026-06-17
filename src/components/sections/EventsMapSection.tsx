'use client'

import * as React from 'react'
import { 
  MapPin, Search, Calendar, Compass, TrendingUp, SlidersHorizontal, Info, Tag, ArrowRight, Video, Map
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { EventItem } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { isOlaMapsConfigured } from '@/lib/olaMapsService'
import { MapSkeleton } from '@/components/skeletons/MapSkeleton'
import Link from 'next/link'
import 'maplibre-gl/dist/maplibre-gl.css'

interface EventsMapSectionProps {
  events: EventItem[];
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d * 0.621371; // Convert to miles
}

function isDateWithinRange(eventDateStr: string, range: 'all' | 'today' | 'week' | 'month'): boolean {
  if (range === 'all') return true;
  
  const cleanDateStr = eventDateStr.split('-')[0].trim().replace(/(\d+)\s*,\s*(\d+)/, '$1, $2');
  const eventDate = new Date(cleanDateStr);
  if (isNaN(eventDate.getTime())) return true;
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (range === 'today') {
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  }
  
  if (range === 'week') {
    const nextWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= startOfDay && eventDate <= nextWeek;
  }
  
  if (range === 'month') {
    const nextMonth = new Date(startOfDay.getTime() + 30 * 24 * 60 * 60 * 1000);
    return eventDate >= startOfDay && eventDate <= nextMonth;
  }
  
  return true;
}

export default function EventsMapSection({ events }: EventsMapSectionProps) {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = React.useRef<any | null>(null);
  const markersRef = React.useRef<any[]>([]);

  const [maplibregl, setMaplibregl] = React.useState<any>(null);
  const [isOlaConfigured, setIsOlaConfigured] = React.useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedDateRange, setSelectedDateRange] = React.useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedPriceType, setSelectedPriceType] = React.useState<'all' | 'free' | 'paid'>('all');
  const [selectedLocationType, setSelectedLocationType] = React.useState<'all' | 'in-person' | 'online'>('all');

  // User location & map state
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<EventItem | null>(null);
  const [showFiltersMobile, setShowFiltersMobile] = React.useState(false);

  // Client-side import of maplibre-gl
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      import('maplibre-gl').then((mod) => {
        setMaplibregl(mod.default || mod);
      });
      setIsOlaConfigured(isOlaMapsConfigured());
    }
  }, []);

  // Filter events
  const filteredEvents = React.useMemo(() => {
    return events.filter(evt => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        evt.title.toLowerCase().includes(query) ||
        evt.description.toLowerCase().includes(query) ||
        evt.location.toLowerCase().includes(query);

      // 2. Category
      const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;

      // 3. Date
      const matchesDate = isDateWithinRange(evt.date, selectedDateRange);

      // 4. Price Type
      const isFree = evt.price.toLowerCase().includes('free') || evt.price === '₹0.00' || evt.price === '$0.00' || evt.price === '0';
      const matchesPrice = selectedPriceType === 'all' ||
        (selectedPriceType === 'free' && isFree) ||
        (selectedPriceType === 'paid' && !isFree);

      // 5. Location Type
      const isOnline = evt.locationType === 'online' || evt.location.toLowerCase().includes('virtual') || evt.location.toLowerCase().includes('online');
      const matchesLocation = selectedLocationType === 'all' ||
        (selectedLocationType === 'online' && isOnline) ||
        (selectedLocationType === 'in-person' && !isOnline);

      return matchesSearch && matchesCategory && matchesDate && matchesPrice && matchesLocation;
    });
  }, [events, searchQuery, selectedCategory, selectedDateRange, selectedPriceType, selectedLocationType]);

  // Setup/Update markers when map loads or filtered events change
  React.useEffect(() => {
    if (maplibregl && mapContainerRef.current && isOlaConfigured) {
      const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

      if (!mapInstanceRef.current) {
        // Initialize Maplibre GL Map
        mapInstanceRef.current = new maplibregl.Map({
          container: mapContainerRef.current,
          style: `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?api_key=${apiKey}`,
          center: [-98.5795, 39.8283], // Center of US
          zoom: 4,
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

        // Add zoom controls
        mapInstanceRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      }

      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add new markers
      filteredEvents.forEach(evt => {
        if (evt.latitude && evt.longitude) {
          const lat = Number(evt.latitude);
          const lng = Number(evt.longitude);
          
          let markerColor = '#4FC3F7'; // Aqua Blue default
          if (evt.category === 'professional') markerColor = '#17458F'; // Royal Blue
          if (evt.category === 'community') markerColor = '#0A2342'; // Deep Ocean Blue
          if (evt.category === 'club') markerColor = '#1E88E5'; // Bright Ocean Blue
          
          // Create custom marker DOM element
          const el = document.createElement('div');
          el.style.cursor = 'pointer';
          el.innerHTML = `
            <div style="filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${markerColor}" stroke="#ffffff" stroke-width="1.5" />
              </svg>
            </div>
          `;

          // Add click listener
          el.addEventListener('click', () => {
            setSelectedEvent(evt);
            mapInstanceRef.current?.panTo([lng, lat]);
          });

          // Create Maplibre Marker
          const marker = new maplibregl.Marker(el)
            .setLngLat([lng, lat])
            .addTo(mapInstanceRef.current);

          markersRef.current.push(marker);
        }
      });

      // Fit bounds if markers exist
      if (markersRef.current.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        filteredEvents.forEach(evt => {
          if (evt.latitude && evt.longitude) {
            bounds.extend([Number(evt.longitude), Number(evt.latitude)]);
          }
        });

        if (filteredEvents.length === 1) {
          const single = filteredEvents[0];
          mapInstanceRef.current.setCenter([Number(single.longitude), Number(single.latitude)]);
          mapInstanceRef.current.setZoom(12);
        } else {
          mapInstanceRef.current.fitBounds(bounds, { padding: 60 });
        }
      }
    }
  }, [maplibregl, filteredEvents, isOlaConfigured]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([lng, lat]);
            mapInstanceRef.current.setZoom(11);
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Could not access location. Please check your browser permissions.");
        }
      );
    }
  };

  const handleSelectEvent = (evt: EventItem) => {
    setSelectedEvent(evt);
    if (mapInstanceRef.current && evt.latitude && evt.longitude) {
      mapInstanceRef.current.panTo([Number(evt.longitude), Number(evt.latitude)]);
      mapInstanceRef.current.setZoom(13);
    }
  };

  // Get distance label if user location is loaded
  const getEventDistance = (evt: EventItem) => {
    if (!userLocation || !evt.latitude || !evt.longitude) return null;
    const distance = getDistance(
      userLocation.lat,
      userLocation.lng,
      Number(evt.latitude),
      Number(evt.longitude)
    );
    return `${distance.toFixed(1)} miles away`;
  };

  return (
    <section className="py-14 sm:py-20 relative border-t border-white/5 bg-[#0f0f12]">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-radial-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-coral/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="eyebrow-accent mb-2 block">Location Discovery</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Find Events <span className="text-coral">Near You</span>
            </h2>
            <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Explore professional summits, fundraisers, and community programs dynamically mapped. Select your location to find nearby trending highlights.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleUseMyLocation}
              className="rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white text-xs font-bold uppercase tracking-wider py-5 px-6 flex items-center gap-2 transition-all duration-300"
            >
              <MapPin className="h-4 w-4 text-coral animate-pulse" />
              Use My Location
            </Button>

            <Sheet open={showFiltersMobile} onOpenChange={setShowFiltersMobile}>
              <SheetTrigger
                render={
                  <Button
                    className="lg:hidden rounded-full bg-white/[0.04] border border-white/10 text-white h-10 w-10 flex items-center justify-center p-0"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <SheetContent side="bottom" className="bg-[#0f0f12] border-white/10 p-6 rounded-t-3xl max-h-[85vh] overflow-y-auto text-white">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-white text-md font-bold uppercase tracking-widest">Filter Events</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  {/* Search Input */}
                  <div className="space-y-1 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Search Keyword</Label>
                    <div className="relative">
                      <Input
                        placeholder="Search by city, title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-xl border-white/10 bg-[#16161a] pl-9 py-5 text-xs text-white placeholder-slate-400 focus-visible:ring-accent/50 w-full"
                      />
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Category selection */}
                  <div className="space-y-1 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Category</Label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                    >
                      <option value="all" className="bg-[#16161a] text-white">All Categories</option>
                      <option value="community" className="bg-[#16161a] text-white">Community Service</option>
                      <option value="professional" className="bg-[#16161a] text-white">Professional Development</option>
                      <option value="club" className="bg-[#16161a] text-white">Club Service</option>
                      <option value="international" className="bg-[#16161a] text-white">International Service</option>
                      <option value="fundraiser" className="bg-[#16161a] text-white">Fundraisers</option>
                      <option value="pr" className="bg-[#16161a] text-white">Public Relations</option>
                    </select>
                  </div>

                  {/* Date Range selection */}
                  <div className="space-y-1 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Date</Label>
                    <select
                      value={selectedDateRange}
                      onChange={(e) => setSelectedDateRange(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                    >
                      <option value="all" className="bg-[#16161a] text-white">Any Date</option>
                      <option value="today" className="bg-[#16161a] text-white">Today</option>
                      <option value="week" className="bg-[#16161a] text-white">This Week</option>
                      <option value="month" className="bg-[#16161a] text-white">This Month</option>
                    </select>
                  </div>

                  {/* Price & Location Type selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Price</Label>
                      <select
                        value={selectedPriceType}
                        onChange={(e) => setSelectedPriceType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                      >
                        <option value="all" className="bg-[#16161a] text-white">All Prices</option>
                        <option value="free" className="bg-[#16161a] text-white">Free</option>
                        <option value="paid" className="bg-[#16161a] text-white">Paid</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Type</Label>
                      <select
                        value={selectedLocationType}
                        onChange={(e) => setSelectedLocationType(e.target.value as any)}
                        className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                      >
                        <option value="all" className="bg-[#16161a] text-white">All Types</option>
                        <option value="in-person" className="bg-[#16161a] text-white">In-Person</option>
                        <option value="online" className="bg-[#16161a] text-white">Online</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={() => setShowFiltersMobile(false)}
                      className="w-full rounded-xl bg-coral hover:bg-coral/90 text-white font-bold py-4 text-xs"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {!maplibregl ? (
          <MapSkeleton />
        ) : (
          <>
            {/* Filters Panel (Desktop row layout, glassmorphic styling) */}
            <div className="hidden lg:block mb-6 p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                {/* Search Input */}
                <div className="relative">
                  <Input
                    placeholder="Search by city, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl border-white/10 bg-[#16161a] pl-9 py-5 text-xs text-white placeholder-slate-400 focus-visible:ring-accent/50"
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Category selection */}
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                  >
                    <option value="all" className="bg-[#16161a] text-white">All Categories</option>
                    <option value="community" className="bg-[#16161a] text-white">Community Service</option>
                    <option value="professional" className="bg-[#16161a] text-white">Professional Development</option>
                    <option value="club" className="bg-[#16161a] text-white">Club Service</option>
                    <option value="international" className="bg-[#16161a] text-white">International Service</option>
                    <option value="fundraiser" className="bg-[#16161a] text-white">Fundraisers</option>
                    <option value="pr" className="bg-[#16161a] text-white">Public Relations</option>
                  </select>
                </div>

                {/* Date Range selection */}
                <div>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                  >
                    <option value="all" className="bg-[#16161a] text-white">Any Date</option>
                    <option value="today" className="bg-[#16161a] text-white">Today</option>
                    <option value="week" className="bg-[#16161a] text-white">This Week</option>
                    <option value="month" className="bg-[#16161a] text-white">This Month</option>
                  </select>
                </div>

                {/* Price & Location Type toggles */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedPriceType}
                    onChange={(e) => setSelectedPriceType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                  >
                    <option value="all" className="bg-[#16161a] text-white">All Prices</option>
                    <option value="free" className="bg-[#16161a] text-white">Free</option>
                    <option value="paid" className="bg-[#16161a] text-white">Paid</option>
                  </select>

                  <select
                    value={selectedLocationType}
                    onChange={(e) => setSelectedLocationType(e.target.value as any)}
                    className="w-full rounded-xl border border-white/10 bg-[#16161a] p-3 text-xs text-white focus:ring-1 focus:ring-accent outline-none h-11"
                  >
                    <option value="all" className="bg-[#16161a] text-white">In-Person/Online</option>
                    <option value="in-person" className="bg-[#16161a] text-white">In-Person</option>
                    <option value="online" className="bg-[#16161a] text-white">Online</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Map and Content split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Map Column */}
              <div className="lg:col-span-2 relative h-[300px] sm:h-[400px] lg:h-[550px] w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950/80 shadow-2xl">
                {isOlaConfigured ? (
                  <div ref={mapContainerRef} className="h-full w-full" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-[#101014] relative">
                    <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
                    <div className="relative mb-4">
                      <div className="absolute -inset-2 rounded-full bg-accent/20 blur-md animate-pulse" />
                      <Map className="relative h-12 w-12 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider">Interactive Map Standby</h3>
                    <p className="max-w-md text-xs text-slate-400 leading-relaxed mb-6">
                      To view live interactive maps, configure your <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-white">NEXT_PUBLIC_OLA_MAPS_API_KEY</code>. You can interact with filtered events in the list below.
                    </p>
                    {/* Fallback events display inside map area */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                      {filteredEvents.slice(0, 3).map(evt => (
                        <span key={evt.id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white font-semibold">
                          {evt.title} ({evt.location.split(',')[0]})
                        </span>
                      ))}
                      {filteredEvents.length > 3 && (
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white font-semibold">
                          +{filteredEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Pinned Info Banner */}
                <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md border border-white/10 rounded-full py-1.5 px-3 flex items-center gap-1.5 text-[10px] text-white font-semibold shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Showing {filteredEvents.length} events
                </div>

                {/* Floating Event Preview Card */}
                {selectedEvent && (
                  <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-[350px] bg-slate-950/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl animate-fade-in-up flex gap-3 text-left z-20">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                      ×
                    </button>

                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative">
                      <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-black/75 px-2 py-0.5 rounded text-[8px] font-bold text-coral uppercase tracking-wider">
                        {selectedEvent.category}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-white leading-snug line-clamp-1 transition-colors duration-300 group-hover:text-coral">
                          {selectedEvent.title}
                        </h4>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-coral" />
                          {selectedEvent.date}
                        </p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1 line-clamp-1">
                          <MapPin className="h-3 w-3 text-accent" />
                          {selectedEvent.location}
                        </p>
                        {getEventDistance(selectedEvent) && (
                          <p className="text-[8px] font-bold text-emerald-400 font-mono tracking-wide">
                            {getEventDistance(selectedEvent)}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-extrabold text-white">{selectedEvent.price}</span>
                        <Link
                          href={`/events?eventId=${selectedEvent.id}`}
                          className="text-[9px] font-bold text-coral hover:text-coral-soft flex items-center gap-1 transition-all uppercase tracking-wider"
                        >
                          Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar / Nearby Trending Column */}
              <div className="flex flex-col h-[350px] sm:h-[450px] lg:h-[550px] bg-white/[0.01] border border-white/10 rounded-3xl p-5 overflow-hidden justify-between">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <TrendingUp className="h-4 w-4 text-coral" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 text-left">
                    Filtered Results ({filteredEvents.length})
                  </h3>
                </div>

                {/* Event List Strip */}
                <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 custom-scrollbar">
                  {filteredEvents.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <Compass className="h-8 w-8 text-white/20 mb-2" />
                      <span className="text-xs font-bold text-white">No events found</span>
                      <p className="text-[10px] mt-1">Adjust filters or search parameters to discover other programs.</p>
                    </div>
                  ) : (
                    filteredEvents.map(evt => {
                      const isSelected = selectedEvent?.id === evt.id;
                      return (
                        <div
                          key={evt.id}
                          onClick={() => handleSelectEvent(evt)}
                          className={cn(
                            "p-3 rounded-xl border transition-all duration-300 cursor-pointer flex gap-3 text-left relative overflow-hidden group",
                            isSelected 
                              ? "border-coral bg-coral/5 shadow-[0_0_20px_rgba(255,119,89,0.06)]"
                              : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]"
                          )}
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={evt.image}
                              alt={evt.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-white leading-snug line-clamp-1 transition-colors duration-300 group-hover:text-coral">
                                {evt.title}
                              </h4>
                              <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                                {evt.location}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[9px] font-mono text-slate-400">{evt.date}</span>
                              <span className="text-[9px] font-bold text-white">{evt.price}</span>
                            </div>
                          </div>
                          
                          {/* Distance marker if user location exists */}
                          {getEventDistance(evt) && (
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-[7px] font-mono font-bold text-emerald-400">
                              {getEventDistance(evt)}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Map Reset button */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Showing current map bounds</span>
                  <Button
                    onClick={() => {
                      setSelectedEvent(null);
                      if (mapInstanceRef.current && markersRef.current.length > 0) {
                        const bounds = new maplibregl.LngLatBounds();
                        filteredEvents.forEach(evt => {
                          if (evt.latitude && evt.longitude) {
                            bounds.extend([Number(evt.longitude), Number(evt.latitude)]);
                          }
                        });
                        mapInstanceRef.current.fitBounds(bounds, { padding: 60 });
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[9px] font-bold uppercase tracking-wider text-coral hover:text-coral-soft hover:bg-transparent"
                  >
                    Reset Map Zoom
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
