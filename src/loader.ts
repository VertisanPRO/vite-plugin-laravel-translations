import { fromString } from 'php-array-reader';
import { globSync } from 'glob';
import path from 'node:path';
import { TranslationConfiguration } from '../types/index.js';
import { mergeDeep } from './utils/mergeDeep.js';
import { readFileSync } from 'node:fs';

const globPattern = (shouldIncludeJson: boolean): string => (shouldIncludeJson ? '**/*.{json,php}' : '**/*.php');

const configureNamespaceIfNeeded = (pathSplit: string[], namespace: string): string[] => {
  if (namespace && namespace.length > 0) {
    pathSplit.splice(1, 0, namespace);
  }
  return pathSplit;
};

const translationContentByFileExtension = async (fileExtension: string, file: string): Promise<string> => {
  if (fileExtension === '.php') {
    return fromString(readFileSync(file).toString());
  }

  const fullPath = `${process.cwd()}/${file}`;
  return await import(fullPath);
};

const generateNestedObjectStructure = (pathSplit: string[], all: any): object =>
  pathSplit.reverse().reduce((all, item) => ({ [item]: all }), all);

export const buildTranslations = async (
  absLangPath: string,
  pluginConfiguration: TranslationConfiguration
): Promise<object> => {
  const langDir = pluginConfiguration.absoluteLanguageDirectory || absLangPath;
  const globRegex = globPattern(pluginConfiguration.includeJson || false);
  const files = globSync(path.join(langDir, globRegex), { windowsPathsNoEscape: true });
  const initialTranslations = Promise.resolve({});

  const translations = await files.reduce(async (accumulator, file) => {
    const { sep: pathSeparator } = path;

    const translations = await accumulator;
    const fileRaw = file.replace(langDir + pathSeparator, '');
    const fileExtension = path.extname(fileRaw);
    const pathSplit = fileRaw.replace(fileExtension, '').split(pathSeparator);

    const translationContent = await translationContentByFileExtension(fileExtension, file);
    const namespacePath = configureNamespaceIfNeeded(pathSplit, pluginConfiguration.namespace || '');
    const currentTranslationStructure = generateNestedObjectStructure(namespacePath, translationContent);

    return mergeDeep(translations, currentTranslationStructure);
  }, initialTranslations);

  return translations;
};
