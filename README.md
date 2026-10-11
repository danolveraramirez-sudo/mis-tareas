# Mis tareas

Aplicación web básica de lista de tareas. Backend en Node.js (sin dependencias) y una sola página HTML.
Las tareas se guardan en el servidor, en el archivo `tareas.json` dentro de `DATA_DIR`.

## Cómo ejecutarla

Requisito: Node.js 18 o superior.

```bash
node server.js                         # escucha en http://0.0.0.0:8000
PORT=9000 node server.js               # usar otro puerto
DATA_DIR=/ruta/datos node server.js    # guardar tareas.json en otra carpeta
```

En segundo plano (sigue corriendo al cerrar la terminal):

```bash
nohup node server.js > server.log 2>&1 &
```

Para detenerla: `pkill -f "node server.js"` (o `kill <PID>`).

Abre http://localhost:8000 en el navegador.

## Funciones

- Agregar, editar (Enter o clic fuera guarda, Escape cancela), marcar y borrar tareas
- Categorías (Trabajo, Personal, Casa, Compras, Salud, Estudio) con filtro
- Prioridad (alta, media, baja) y fecha límite, con aviso de vencidas
- Ordenar, filtrar por estado y buscar (con o sin acentos)
- Estadísticas, modo claro y oscuro (se guarda) y vista para celular
- Borrar una tarea o todas las completadas, con "Deshacer" durante 5 segundos
- Aviso visible cuando el servidor no responde
- Carga tareas del formato viejo `{id, texto, hecha}`

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/tareas` | Lista las tareas |
| POST   | `/api/tareas` | Crea una tarea: `{"texto", "categoria", "prioridad", "vence"}` (solo `texto` es obligatorio) |
| PATCH  | `/api/tareas/:id` | Cambia cualquiera de `texto`, `hecha`, `categoria`, `prioridad`, `vence` |
| DELETE | `/api/tareas/:id` | Elimina una tarea |
| DELETE | `/api/tareas?hechas=1` | Borra las completadas |

Validaciones: el texto no puede ir vacío (se corta a 200 caracteres), `vence` debe ser una fecha real `AAAA-MM-DD` (o vacío/`null` para quitarla) y `categoria` debe ser una de la lista. Si no, responde **400**. Un JSON inválido también da 400 y un cuerpo de más de 100 KB da **413**.

## Archivos

- `server.js` – servidor
- `public/index.html` – interfaz
- `tareas.json` – datos (se crea solo)
