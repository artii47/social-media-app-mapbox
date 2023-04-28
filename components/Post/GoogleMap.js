import React, { useState, useRef, useEffect } from "react";
import ReactMapboxGl, { Layer } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl, { clearStorage } from 'mapbox-gl';

mapboxgl.accessToken =
  'pk.eyJ1IjoiYXJ0aTQ3IiwiYSI6ImNraHQydTh0MjBxMzYycWxoNm54aWJld2EifQ._wR4gZMPRohZ3pX3ZEgURw';

const GoogleMap = ({ mapData, setMapData, setDistance, distance }) => {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(mapData ? JSON.parse(mapData).features[0].geometry.coordinates[0] : 5);
  const [lat, setLat] = useState(mapData ? JSON.parse(mapData).features[0].geometry.coordinates[1] : 34);
  const [zoom, setZoom] = useState(mapData ? 12 : 1.5);
const geojson = {
    'type': 'FeatureCollection',
    'features': []
};

// Used to draw a line between points
const linestring = {
    'type': 'Feature',
    'geometry': {
        'type': 'LineString',
        'coordinates': []
    }
};

  // Initialize map when component mounts
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    map.on('load', () => {
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxZoom: 16,
      })
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
      map.addLayer({
        id: "sky",
        type: "sky",
        paint: {
          "sky-type": "atmosphere",
          "sky-atmosphere-sun": [0.0, 90.0],
          "sky-atmosphere-sun-intensity": 15,
        },
      })
      map.addSource('geojson', {
        'type': 'geojson',
        'data': geojson
    });

  
      // Add styles to the map
      map.addLayer({
          id: 'measure-points',
          type: 'circle',
          source: 'geojson',
          paint: {
              'circle-radius': 7,
              'circle-color': '#ff9c19',
          },
          filter: ['in', '$type', 'Point']
      });
      map.addLayer({
          id: 'measure-lines',
          type: 'line',
          source: 'geojson',
          layout: {
              'line-cap': 'round',
              'line-join': 'round'
          },
          paint: {
              'line-color': '#99e62e',
              'line-width': 3,
          },
          filter: ['in', '$type', 'LineString']
      });
    mapData && map.getSource('geojson').setData(JSON.parse(mapData));
      map.on('click', (e) => {
          const features = map.queryRenderedFeatures(e.point, {
              layers: ['measure-points']
          });
  
          if (geojson.features.length > 1) geojson.features.pop();

          if (features.length) {
              const id = features[0].properties.id;
              geojson.features = geojson.features.filter(
                  (point) => point.properties.id !== id
              );
          } else {
              const point = {
                  'type': 'Feature',
                  'geometry': {
                      'type': 'Point',
                      'coordinates': [e.lngLat.lng, e.lngLat.lat]
                  },
                  'properties': {
                      'id': String(new Date().getTime())
                  }
              };
  
              geojson.features.push(point);
          }
  
          if (geojson.features.length > 1) {
              linestring.geometry.coordinates = geojson.features.map(
                  (point) => point.geometry.coordinates
              );
              geojson.features.push(linestring);
              const distance = turf.length(linestring);
              setDistance && setDistance(distance.toFixed(2))
          }
          !mapData && map.getSource('geojson').setData(geojson);
          !mapData && setMapData(JSON.stringify(geojson));
      });
  });
  
  map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
          layers: ['measure-points']
      });
      // Change the cursor to a pointer when hovering over a point on the map.
      // Otherwise cursor is a crosshair.
      map.getCanvas().style.cursor = features.length
          ? 'pointer'
          : 'crosshair';
  });

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div style={{position:'relative'}}>
      <div style={{position: 'absolute', top: '20px', left: '20px', backgroundColor: '#000', zIndex: '999', padding: '5px 20px', borderRadius: '20px', color: '#fff', opacity: '0.9'}}>
        {`Distance: ${distance} km`}
      </div>
      <div style={{
        height: '500px',
        width: '100%'
      }} ref={mapContainerRef} />
    </div>
  );
};

export default React.memo(GoogleMap);