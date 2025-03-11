import {
    CapacitorEngine,
    Database,
    DatabaseConfiguration,
    FileSystem,
    LogDomain,
    LogLevel,
    MutableDocument, 
    Query,
    URLEndpoint,
    BasicAuthenticator,
    ReplicatorConfiguration,
    Replicator
} from 'cbl-ionic';

import { v4 as uuidv4 } from 'uuid';
import { Hotel } from '../models/hotel';
/**
 * Service class for managing the database and its replication.
 */
export class DatabaseService {
    private database: Database | undefined;
    private replicator: Replicator | undefined;
    private readonly engine: CapacitorEngine | undefined;
    
      /**
     * We store a reference to the live Query instance so we can stop it later.
     * If you need multiple live queries, you can store them in a Map or array.
     */

    private hotelsLiveQuery: Query | null = null;

    constructor() {
        //must create a new engine to use the SDK in a Ionic Capacitor environment environment

        //this must only be done once for the entire app.  This will be implemented as singleton, so it's Ok here.
        this.engine = new CapacitorEngine();
    }

    /**
     * Initializes the database by setting up logging and configuring the database.
     * @public
     * @throws Will throw an error if the database initialization fails.
     */
    public async initializeDatabase() {
        try {
            //turned on database logging too verbose to see information in IDE
            await Database.setLogLevel(LogDomain.ALL, LogLevel.DEBUG);
            await this.setupDatabase();
            const path = await this.database?.getPath()
            console.debug(`Database Setup with path: ${path}`);  
            if (this.replicator === undefined) {
              await this.setupReplicator();
          }  
          await this.replicator?.start(true);        
        } catch (error) {
            console.log(`Error: ${error}`);
            throw error;
        }
    }

    /**
     * Sets up the database with the necessary configurations and collections.
     * @private
     * @throws Will throw an error if the database setup fails.
     */
    private async setupDatabase() {
        /* **
        * Note about encryption: In a real-world app, the encryption key
        * should not be hardcoded like it is here.

        * One strategy is to auto generate a unique encryption key per
        * user on initial app load, then store it securely in the
        * device's keychain for later retrieval.
        * **/
        const fileSystem = new FileSystem();
        const directoryPath = await fileSystem.getDefaultPath();

        const dc = new DatabaseConfiguration();
        dc.setDirectory(directoryPath);
        dc.setEncryptionKey('8e31f8f6-60bd-482a-9c70-69855dd02c39');

        this.database = new Database('travel', dc);

        await this.database.open();
        const collections = await this.database.collections();
        //check to see if we are missing the travel sample collections, if so then create them
        if (collections.length === 1) {
            await this.database.createCollection('hotel', 'inventory');
        }
    }

    public async getHotelById(id: string) {
    
      try {
        const collection = await this.database?.collection('hotel', 'inventory');
        if (!collection) {
            throw new Error('Collection not found');
        }
        const document = await collection.document(id);
        if (!document) {
            throw new Error('Document not found');
        }
        const doc = document.toDictionary() as Hotel;
        return doc;
      } catch (error) {
        console.debug(`Error: ${error}`);
        throw error;        
      }
    }

    /**
     * returns all hotels in the inventory.hotel collection
     */
    public async getHotels() {
        try {
          const queryStr = "SELECT meta().id AS metadata_id, hotel.name, hotel.description FROM inventory.hotel AS hotel";
          return this.database?.createQuery(queryStr).execute();
        } catch (error) {
            console.debug(`Error: ${error}`);
            throw error;
        }
    }


    /**
     * Starts a live query for hotels.
     * @param onUpdate Callback invoked when the query results change.
     * @param onError Callback invoked if an error occurs.
     * @returns A token string that can be used to stop the live query.
     */
    public async getHotelsLive(
      onUpdate: (hotels: any[]) => void,
      onError: (error: string) => void
    ): Promise<string | null> {
      try {
        if (!this.database) {
          throw new Error("Database is not initialized.");
        }
        // Create your query
        const queryStr = "SELECT meta().id AS metadata_id, hotel.name, hotel.description FROM inventory.hotel AS hotel";
        this.hotelsLiveQuery = this.database.createQuery(queryStr);
        
        // Register a change listener. The listener returns a token.
        const token = await this.hotelsLiveQuery.addChangeListener((change) => {
          if (change.error) {
            console.error("Live query error:", change.error);
            onError(change.error);
            return;
          }
          // Map the results to an array of hotel documents.
          const hotels = change.results;
          onUpdate(hotels);
        });
        return token;
      } catch (error: any) {
        console.error("Error starting hotels live query:", error);
        onError(error.message || "Unknown error");
        return null;
      }
    }

    /**
     * Stops the live query for hotels using the provided token.
     * @param token The token returned when starting the live query.
     */
    public async stopHotelsLiveQuery(token: string): Promise<void> {
      try {
        if (this.hotelsLiveQuery) {
          await this.hotelsLiveQuery.removeChangeListener(token);
          // Optionally clear the query reference
          this.hotelsLiveQuery = null;
        }
      } catch (error) {
        console.error("Error stopping hotels live query:", error);
      }
    }


    /**
   * Inserts a new hotel document into `inventory.hotel`
   */
  public async insertHotel(hotelData: any) {
    try {
      const collection = await this.database?.collection('hotel', 'inventory');
      const docId = uuidv4();
      // Create a new mutable document and set fields
      const doc = new MutableDocument(docId);
      doc.setValue('name', hotelData.name);
      doc.setValue('description', hotelData.description);

      // Save to the collection
      await collection?.save(doc);
    } catch (error) {
      console.error('Error inserting hotel:', error);
      throw error;
    }
  }

  /**
   * Updates an existing hotel document by ID
   */
  public async updateHotel(docId: string, updatedData: Record<string, any>) {
    try {
      const collection = await this.database?.collection('hotel', 'inventory');
      const existingDoc = await collection?.document(docId);    
      const updatedDoc = existingDoc?.toDictionary() as Hotel;
      updatedDoc.name = updatedData.name;
      updatedDoc.description = updatedData.description;

      const newMutableDoc = new MutableDocument(
        docId,
        updatedDoc
      );

      await collection?.save(newMutableDoc);
    } catch (error) {
      console.error('Error updating hotel:', error);
      throw error;
    }
  }


  public async deleteHotel(hotel: any, metadataId: string) {
    try {
      const collection = await this.database?.collection('hotel', 'inventory');  
      const existingDoc = await collection?.document(metadataId);
  
      if (existingDoc) {
        await collection?.deleteDocument(existingDoc);
      } 
    } catch (error) {
      console.error('Error deleting hotel:', error);
      throw error;
    }
  }

  private async getCollection() {
    const collection = this.database?.collection('hotel', 'inventory');
    if(collection !== undefined) 
    {
      return collection;
    }
  }

  /**
     * Sets up the replicator for the database.
     *
     * This function configures the replicator to synchronize the local database with a remote
     * Couchbase Sync Gateway or Capella App Service endpoint. It retrieves the collections
     * from the database and sets up the replicator with the specified target URL and authentication.
     *
     * The replicator is configured to run continuously and accept only self-signed certificates.
     *
     * @private
     * @throws Will throw an error if no collections are found to set the replicator to.
     */
  private async setupReplicator() {
    const collection = await this.getCollection();
    const targetUrl = new URLEndpoint('');
    const auth = new BasicAuthenticator('demo@example.com', 'P@ssw0rd12');

    const config = new ReplicatorConfiguration(targetUrl);
    if (collection) {
        config.addCollection(collection);
    } else {
        throw new Error('Collection not found');
    }
    config.setAuthenticator(auth);
    config.setContinuous(true);
    config.setAcceptOnlySelfSignedCerts(false);
    this.replicator = await Replicator.create(config);    
  }  
}