# LocalCloud

LocalCloud es una colección de aplicaciones y servicios para un sistema local autoalojado. El repositorio incluye componentes del servidor en Go (carpeta `system`) y frontends en TypeScript/React (carpeta `apps`).

## Requisitos
- Docker instalado en la máquina (versión reciente).
- Opcional: Node.js + pnpm (si necesita construir o modificar los frontends locales).

## Construcción y despliegue (Docker)
El proyecto incluye tareas de VS Code en `.vscode/tasks.json` para construir y ejecutar la imagen Docker.

1. Construir la imagen Docker:

```bash
docker build -t localcloud .
```

2. Ejecutar el contenedor (ejecuta el servidor y monta carpetas locales):

```bash
docker run -it --rm \
  -v "$(pwd)/system:/app" \
  -v "$(pwd)/apps/dist:/app/apps" \
  -v "$(pwd)/temp/apps:/usr/share/local-cloud/apps" \
  -v "$(pwd)/temp/system:/usr/share/local-cloud/system-apps" \
  -p 80:80 -p 443:443 \
  localcloud
```

Estas dos acciones corresponden a las tareas definidas en [`.vscode/tasks.json`](.vscode/tasks.json).

### Usar las tareas de VS Code
Desde el panel de `Terminal > Run Task...` puede ejecutar directamente las tareas:
- `Build Dockerfile` — ejecuta `docker build -t localcloud .`
- `Run To Docker` — ejecuta el comando `docker run` con los volúmenes y puertos definidos.

## Notas de desarrollo
- Si modifica los frontends (carpeta `apps/`), instale dependencias y construya los assets antes de ejecutar el contenedor. Por ejemplo:

```bash
cd apps
pnpm install
pnpm build
# o use npm/yarn según el `package.json`
```

- Asegúrese de que las rutas `temp/apps` y `temp/system` existen y tienen permisos adecuados, ya que se montan en el contenedor.

## Solución de problemas
- Si el contenedor no arranca, revise los logs en la salida del contenedor.
- Verifique que los puertos 80/443 estén libres o ajustelos en la línea de `docker run`.

## Contribuciones
Si desea contribuir, abra issues o pull requests con cambios claros y pasos para reproducir.

---
Archivo de tareas: [`.vscode/tasks.json`](.vscode/tasks.json)
