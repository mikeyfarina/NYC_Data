import React, { useRef, useState, useEffect } from 'react';
import css from './map.module.css';
import mapbox from 'mapbox-gl/dist/mapbox-gl-csp';
import Worker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';
import borders from '../nyc_neighborhood_borders.json';

mapbox.workerClass = Worker;
mapbox.accessToken =
  'pk.eyJ1IjoibWZhcmluYSIsImEiOiJja202cHRwZWswcG1lMm93MHB0MnUyemp1In0.KnAMQsCzzorHy5XAdddOIw';

export default function Map() {
  const mapContainer = useRef();
  const [long, setLong] = useState(-73.95);
  const [lat, setLat] = useState(40.72);
  const [zoom, setZoom] = useState(10.5);

  useEffect(() => {
    const map = new mapbox.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [long, lat],
      zoom,
      bearing: 25,
    });
    map.on('load', () => {
      map.addSource('neighborhoods', borders);
      map.addLayer({
        id: 'neighborhood',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': '#696969',
          'fill-opacity': 0.4,
          'fill-outline-color': '#000000',
        },
        filter: ['==', '$type', 'Polygon'],
      });
      map.addLayer({
        id: 'border',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-width': 1,
          'line-color': 'white',
        },
      });
    });
    map.on('move', () => {
      setLong(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });
    map.on('click', e => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['neighborhood'],
      });
      if (!features.length) return;
      const feature = features[0];
      console.log(feature);
      new mapbox.Popup({
        offset: [0, -15],
        className: css.popup,
        closeButton: false,
        maxWidth: 'none',
      })
        .setLngLat(e.lngLat)
        .setHTML(
          `<h3 class=${css.popupText}>${feature.properties.neighborhood}</h3>
          <p class=${css.popupText}>${feature.properties.borough}</p>`
        )
        .addTo(map);
    });
    return () => map.remove();
  }, []);

  return (
    <div>
      <div className={css.sidebar}>
        Longitude: {long} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div className={css.container} ref={mapContainer} />
    </div>
  );
}
