import { Config } from '@stencil/core'

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  namespace: 'lc-js',
  outputTargets: [
    {
      type: 'dist',
      buildDir: './../../../public'
    }
  ],
  sourceMap: process.env.NODE_ENV !== 'production'
}