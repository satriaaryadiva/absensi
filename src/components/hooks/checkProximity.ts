// Titik kantor (Sei Kera Hilir II)
const OFFICE_LOCATION = {
  lat:  3.584819,
  lng: 98.677555,
};

// Fungsi untuk hitung jarak antar 2 titik koordinat
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // radius bumi dalam meter
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // hasil dalam meter
}

// Fungsi validasi lokasi
export function checkProximity(
  userLat: number,
  userLng: number,
  radius = 100 // default radius 100 meter
): boolean {
  const distance = getDistanceFromLatLonInMeters(
    userLat,
    userLng,
    OFFICE_LOCATION.lat,
    OFFICE_LOCATION.lng
  );

  return distance <= radius;
}
