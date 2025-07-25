import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.AI_LIFE_STORY_BUILDER_API_KEY),
        'process.env.AI_LIFE_STORY_BUILDER_API_KEY': JSON.stringify(env.AI_LIFE_STORY_BUILDER_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
