import { LocationMysql } from 'src/mysql/location';

export const locationHandler = async (): Promise<string> => {
  const locationRepository = new LocationMysql();
  return JSON.stringify(await locationRepository.readAll());
};
