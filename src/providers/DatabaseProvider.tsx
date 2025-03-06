// DatabaseProvider.tsx
import React, { useState, ReactNode, useMemo, useEffect } from 'react';
import { DatabaseService } from "../services/database.service";
import DatabaseContext from './DatabaseContext';

interface DatabaseProviderProps {
  children: ReactNode;
}

const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const dbService = new DatabaseService();
  const [databaseService, setDatabaseService] = useState<DatabaseService>(dbService);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await dbService.initializeDatabase();
        setInitialized(true);
      } catch (e) {
        console.error("Error initializing database:", e);
      }
    };
    initializeDatabase();
  }, [dbService]);

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
