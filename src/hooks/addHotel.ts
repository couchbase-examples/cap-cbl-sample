import { DatabaseService } from "../services/database.service";

/**
 * Inserts a new hotel document into the `inventory.hotel` collection.
 *
 * @param {DatabaseService} databaseService - The service instance used to interact with the database.
 * @param {Record<string, any>} hotelData - The data you want to store in the new hotel document.
 * @returns {Promise<string>} The ID of the newly inserted hotel document.
 */
export async function addHotel(
  databaseService: DatabaseService,
  hotelData: Record<string, any>
): Promise<void> {
  return await databaseService.insertHotel(hotelData);
}
