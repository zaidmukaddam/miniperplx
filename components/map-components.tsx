import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const isValidCoordinate = (coord: number) => {
    return typeof coord === 'number' && !isNaN(coord) && isFinite(coord);
};

const loadGoogleMapsScript = (callback: () => void) => {
    if (window.google && window.google.maps) {
        callback();
        return;
    }

    const existingScript = document.getElementById('googleMapsScript');
    if (existingScript) {
        existingScript.remove();
    }

    window.initMap = callback;
    const script = document.createElement('script');
    script.id = 'googleMapsScript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
};

const MapComponent = React.memo(({ center, places }: { center: { lat: number; lng: number }, places: any[] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

    const initializeMap = useCallback(async () => {
        if (mapRef.current && isValidCoordinate(center.lat) && isValidCoordinate(center.lng)) {
            const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

            if (!googleMapRef.current) {
                googleMapRef.current = new Map(mapRef.current, {
                    center: center,
                    zoom: 14,
                    mapId: "347ff92e0c7225cf",
                });
            } else {
                googleMapRef.current.setCenter(center);
            }

            markersRef.current.forEach(marker => marker.map = null);
            markersRef.current = [];

            places.forEach((place) => {
                if (isValidCoordinate(place.location.lat) && isValidCoordinate(place.location.lng)) {
                    const marker = new AdvancedMarkerElement({
                        map: googleMapRef.current,
                        position: place.location,
                        title: place.name,
                    });
                    markersRef.current.push(marker);
                }
            });
        } else {
            setMapError('Invalid coordinates provided');
        }
    }, [center, places]);

    useEffect(() => {
        loadGoogleMapsScript(() => {
            try {
                initializeMap();
            } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('Failed to initialize Google Maps');
            }
        });

        return () => {
            markersRef.current.forEach(marker => marker.map = null);
        };
    }, [initializeMap]);

    if (mapError) {
        return <div className="h-64 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">{mapError}</div>;
    }

    return <div ref={mapRef} className="w-full h-64" />;
});

MapComponent.displayName = 'MapComponent';

const MapSkeleton = () => (
    <Skeleton className="w-full h-64 bg-neutral-200 dark:bg-neutral-700" />
);

const PlaceDetails = ({ place }: { place: any }) => (
    <div className="flex justify-between items-start py-2">
        <div>
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-200">{place.name}</h4>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[200px]" title={place.vicinity}>
                {place.vicinity}
            </p>
        </div>
        {place.rating && (
            <Badge variant="secondary" className="flex items-center bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                {place.rating} ({place.user_ratings_total})
            </Badge>
        )}
    </div>
);

const MapEmbed = memo(({ location, zoom = 15 }: { location: string, zoom?: number }) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(location)}&zoom=${zoom}`;

    return (
        <div className="aspect-video w-full">
            <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapUrl}
                className='rounded-xl'
            ></iframe>
        </div>
    );
});

MapEmbed.displayName = 'MapEmbed';

const FindPlaceResult = memo(({ result }: { result: any }) => {
    const place = result.candidates[0];
    const location = `${place.geometry.location.lat},${place.geometry.location.lng}`;

    return (
        <Card className="w-full my-4 overflow-hidden shadow-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{place.name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <MapEmbed location={location} />
                <div className="mt-4 space-y-2 text-neutral-800 dark:text-neutral-200">
                    <p><strong>Address:</strong> {place.formatted_address}</p>
                    {place.rating && (
                        <div className="flex items-center">
                            <strong className="mr-2">Rating:</strong>
                            <Badge variant="secondary" className="flex items-center bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                                <Star className="h-3 w-3 mr-1 text-yellow-400" />
                                {place.rating}
                            </Badge>
                        </div>
                    )}
                    {place.opening_hours && (
                        <p><strong>Open now:</strong> {place.opening_hours.open_now ? 'Yes' : 'No'}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});

FindPlaceResult.displayName = 'FindPlaceResult';

const TextSearchResult = React.memo(({ result }: { result: any }) => {
    const centerLocation = result.results[0]?.geometry?.location;
    const mapLocation = centerLocation ? `${centerLocation.lat},${centerLocation.lng}` : '';

    return (
        <Card className="w-full my-4 overflow-hidden shadow-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-800 dark:text-neutral-100">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Text Search Results</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {mapLocation && <MapComponent center={centerLocation} places={result.results} />}
                <Accordion type="single" collapsible className="w-full mt-4">
                    <AccordionItem value="place-details">
                        <AccordionTrigger className="text-neutral-800 dark:text-neutral-200">Place Details</AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {result.results.map((place: any, index: number) => (
                                    <PlaceDetails key={index} place={place} />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
});

TextSearchResult.displayName = 'TextSearchResult';

export { MapComponent, MapSkeleton, FindPlaceResult, TextSearchResult };