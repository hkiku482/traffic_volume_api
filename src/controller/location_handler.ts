import { LocationMysql } from 'src/mysql/location';

export const locationHandler = async (): Promise<string> => {
  const locationRepository = new LocationMysql();
  try {
    return JSON.stringify(await locationRepository.readAll());
  } catch (error) {
    return JSON.stringify({
      error: error,
    });
  }
};
