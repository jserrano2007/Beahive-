import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { HARTFORD_CENTER, hasCoords } from '../utils/places'
import { categoryColor } from '../utils/categories'
import './Map.css'

function RecenterMap({ center, fitBounds, points }) {
  const map = useMap()

  useEffect(() => {
    if (fitBounds && points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 15)
      } else {
        map.fitBounds(points, { padding: [30, 30] })
      }
    } else {
      map.setView([center.lat, center.lng], map.getZoom())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitBounds, points.join(','), center.lat, center.lng, map])

  return null
}

function clusterIcon(count) {
  return L.divIcon({
    html: `<div class="neighborhood-cluster-marker">${count}</div>`,
    className: 'neighborhood-cluster-icon-wrapper',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

function Map({ places = [], onSelectPlace, center = HARTFORD_CENTER, userLocation, fitBounds = false }) {
  const pinnedPlaces = places.filter((place) => !place.isNeighborhoodGroup && hasCoords(place))
  const groupPlaces = places.filter((place) => place.isNeighborhoodGroup)
  const allPoints = [...pinnedPlaces, ...groupPlaces].map((place) => [place.lat, place.lng])

  return (
    <div className="place-map">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} fitBounds={fitBounds} points={allPoints} />
        {pinnedPlaces.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.lat, place.lng]}
            radius={9}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: categoryColor(place.category),
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSelectPlace(place),
            }}
          />
        ))}
        {groupPlaces.map((group) => (
          <Marker
            key={group.id}
            position={[group.lat, group.lng]}
            icon={clusterIcon(group.count)}
            eventHandlers={{
              click: () => onSelectPlace(group),
            }}
          />
        ))}
        {userLocation && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={18}
              pathOptions={{
                stroke: false,
                fillColor: '#2f5d3a',
                fillOpacity: 0.18,
              }}
              interactive={false}
            />
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{
                color: '#fffcf5',
                weight: 3,
                fillColor: '#2f5d3a',
                fillOpacity: 1,
              }}
              interactive={false}
            />
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default Map
