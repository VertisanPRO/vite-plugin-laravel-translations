import path from 'node:path';
import { readFile } from 'node:fs/promises';

export const determineLaravelVersion = async (composerPath = 'composer.json'): Promise<number> => {
  const fileData = await readFile(composerPath, 'utf8');
  const composer = JSON.parse(fileData);
  const laravelVersionRaw = composer.require['laravel/framework'];
  const [laravelVersionString] = laravelVersionRaw.split('.');
  const laravelVersion = parseInt(laravelVersionString.replace(/\D/g, ''));

  return laravelVersion;
};

export const getLangDir = (laravelVersion = 9) => {
  return laravelVersion >= 9 ? path.resolve('lang/') : path.resolve('resources/lang');
};
