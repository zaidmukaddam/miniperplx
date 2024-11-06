import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';
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

const MapComponent = ({ center, places = [], zoom = 14 }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize the map only once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    if (!mapboxgl.accessToken) {
      console.error('Mapbox access token is not set');
      return;
    }

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [center.lng, center.lat],
      zoom,
    });

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  // Update map center when 'center' prop changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: [center.lng, center.lat],
        zoom,
        essential: true,
      });
    }
  }, [center, zoom]);

  // Update markers when 'places' prop changes
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    places.forEach((place) => {
      const marker = new mapboxgl.Marker()
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText(
            `${place.name}${place.vicinity ? `\n${place.vicinity}` : ''}`
          )
        )
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
    });
  }, [places]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-lg mt-6">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default React.memo(MapComponent, (prevProps, nextProps) => {
  return (
    prevProps.center.lat === nextProps.center.lat &&
    prevProps.center.lng === nextProps.center.lng &&
    prevProps.zoom === nextProps.zoom &&
    JSON.stringify(prevProps.places) === JSON.stringify(nextProps.places)
  );
});

const MapSkeleton = () => (
  <Skeleton className="w-full h-64 bg-neutral-200 dark:bg-neutral-700" />
);

const PlaceDetails = ({ place }: { place: Place }) => (
  <div className="flex justify-between items-start py-2">
    <div>
      <h2 className="text-lg font-semibold">{place.name}</h2>
      {place.vicinity && <p className="text-sm text-gray-600">{place.vicinity}</p>}
    </div>
    {place.rating && (
      <Badge
        variant="secondary"
        className="flex items-center bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
      >
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

const MapContainer: React.FC<MapContainerProps> = ({
  title,
  center,
  places = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="my-4">
        <MapSkeleton />
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <MapComponent center={center} places={places} />
      {places.map((place, index) => (
        <PlaceDetails key={index} place={place} />
      ))}
    </div>
  );
};

export { MapComponent, MapSkeleton, MapContainer, PlaceDetails };