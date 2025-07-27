// components/map/MiniMapView.js

import React, { useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MiniMapView({ latitude, longitude, radius }) {
  const webviewRef = useRef();

  const html = useMemo(() => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const lat = ${latitude};
        const lng = ${longitude};
        const radius = ${radius};

        var map = L.map('map', { zoomControl: false, dragging: false }).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.marker([lat, lng]).addTo(map);

        L.circle([lat, lng], {
          radius: radius,
          color: 'blue',
          fillColor: '#3399ff',
          fillOpacity: 0.2
        }).addTo(map);
      </script>
    </body>
    </html>
  `, [latitude, longitude, radius]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ html }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
