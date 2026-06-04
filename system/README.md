
# LocalCloud - Instrucciones rápidas (system)

Al iniciar el contenedor, estos scripts y comandos son útiles para preparar y ejecutar el sistema:

- Compilar la CLI y el servidor:

```
./build.sh
```

	Este script compila los binarios `bin/lc` (CLI) y `bin/lc-server` (servidor).

- Crear un usuario inicial y asignar apps instaladas:

```
./prepare.sh
```

	`prepare.sh` crea un usuario por defecto y asigna las aplicaciones comunes usando la CLI compilada.

- Compilar las apps (desde el directorio `apps`):

```
cd ../apps
npm run bdev:all
```

	`npm run bdev:all` genera builds en modo desarrollo para todas las apps y escribe los resultados en el directorio temporal que se monta en la tarea `Run To Docker`, simulando que las apps están instaladas en el sistema.

- Iniciar el servidor de desarrollo directamente con Go:

```
go run ./cmd/server/main.go
```

	Alternativamente, una vez compilado, puede ejecutar el binario del servidor `./bin/lc-server`.

Estos pasos permiten compilar, preparar y poner en marcha el sistema dentro del contenedor o en el entorno de desarrollo local.

