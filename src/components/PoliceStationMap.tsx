import React, { useState, useEffect } from 'react';

const PoliceStationMap = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use the browser's Geolocation API to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError('Unable to retrieve your location. Please enable location services.');
          console.error(err);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  // Construct the OpenStreetMap URL for the user's location
  const openStreetMapUrl = location
    ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`
    : null;

  // Construct the static map image URL
  const staticMapUrl = location
    ? `https://staticmap.openstreetmap.de/staticmap.php?center=${location.latitude},${location.longitude}&zoom=15&size=600x450&markers=${location.latitude},${location.longitude}&format=png`
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-white mb-6">
        Find Nearest Police Station
      </h2>
      <p className="text-center text-gray-300 mb-6">
        Use the map below to find the nearest police station to register your FIR.
      </p>
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {location ? (
        <div className="text-center">
          {/* Display the static map image */}
          <img
            src={staticMapUrl}
            alt="Police Station Map"
            style={{ width: '100%', height: 'auto', border: '1px solid #ccc' }}
          />
          <p className="mt-4">
            <a
              href={openStreetMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View on OpenStreetMap
            </a>
          </p>
        </div>
      ) : (
        !error && <p className="text-center text-gray-300">Fetching your location...</p>
      )}
    </div>
  );
};

export default PoliceStationMap;

