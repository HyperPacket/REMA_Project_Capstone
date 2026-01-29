/**
 * Utility functions for formatting display values
 */

/**
 * Format property type for display.
 * Converts raw database values to user-friendly labels.
 */
export function formatPropertyType(type: string): string {
    const typeMap: Record<string, string> = {
        'apartment': 'Apartment',
        'town house': 'Town House',
        'villas and palaces': 'Villa / Palace',
        'whole building': 'Whole Building',
        'farms and chalets': 'Farm / Chalet',
        'studio': 'Studio',
        'villa': 'Villa',
        'land': 'Land',
        'commerecial': 'Commercial',
    };

    return typeMap[type?.toLowerCase()] || type || 'Property';
}

/**
 * Format listing type for display.
 */
export function formatListingType(listing: string): string {
    const listingMap: Record<string, string> = {
        'sale': 'For Sale',
        'rent': 'For Rent',
        'buy': 'For Sale',
    };

    return listingMap[listing?.toLowerCase()] || listing || '';
}

/**
 * Format bedroom count for display.
 */
export function formatBedrooms(bedroom: string | number): string {
    if (bedroom === 'studio' || bedroom === 0 || bedroom === '0') {
        return 'Studio';
    }
    return String(bedroom);
}
