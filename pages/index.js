import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
// import useSwr from "swr";
import ReactMapGL, {
  Marker,
  FlyToInterpolator,
  NavigationControl,
  Popup,
} from "react-map-gl";
import useSupercluster from "use-supercluster";

// const fetcher = (...args) => fetch(...args).then(response => response.json());

export default function App() {
  const navStyle = {
    position: "absolute",
    top: 0,
    right: 10,
    padding: "10px",
  };

  //set up map
  const [viewport, setViewport] = useState({
    latitude: 36.204823,
    longitude: 138.25293,
    width: "100vw",
    height: "100vh",
    zoom: 4,
  });
  const mapRef = useRef();

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

  // load and prepare data
  const url =
    "https://data.police.uk/api/crimes-street/all-crime?lat=52.629729&lng=-1.131592&date=2019-10";

  // const {data, error} = useSwr(url, fetcher);
  const crimes = require("../data/skateboard-parks.json");
  //   console.log(crimes);
  // const crimes = data && !error ? data.slice(0, 100) : [];

  const points = crimes.map((crime) => ({
    type: "Feature",
    properties: {
      cluster: false,
      crimeId: crime.properties.id,
      name: crime.properties.NAME,
      descriptio: crime.properties.DESCRIPTIO,
      //   picture: crime.properties.PICTURE_LI,
      src: crime.properties.src,
      url: crime.properties.URL,
      adress: crime.properties.ADDRESS_FR,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(crime.geometry.coordinates[0]),
        parseFloat(crime.geometry.coordinates[1]),
      ],
    },
  }));

  // get map bounds
  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  // get clusters
  const { clusters, supercluster } = useSupercluster({
    points,
    zoom: viewport.zoom,
    bounds,
    options: { radius: 75, maxZoom: 20 },
  });

  // return map
  return (
    <div>
      <ReactMapGL
        {...viewport}
        maxZoom={20}
        mapboxApiAccessToken={process.env.NEXT_PUBLIC_FRAMEWORK}
        mapStyle="mapbox://styles/shunsukeito/ckaanisi33g1k1ipowgmg8tdd"
        onViewportChange={(newViewport) => {
          setViewport({ ...newViewport });
        }}
        ref={mapRef}
      >
        <div className="nav" style={navStyle}>
          <NavigationControl />
        </div>

        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } =
            cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={cluster.id}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="cluster-marker"
                  style={{
                    width: `${30 + (pointCount / points.length) * 30}px`,
                    height: `${30 + (pointCount / points.length) * 30}px`,
                    border: "1px solid white",
                    position: "absolute",
                    margin: "auto",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );
                    setViewport({
                      ...viewport,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        spped: 1.2,
                      }),
                      transitionDuration: "auto",
                    });
                  }}
                >
                  {pointCount}{" "}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={cluster.properties.crimeId}
              latitude={latitude}
              longitude={longitude}
            >
              <button
                className="crime-marker"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedPark(cluster);
                }}
              >
                <Image
                  src={cluster.properties.src}
                  alt="Picture of the author"
                  width={50}
                  height={50}
                />
                {/* <img
                  src={cluster.properties.src}
                  alt={cluster.properties.NAME}
                /> */}
              </button>
            </Marker>
          );
        })}

        {/* {seletctedPark ? () : null} */}

        {selectedPark ? (
          <Popup
            latitude={selectedPark.geometry.coordinates[1]}
            longitude={selectedPark.geometry.coordinates[0]}
            onClose={() => {
              setSelectedPark(null);
            }}
          >
            <div>
              <h2>{selectedPark.properties.name}</h2>
              <p>{selectedPark.properties.descriptio}</p>
              <Image
                src={selectedPark.properties.src}
                alt="Picture of the author"
                width={200}
                height={200}
              />
              <h2>
                <a
                  href={`${selectedPark.properties.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedPark.properties.url}
                </a>
              </h2>
            </div>
          </Popup>
        ) : null}
      </ReactMapGL>
    </div>
  );
}
