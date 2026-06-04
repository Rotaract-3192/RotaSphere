/**
 * Ola Maps API Service
 * Exposes helper functions for client-side geocoding and autocomplete requests
 */

const BASE_URL = 'https://api.olamaps.io';

function getApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
}

export function isOlaMapsConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Fetch autocomplete search predictions from Ola Maps places API
 */
export async function fetchAutocompletePredictions(input: string): Promise<any[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Ola Maps API key is not configured.");
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/places/v1/autocomplete?input=${encodeURIComponent(input)}&api_key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`Autocomplete API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.predictions || [];
  } catch (error) {
    console.error("Ola Maps Autocomplete API error:", error);
    return [];
  }
}

/**
 * Fetch place details by place_id (e.g. coordinates, geometry, address components)
 */
export async function fetchPlaceDetails(placeId: string): Promise<any | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Ola Maps API key is not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`Place Details API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error("Ola Maps Place Details API error:", error);
    return null;
  }
}

/**
 * Reverse geocode a set of coordinates (lat/lng) to get the address details
 */
export async function fetchReverseGeocode(lat: number, lng: number): Promise<any | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Ola Maps API key is not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/places/v1/reverse-geocode?latlng=${lat},${lng}&api_key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`Reverse Geocode API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error("Ola Maps Reverse Geocode API error:", error);
    return null;
  }
}

/**
 * Geocode a human-readable address to get geocoordinates and details
 */
export async function fetchGeocode(address: string): Promise<any | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Ola Maps API key is not configured.");
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/places/v1/geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error(`Geocode API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0] : null;
  } catch (error) {
    console.error("Ola Maps Geocode API error:", error);
    return null;
  }
}
