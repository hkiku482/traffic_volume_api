import { LocationMysql } from 'src/mysql/location';

export const currentLocationHandler = async (
  location_id: string,
): Promise<string> => {
  const locationRepository = new LocationMysql();
  try {
    const location = await locationRepository.readById(location_id);
    return JSON.stringify({
      address: location.address,
    });
  } catch (error) {
    return JSON.stringify({
      error: error,
    });
  }
};
