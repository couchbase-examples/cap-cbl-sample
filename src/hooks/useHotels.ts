import { useState, useEffect } from "react";
import { DatabaseService } from "../services/database.service";


const useHotels = (databaseService: DatabaseService) => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [liveQueryToken, setLiveQueryToken] = useState<string | null>(null);

  useEffect(() => {
    if (databaseService) {
      databaseService
        .getHotelsLive(
          (updatedHotels) => {
            setHotels(updatedHotels);
          },
          (err) => {
            setError(err);
          }
        )
        .then((token) => {
          setLiveQueryToken(token);
        });
    }

    // Cleanup: stop the live query when the component unmounts.
    return () => {
      if (databaseService && liveQueryToken) {
        databaseService.stopHotelsLiveQuery(liveQueryToken);
      }
    };
  }, [databaseService]);

  return { hotels, error };
};

export default useHotels;