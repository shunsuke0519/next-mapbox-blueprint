import React, { useState, useEffect } from "react";
import ReactMapGL, { Marker, Popup, NavigationControl } from "react-map-gl";
import * as parkData from "../data/persons-data.json";

export default function App() {
  const navStyle = {
    position: "absolute",
    top: 0,
    right: 10,
    padding: "10px",
  };

  const [viewport, setViewport] = useState({
    latitude: 36.204823,
    longitude: 138.25293,
    width: "100vw",
    height: "100vh",
    zoom: 5,
  });

  const [selectedPark, setSelectedPark] = useState(null);

  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedPark(null);
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <div>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_FRAMEWORK}
        mapStyle="mapbox://styles/shunsukeito/ckaanisi33g1k1ipowgmg8tdd"
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
      >
        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>

        {parkData.features.map((park) => (
          <Marker
            key={park.properties.PARK_ID}
            latitude={park.geometry.coordinates[1]}
            longitude={park.geometry.coordinates[0]}
          >
            <button
              className="marker-btn"
              onClick={(e) => {
                e.preventDefault();
                setSelectedPark(park);
              }}
            >
              <imgage src={park.properties.PICTURE_LI} alt="person" />
            </button>
          </Marker>
        ))}

        {selectedPark ? (
          <Popup
            latitude={selectedPark.geometry.coordinates[1]}
            longitude={selectedPark.geometry.coordinates[0]}
            onClose={(e) => {
              setSelectedPark(null);
            }}
          >
            <div>
              <h2>{selectedPark.properties.NAME}</h2>
              <p>{selectedPark.properties.DESCRIPTIO}</p>
              <imgage
                src={selectedPark.properties.PICTURE_LI}
                width="150"
                height="150"
              ></imgage>
            </div>
          </Popup>
        ) : null}
      </ReactMapGL>
    </div>
  );
}
