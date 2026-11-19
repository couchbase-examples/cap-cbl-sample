// DatabaseProvider.tsx
import React, { useState, ReactNode, useMemo, useEffect } from 'react';
import { DatabaseService } from "../services/database.service";
import DatabaseContext from './DatabaseContext';

interface DatabaseProviderProps {
  children: ReactNode;
}

const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // Lazy initializer: the service (and its CapacitorEngine, database handle and
  // replicator) is created once per provider, not on every render.
  const [databaseService, setDatabaseService] = useState<DatabaseService>(
    () => new DatabaseService()
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // initializeDatabase() is idempotent, so React StrictMode's double-invoked
    // effect does not open the database or start the replicator twice.
    databaseService
      .initializeDatabase()
      .then(() => {
        if (!cancelled) setInitialized(true);
      })
      .catch((e) => {
        console.error("Error initializing database:", e);
      });
    return () => {
      cancelled = true;
    };
  }, [databaseService]);

  const databaseServiceValue = useMemo(
    () => ({ databaseService, setDatabaseService }),
    [databaseService]
  );

  if (!initialized) {
    // Render a loading state until initialization completes.
    return <div>Loading database...</div>;
  }

  return (
    <DatabaseContext.Provider value={databaseServiceValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseProvider;
