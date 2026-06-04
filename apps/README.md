# Scripts disponibles (apps/package.json)

Este archivo describe los scripts definidos en `apps/package.json` para compilar, construir en modo desarrollo, ejecutar y empaquetar las aplicaciones.

Resumen rápido:
- `start*`: compila la app indicada en modo desarrollo y escucha cambios; genera el resultado en un directorio temporal montado por la tarea `Run To Docker` como si la app estuviera instalada.
- `bdev*`: compila la app indicada en modo desarrollo, pero sin escuchar cambios.
- `build*`: compila para distribuir en formato de instalador.
- `publish*`: compila y empaqueta un zip listo para instalar en el sistema.

Listado detallado:

- `start` — ejecuta `node . start`. No arranca la app directamente; compila la app indicada y vigila cambios en el código. El resultado se genera en un directorio temporal montado en la tarea `Run To Docker` para simular una instalación en el sistema.
- `start:desktop`, `start:login`, `start:player`, `start:apps`, `start:files`, `start:users`, `start:chat` — variantes que indican qué app se compila.

- `bdev` — ejecuta `node . build` sin modo watch. Compila la app indicada en modo desarrollo para pruebas rápidas, pero no observa cambios.
- `bdev:desktop`, `bdev:login`, `bdev:player`, `bdev:apps`, `bdev:files`, `bdev:users`, `bdev:chat` — builds en modo `dev` o incremental para cada app.
- `bdev:all` — ejecuta todas las tareas `bdev:*` en secuencia.

- `build` — ejecuta `node . build` en modo de producción. Compila para distribución en una forma que se puede considerar un instalador.
- `build:desktop`, `build:login`, `build:player`, `build:apps`, `build:files`, `build:users`, `build:chat` — builds de producción para cada app.
- `build:all` — ejecuta todos los `build:*` en secuencia.

- `publish` — ejecuta `node . publish`. Empaqueta el build de producción en un zip listo para instalar.
- `publish:desktop`, `publish:login`, `publish:player`, `publish:apps`, `publish:files`, `publish:users`, `publish:chat` — empaqueta la app específica.
- `publish:all` — ejecuta todos los `publish:*` en secuencia.

Notas útiles:

- Los comandos invocan el archivo `cli.js` (el CLI en la raíz de `apps`) con subcomandos (`start`, `build`, `publish`), por lo que el comportamiento exacto (salida, rutas de destino) lo define ese script.
- Las builds suelen generar los assets en `apps/dist` (revisar `cli.js` si necesita confirmar la ruta de salida). En el contenedor Docker se monta `apps/dist` en `/app/apps`.
- Para ejecutar los scripts desde su entorno local prefiera `pnpm` (el proyecto incluye `packageManager`), por ejemplo:

```bash
pnpm run build:all
pnpm run bdev:desktop
pnpm run publish:apps
```

- Si no usa `pnpm`, puede usar `npm run <script>` o `yarn run <script>` según su gestor.

Ejemplo rápido de desarrollo:

```bash
cd apps
pnpm install
pnpm run bdev:all   # genera builds en modo desarrollo para todas las apps
```

Ejemplo para producción:

```bash
cd apps
pnpm install --frozen-lockfile
pnpm run build:all
pnpm run publish:all
```

Si quieres, puedo añadir enlaces directos a las partes relevantes de `cli.js` o documentar la salida exacta del build examinando `cli.js`.
