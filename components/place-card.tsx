/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import PlaceholderImage from './placeholder-image';


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

interface PlaceCardProps {
    place: Place;
    onClick: () => void;
    isSelected?: boolean;
    variant?: 'overlay' | 'list';
}

const PlaceCard: React.FC<PlaceCardProps> = ({
    place,
    onClick,
    isSelected = false,
    variant = 'list'
}) => {
    const isOverlay = variant === 'overlay';

    // Validation helpers from before...
    const isValidString = (str: any): boolean => {
        return str !== undefined && 
               str !== null && 
               String(str).trim() !== '' && 
               String(str).toLowerCase() !== 'undefined' && 
               String(str).toLowerCase() !== 'null';
    };

    const isValidNumber = (num: any): boolean => {
        if (num === undefined || num === null) return false;
        const parsed = Number(num);
        return !isNaN(parsed) && isFinite(parsed) && parsed !== 0;
    };

    const formatRating = (rating: any): string => {
        if (!isValidNumber(rating)) return '';
        const parsed = Number(rating);
        return parsed.toFixed(1);
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "transition-all duration-200 cursor-pointer rounded-lg",
                variant === 'overlay' 
                    ? 'bg-white/90 dark:bg-black/90 backdrop-blur-sm' 
                    : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                isSelected && variant !== 'overlay' && 'ring-2 ring-primary dark:ring-primary',
                'border border-neutral-200 dark:border-neutral-800'
            )}
        >
            <div className="flex flex-col sm:flex-row gap-4 p-4">
                {/* Image Container */}
                <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    {place.photos?.[0]?.medium ? (
                        <img
                            src={place.photos[0].medium}
                            alt={place.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <PlaceholderImage />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Title Section */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white truncate">
                            {place.name}
                        </h3>
                        
                        {isValidNumber(place.rating) && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-neutral-900 dark:text-white">
                                    {formatRating(place.rating)}
                                </span>
                                {isValidNumber(place.reviews_count) && (
                                    <span className="text-neutral-500 dark:text-neutral-400">
                                        ({place.reviews_count} reviews)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status & Info */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                        {place.is_closed !== undefined && (
                            <span className={cn(
                                "text-sm font-medium",
                                place.is_closed 
                                    ? "text-red-600 dark:text-red-400" 
                                    : "text-green-600 dark:text-green-400"
                            )}>
                                {place.is_closed ? "Closed" : "Open now"}
                            </span>
                        )}
                        {isValidString(place.next_open_close) && (
                            <>
                                <span className="text-neutral-500 dark:text-neutral-400">·</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    until {place.next_open_close}
                                </span>
                            </>
                        )}
                        {isValidString(place.type) && (
                            <>
                                <span className="text-neutral-500 dark:text-neutral-400">·</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400 capitalize">
                                    {place.type}
                                </span>
                            </>
                        )}
                        {isValidString(place.price_level) && (
                            <>
                                <span className="text-neutral-500 dark:text-neutral-400">·</span>
                                <span className="text-neutral-500 dark:text-neutral-400">
                                    {place.price_level}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    {isValidString(place.description) && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                            {place.description}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 sm:flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`,
                                    '_blank'
                                );
                            }}
                        >
                            Directions
                        </Button>
                        {isValidString(place.website) && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(place.website, '_blank');
                                }}
                            >
                                Website
                            </Button>
                        )}
                        {isValidString(place.phone) && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`tel:${place.phone}`, '_blank');
                                }}
                            >
                                Call
                            </Button>
                        )}
                        {isValidString(place.place_id) && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`https://www.tripadvisor.com/${place.place_id}`, '_blank');
                                }}
                            >
                                TripAdvisor
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceCard;