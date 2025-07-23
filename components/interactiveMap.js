import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function InteractiveMap({ initialLocation, radius, onLocationSelect }) {
  const webviewRef = useRef();

  const htmlContent = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const initialLat = ${initialLocation.latitude};
        const initialLng = ${initialLocation.longitude};
        const initialRadius = ${radius};

        var map = L.map('map').setView([initialLat, initialLng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        var marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

        var circle = L.circle([initialLat, initialLng], {
          radius: initialRadius,
          color: 'blue',
          fillColor: '#3399ff',
          fillOpacity: 0.2,
        }).addTo(map);

        function updateCoords(lat, lng) {
          circle.setLatLng([lat, lng]);
          marker.setLatLng([lat, lng]);
          window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
        }

        function updateRadius(newRadius) {
          circle.setRadius(newRadius);
        }

        marker.on('dragend', function (e) {
          const pos = e.target.getLatLng();
          updateCoords(pos.lat, pos.lng);
        });

        map.on('click', function (e) {
          updateCoords(e.latlng.lat, e.latlng.lng);
        });

        document.addEventListener("message", function(event) {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'UPDATE_RADIUS') {
              updateRadius(data.value);
            }
          } catch (e) {
            console.error("Invalid message from React Native:", e);
          }
        });
      </script>
    </body>
    </html>
  `, [initialLocation.latitude, initialLocation.longitude]);

  // Update radius dynamically without reloading the WebView
  useEffect(() => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_RADIUS', value: radius }));
    }
  }, [radius]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={(event) => {
          try {
            const coords = JSON.parse(event.nativeEvent.data);
            onLocationSelect(coords);
          } catch (err) {
            console.error("Failed to parse message from WebView:", err);
          }
        }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
});
