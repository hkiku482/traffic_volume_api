import { LocationMysql } from 'src/repositories/mysql/location';

export const locationHandler = async (): Promise<string> => {
  const locationRepository = new LocationMysql();
  return JSON.stringify(await locationRepository.readAll());
};
