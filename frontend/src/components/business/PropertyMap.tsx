/**
 * PropertyMap Component
 * 
 * Displays an interactive OpenStreetMap for property location.
 * Uses Leaflet for map rendering.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with bundlers
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon issue
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
    latitude?: number;
    longitude?: number;
    neighborhood: string;
    city: string;
}

export const PropertyMap = ({ latitude, longitude, neighborhood, city }: PropertyMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // If no coordinates, don't render the map
        if (!latitude || !longitude) return;

        // If map already exists, just update view
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);
            return;
        }

        // Create map
        if (mapRef.current && !mapInstanceRef.current) {
            const map = L.map(mapRef.current, {
                center: [latitude, longitude],
                zoom: 15,
                scrollWheelZoom: false, // Prevent accidental zooming
            });

            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add marker
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup(`<b>${neighborhood}</b><br>${city}`)
                .openPopup();

            mapInstanceRef.current = map;
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [latitude, longitude, neighborhood, city]);

    // If no coordinates, show placeholder
    if (!latitude || !longitude) {
        return (
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 relative group h-48 bg-slate-800">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <MapPin size={32} className="mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Location not available</p>
                    <p className="text-[10px] text-white/50 mt-2">{neighborhood}, {city}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 relative h-48">
            <div ref={mapRef} className="w-full h-full z-0" />
            <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
                <p className="text-[10px] text-gray-600 bg-white/80 inline-block px-2 py-1 rounded">
                    {neighborhood}, {city}
                </p>
            </div>
        </div>
    );
};
