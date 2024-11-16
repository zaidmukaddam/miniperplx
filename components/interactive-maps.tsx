import React, { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from "@/lib/utils";

interface Location {
  lat: number;
  lng: number;
}

interface Photo {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
  caption?: string;
}

interface Place {
  name: string;
  location: Location;
  place_id: string;
  vicinity: string;
  rating?: number;
  reviews_count?: number;
  price_level?: string;
  description?: string;
  photos?: Photo[];
  is_closed?: boolean;
  next_open_close?: string;
  type?: string;
  cuisine?: string;
  source?: string;
  phone?: string;
  website?: string;
  hours?: string[];
  distance?: string;
  bearing?: string;
}

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface InteractiveMapProps {
  center: Location;
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  places,
  selectedPlace,
  onPlaceSelect,
  className
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Handler for marker clicks
  const handleMarkerClick = useCallback((place: Place) => {
    onPlaceSelect(place);
  }, [onPlaceSelect]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [center.lng, center.lat],
      zoom: 13,
      attributionControl: false,
    });

    const map = mapRef.current;

    // Add minimal controls
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right',
    );

    // Compact attribution
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-right'
    );

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      map.remove();
    };
  }, [center.lat, center.lng]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    places.forEach((place, index) => {
      const isSelected = selectedPlace?.name === place.name;

      // Create marker element
      const el = document.createElement('div');
      el.className = cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 cursor-pointer',
        isSelected
          ? 'bg-black text-white scale-110'
          : 'bg-white text-black hover:scale-105'
      );
      el.style.border = '2px solid currentColor';
      el.innerHTML = `${index + 1}`;

      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([place.location.lng, place.location.lat])
        .addTo(mapRef.current!);

      // Add click handler
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent map click
        handleMarkerClick(place);
      });

      // Store marker reference
      markersRef.current[place.name] = marker;
    });
  }, [places, selectedPlace, handleMarkerClick]);

  // Handle map click to deselect
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Check if click was on a marker
      const clickedMarker = Object.values(markersRef.current).some(marker => {
        const markerEl = marker.getElement();
        return e.originalEvent.target === markerEl || markerEl.contains(e.originalEvent.target as Node);
      });

      // If click wasn't on a marker, deselect
      if (!clickedMarker) {
        onPlaceSelect(null as any); // Type cast to satisfy TS
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [onPlaceSelect]);

  // Fly to selected place
  useEffect(() => {
    if (!mapRef.current || !selectedPlace) return;

    mapRef.current.flyTo({
      center: [selectedPlace.location.lng, selectedPlace.location.lat],
      zoom: 15,
      duration: 1500,
      essential: true,
    });
  }, [selectedPlace]);

  return (
    <div className={cn("w-full h-full relative z-0", className)}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default InteractiveMap;