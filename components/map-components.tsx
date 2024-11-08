import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Phone } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  name: string;
  location: Location;
  vicinity?: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;         // TripAdvisor location_id
  distance?: string;         // Distance from search center
  bearing?: string;         // Direction from search center (e.g., "north", "southeast")
  type?: string;           // Type of place (e.g., "restaurant", "hotel")
  phone?: string;          // Phone number if available
  website?: string;        // Website URL if available
  photos?: string[];       // Array of photo URLs
}

interface MapProps {
  center: Location;
  places?: Place[];
  zoom?: number;
}

const MapComponent = ({ center, places = [], zoom = 14, onMarkerClick }: MapProps & { onMarkerClick?: (place: Place) => void }) => {
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

      marker.getElement().addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(place);
        }
      });

      markersRef.current.push(marker);
    });
  }, [places, onMarkerClick]);

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

interface PlaceDetailsProps extends Place {
  onDirectionsClick?: () => void;
  onWebsiteClick?: () => void;
  onCallClick?: () => void;
}

const PlaceDetails = ({
  name,
  vicinity,
  rating,
  user_ratings_total,
  onDirectionsClick,
  onWebsiteClick,
  onCallClick
}: PlaceDetailsProps) => (
  <Card className="w-full bg-white dark:bg-neutral-800 shadow-lg">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{name}</h3>
          {vicinity && <p className="text-sm text-neutral-500 dark:text-neutral-400">{vicinity}</p>}
        </div>
        {rating && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400" />
            <span>{rating}</span>
            {user_ratings_total && <span className="text-xs">({user_ratings_total})</span>}
          </Badge>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onDirectionsClick}
          className="flex-1"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Directions
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onWebsiteClick}
          className="flex-1"
        >
          <Globe className="h-4 w-4 mr-2" />
          Website
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCallClick}
          className="flex-1"
        >
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
      </div>
    </CardContent>
  </Card>
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
        <PlaceDetails key={index} {...place} />
      ))}
    </div>
  );
};

interface MapViewProps extends MapProps {
  view: 'map' | 'list';
  onViewChange: (view: 'map' | 'list') => void;
}

const MapView: React.FC<MapViewProps> = ({
  center,
  places = [],
  zoom = 14,
  view,
  onViewChange
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Nearby Places
        </h2>
        <Tabs value={view} onValueChange={(v) => onViewChange(v as 'map' | 'list')}>
          <TabsList>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === 'map' ? (
        <div className="relative">
          <MapComponent
            center={center}
            places={places}
            zoom={zoom}
            onMarkerClick={setSelectedPlace}
          />
          {selectedPlace && (
            <div className="absolute bottom-4 left-4 right-4">
              <PlaceDetails {...selectedPlace} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {places.map((place, index) => (
            <PlaceDetails key={index} {...place} />
          ))}
        </div>
      )}
    </div>
  );
};

export { MapComponent, MapSkeleton, MapContainer, PlaceDetails, MapView };