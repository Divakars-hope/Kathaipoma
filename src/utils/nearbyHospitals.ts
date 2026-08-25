/**
 * Healthcare-facility discovery for the "Nearby Care" feature.
 *
 * Two tiers, by design, not by accident:
 *
 * 1. FALLBACK (always available, zero configuration, zero cost): a
 *    Google Maps search URL built from the caller's own granted location
 *    (or a plain-text search if location wasn't granted). This needs no
 *    API key at all and always works — it's the reliable default, not a
 *    degraded afterthought.
 * 2. ENHANCED (optional): if VITE_GOOGLE_PLACES_API_KEY is configured,
 *    fetches real, structured results (name/address/distance/phone) from
 *    Google's Places API (New) Text Search endpoint for a richer in-app
 *    card experience instead of just a link out to Maps.
 *
 * Neither tier ever invents a hospital or a claim about what a facility
 * treats — tier 2 only ever surfaces what Google's own place `types`
 * field reports; tier 1 doesn't surface facility data at all, only a
 * search you can review yourself.
 *
 * IMPORTANT — key exposure: this is a static SPA with no backend, so any
 * VITE_-prefixed env var is bundled into the client and is not truly
 * secret. Google's own supported pattern for this is an HTTP-referrer-
 * restricted API key (restrict it to your deployed domain in Google
 * Cloud Console) — that's what makes this safe to ship client-side, not
 * an attempt to hide the key. Documented in .env.example.
 *
 * UNTESTED: written against Google's current, documented Places API
 * (New) request/response shape, but never exercised against a real key —
 * there isn't one configured in this environment. Verify against a real
 * key before relying on tier 2 in production.
 */

export type HealthConcern = 'pcos' | 'breast'

export interface Coordinates {
  lat: number
  lng: number
}

export interface HealthcareFacility {
  id: string
  name: string
  address?: string
  /** Verified place categories from Google's own `types` field only — never invented. */
  types: string[]
  mapsUrl: string
  directionsUrl: string
  phone?: string
}

const CONCERN_QUERY: Record<HealthConcern, string> = {
  pcos: 'gynecology clinic',
  breast: 'breast cancer screening hospital'
}

export function concernSearchQuery(concern: HealthConcern): string {
  return CONCERN_QUERY[concern]
}

export function hospitalSearchEnhancedConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_PLACES_API_KEY)
}

/**
 * Always works, no key required. This is the fallback tier's entire
 * implementation — a plain Google Maps search URL.
 */
export function buildMapsSearchUrl(query: string, coords?: Coordinates): string {
  const q = encodeURIComponent(query)
  if (coords) {
    return `https://www.google.com/maps/search/${q}/@${coords.lat},${coords.lng},14z`
  }
  return `https://www.google.com/maps/search/${q}`
}

interface PlacesTextSearchResponse {
  places?: Array<{
    id: string
    displayName?: { text?: string }
    formattedAddress?: string
    internationalPhoneNumber?: string
    googleMapsUri?: string
    types?: string[]
  }>
}

/**
 * Tier 2 only — throws if not configured, so callers must check
 * hospitalSearchEnhancedConfigured() first and fall back to
 * buildMapsSearchUrl() otherwise (see NearbyCare.tsx).
 */
export async function searchNearbyHospitals(
  concern: HealthConcern,
  coords: Coordinates
): Promise<HealthcareFacility[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    throw new Error('Nearby hospital search is not configured — VITE_GOOGLE_PLACES_API_KEY is unset.')
  }

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.googleMapsUri,places.types'
    },
    body: JSON.stringify({
      textQuery: CONCERN_QUERY[concern],
      locationBias: {
        circle: { center: { latitude: coords.lat, longitude: coords.lng }, radius: 15000 }
      },
      maxResultCount: 10
    })
  })

  if (!res.ok) {
    throw new Error(`Places API request failed (${res.status})`)
  }

  const data = (await res.json()) as PlacesTextSearchResponse
  const fallbackUrl = buildMapsSearchUrl(CONCERN_QUERY[concern], coords)

  return (data.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? 'Healthcare facility',
    address: p.formattedAddress,
    types: p.types ?? [],
    mapsUrl: p.googleMapsUri ?? fallbackUrl,
    directionsUrl: p.googleMapsUri ?? fallbackUrl,
    phone: p.internationalPhoneNumber
  }))
}
