"use client";
import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const centerDefault = {
  lat: 19.4326,
  lng: -99.1332, // Centro CDMX por defecto
};

type Keychain = {
  id: number;
  lat: number;
  lng: number;
  label: string;
};

const keychains: Keychain[] = [
  { id: 1, lat: 19.4326, lng: -99.1332, label: "Llaveros 1" },
  { id: 2, lat: 19.427, lng: -99.1676, label: "Llaveros 2" },
  { id: 3, lat: 19.44, lng: -99.14, label: "Llaveros 3" },
];

export default function MapWithKeychains() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAkX1z7E-pwZuJExysui1YZq7n_lgRt6SM", 
  });

  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada por el navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLocationError("Permiso de ubicación denegado o error: " + error.message);
      }
    );
  }, []);

  if (loadError) return <div>Error al cargar Google Maps</div>;
  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition ?? centerDefault}
        zoom={15}
      >
        {/* Marcador ubicación actual */}
        {currentPosition && (
          <Marker
            position={currentPosition}
            title="Tu ubicación"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}

        {/* Marcadores llaveros */}
        {keychains.map((k) => (
          <Marker key={k.id} position={{ lat: k.lat, lng: k.lng }} title={k.label} />
        ))}
      </GoogleMap>
    </div>
  );
}
