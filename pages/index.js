import React, { useState, useRef } from "react";
import Image from "next/image";

// import useSwr from "swr";
import ReactMapGL, {
  Marker,
  FlyToInterpolator,
  NavigationControl,
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
    latitude: 52.6376,
    longitude: -1.135171,
    width: "100vw",
    height: "100vh",
    zoom: 12,
  });
  const mapRef = useRef();

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
      crimeId: crime.id,
      category: crime.category,
    },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(crime.location.longitude),
        parseFloat(crime.location.latitude),
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
                    width: "${10 + PointCount / points.lenght) * 50}px",
                    height: "${10 + PointCount / points.lenght) * 50}px",
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
                        spped: 2,
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
              <button className="crime-marker">
                <Image
                  src="/custody.svg"
                  alt="crime doesn't pay"
                  width="25px"
                  height="25px"
                />
              </button>
            </Marker>
          );
        })}
      </ReactMapGL>
    </div>
  );
}
