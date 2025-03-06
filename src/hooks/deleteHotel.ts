import { DatabaseService } from "../services/database.service";

export async function deleteHotel(databaseService: DatabaseService, hotel: any, metadataId: string) {
  return await databaseService.deleteHotel(hotel, metadataId);
}
