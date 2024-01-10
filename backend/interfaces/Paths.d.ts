export interface PathsConfigProfile {
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
export interface PathsLib {
  getSystem(): string
  getSystemApps(): string
  getSystemApp(packagename: string): string
  getSystemAppPublic(packagename: string): string
  getSystemAppAsset(packagename: string, ...src: string[]): string
  getSystemAppDatabases(packagename: string): string
  getSystemAppDatabase(packagename: string, name: string): string
  getUsers(): string
  getUser(uuid: string): string
  createSystemAppBaseStore(packagename: string): void
  createUserBaseStore(uuid: string): void
  removeSystemAppBaseStore(packagename: string): void
  removeUserBaseStore(uuid: string): void
}