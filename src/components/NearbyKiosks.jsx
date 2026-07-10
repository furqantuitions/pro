import { useEffect, useState } from "react";
import { getNearbyKiosks } from "../lib/kiosksApi.js";
import "./NearbyKiosks.css";

/**
 * Shows the 5 closest print shops, sorted by distance. Only the location
 * and a computed waiting time (queue time + walking time) are displayed —
 * every other field the API returns (distance, PPM, its own precomputed
 * waitingTimeMinutes/estimatedCompletionMinutes) is ignored on purpose.
 */
export default function NearbyKiosks({ pages }) {
  const [state, setState] = useState("locating"); // locating | loading | ready | error | denied
  const [kiosks, setKiosks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const load = () => {
    setState("locating");
    if (!("geolocation" in navigator)) {
      setState("error");
      setErrorMessage("This browser can't share your location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setState("loading");
        try {
          const data = await getNearbyKiosks({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            pages,
          });
          const closest = [...data]
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, 5)
            .map((kiosk) => ({
              ...kiosk,
              waitingTime:
                (kiosk.queueMinutes || 0) +
                (kiosk.walkingTimeMinutes || 0),
            }));
          setKiosks(closest);
          setState("ready");
        } catch (err) {
          setState("error");
          setErrorMessage(err.message || "Couldn't load nearby print shops.");
        }
      },
      () => {
        setState("denied");
        setErrorMessage("Turn on location access to see print shops near you.");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  return (
    <div className="nearby-kiosks">
      <p className="eyebrow nearby-kiosks__eyebrow">Closest print shops</p>

      {(state === "locating" || state === "loading") && (
        <p className="nearby-kiosks__status">Finding print shops near you…</p>
      )}

      {(state === "error" || state === "denied") && (
        <div className="nearby-kiosks__status-block">
          <p className="nearby-kiosks__status">{errorMessage}</p>
          <button type="button" className="btn btn-ghost" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {state === "ready" && kiosks.length === 0 && (
        <p className="nearby-kiosks__status">No print shops found nearby.</p>
      )}

      {state === "ready" && kiosks.length > 0 && (
        <div className="nearby-kiosks__item">
          <span className="nearby-kiosks__place">
            <span className="nearby-kiosks__name">{kiosks[0].name}</span>
            <span className="nearby-kiosks__address">{kiosks[0].address}</span>
          </span>
          <span className="nearby-kiosks__walk">
            {kiosks[0].waitingTime} min wait
          </span>
        </div>
      )}
    </div>
  );
}