import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Location {
  lat: number;
  lng: number;
}

interface Place {
  name: string;
  location: Location;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
}

interface MapProps {
  center: Location;
  places?: Place[];
  zoom?: number;
}

const MapComponent = React.memo(({ center, places = [], zoom = 14 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom: zoom
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Clean up markers when component unmounts
      return () => {
        markers.current.forEach(marker => marker.remove());
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!map.current) return;

    // Update center when it changes
    map.current.flyTo({
      center: [center.lng, center.lat],
      essential: true
    });

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    places.forEach(place => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
      el.style.color = 'hsl(var(--primary))';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.cursor = 'pointer';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(
              `<strong>${place.name}</strong>${place.rating ?
                `<br>Rating: ${place.rating} ⭐ (${place.user_ratings_total} reviews)` :
                ''}`
            )
        )
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [center, places]);

  if (mapError) {
    return (
      <div className="h-64 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
        {mapError}
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-64" />;
});

MapComponent.displayName = 'MapComponent';

const MapSkeleton = () => (
  <Skeleton className="w-full h-64 bg-neutral-200 dark:bg-neutral-700" />
);

const PlaceDetails = ({ place }: { place: Place }) => (
  <div className="flex justify-between items-start py-2">
    <div>
      <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">{place.name}</h4>
      {place.vicinity && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px]" title={place.vicinity}>
          {place.vicinity}
        </p>
      )}
    </div>
    {place.rating && (
      <Badge variant="secondary" className="flex items-center bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
        <Star className="h-3 w-3 mr-1 text-yellow-400" />
        {place.rating} ({place.user_ratings_total})
      </Badge>
    )}
  </div>
);

interface MapContainerProps {
  title: string;
  center: Location;
  places?: Place[];
  loading?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({ title, center, places = [], loading = false }) => {
  if (loading) {
    return (
      <Card className="w-full my-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
        <CardHeader>
          <Skeleton className="h-6 w-3/4 bg-neutral-200 dark:bg-neutral-700" />
        </CardHeader>
        <CardContent className="p-0 rounded-t-none rounded-b-xl">
          <MapSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full my-4 overflow-hidden bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
          <MapPin className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <MapComponent center={center} places={places} />
        {places.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="place-details">
              <AccordionTrigger className="px-4 text-neutral-800 dark:text-neutral-200">
                Place Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="px-4 space-y-4 max-h-64 overflow-y-auto">
                  {places.map((place, index) => (
                    <PlaceDetails key={index} place={place} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export { MapComponent, MapSkeleton, MapContainer, PlaceDetails };