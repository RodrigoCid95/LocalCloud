import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config & any = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swDest: 'app',
        sourcemap: false
      },
      dir: '../../backend/public',
      buildDir: 'js'
    },
  ],
};
