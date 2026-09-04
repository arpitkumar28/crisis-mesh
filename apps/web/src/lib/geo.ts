/**
 * Parses a PostGIS geography value (WKT "POINT(lng lat)" string, or a
 * GeoJSON-style {coordinates:[lng,lat]} object) into {lat, lng}.
 * Returns null when the value can't be parsed.
 */
export function parseGeoPoint(geo: any): { lat: number; lng: number } | null {
  if (typeof geo === 'string' && geo.includes('POINT')) {
    const match = geo.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
    if (match) {
      return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
    }
  }
  if (geo && typeof geo === 'object' && Array.isArray(geo.coordinates)) {
    return { lng: geo.coordinates[0], lat: geo.coordinates[1] };
  }
  return null;
}
