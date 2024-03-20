declare global {
  namespace Paths {
    interface Config {
      /**
       * Rutas de almacén del sistema.
       */
      system: {
        /**
         * Ruta raíz del almacén sistema.
         */
        path: string
        /**
         * Rutas del almacén de apps del sistema.
         */
        apps: {
          /**
           * Ruta raíz del almacén de las apps del sistema.
           */
          path: string
          /**
           * Rutas del almacén de una app del sistema.
           */
          app: {
            /**
             * Ruta raíz del almacén de una app del sistema.
             */
            path: string
            /**
             * Ruta raíz de los recursos públicos de una app del sistema.
             */
            public: string
            /**
             * Rutas del almacén de bases de datos de una app del sistema.
             */
            databases: {
              /**
               * Ruta raíz del almacén de bases de datos de una app del sistema.
               */
              path: string
              /**
               * Ruta del archivo de bases de datos de una app del sistema.
               */
              database: string
            }
          }
        }
        /**
         * Ruta del archivo de base de datos del sistema.
         */
        database: string
      }
      /**
       * Rutas de almacén de usuarios.
       */
      users: {
        /**
         * Ruta raíz del almacén de usuarios.
         */
        path: string
        /**
         * Rutas de almacén de un usuario.
         */
        user: {
          /**
           * Ruta raíz del almacén de usuarios.
           */
          path: string
        }
      }
    }
    interface Class {
      readonly system: string
      readonly database: string
      readonly apps: string
      readonly users: string
      getApp(packagename: string): string
      getAppPublic(packagename: string): string
      getAppDatabases(packagename: string): string
      getAppDatabase(packagename: string, name: string): string
      getUser(uuid: string): string
    }
  }
}

export { }