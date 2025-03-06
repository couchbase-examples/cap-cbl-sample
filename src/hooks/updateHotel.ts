import { DatabaseService } from "../services/database.service";

/**
 * Updates an existing hotel document by ID in the `inventory.hotel` collection.
 *
 * @param {DatabaseService} databaseService - The service instance used to interact with the database.
 * @param {string} docId - The ID of the hotel document to update.
 * @param {Record<string, any>} updatedData - The fields/values to update in the document.
 * @returns {Promise<string>} The ID of the updated hotel document.
 */
export async function updateHotel(
  databaseService: DatabaseService,
  docId: string,
  updatedData: any
): Promise<void>{
  return await databaseService.updateHotel(docId, updatedData);
}