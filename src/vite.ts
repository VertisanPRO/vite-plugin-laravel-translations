import { determineLaravelVersion, getLangDir } from './laravel';
import { buildTranslations } from './loader';
import { TranslationConfiguration } from '../types';
import type { HmrContext } from 'vite';

export default async function laravelTranslations(pluginConfiguration: TranslationConfiguration = {}) {
  const defaultConfigurations: TranslationConfiguration = {
    namespace: false,
    includeJson: false,
    absoluteLanguageDirectory: null
  };

  const laravelVersion = await determineLaravelVersion();
  const absPathForLangDir = pluginConfiguration.absoluteLanguageDirectory || getLangDir(laravelVersion);

  return {
    name: 'laravelTranslations',
    async config() {
      pluginConfiguration = Object.assign({}, defaultConfigurations, pluginConfiguration);

      const translations = await buildTranslations(absPathForLangDir, pluginConfiguration);
      return {
        define: {
          LARAVEL_TRANSLATIONS: translations
        }
      };
    },
    handleHotUpdate(context: HmrContext) {
      const fileMatchRegex = pluginConfiguration.includeJson ? /lang\/.*\.(?:php|json)$/ : /lang\/.*\.php$/;

      if (fileMatchRegex.test(context.file)) {
        context.server.restart();
      }
    }
  };
}
