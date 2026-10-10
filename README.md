# Mis tareas

Aplicación web básica de lista de tareas. Backend en Node.js (sin dependencias) y una sola página HTML.
Las tareas se guardan en el servidor, en el archivo `tareas.json`.

## Cómo ejecutarla

Requisito: Node.js 18 o superior.

```bash
cd /workspace/todo-app
node server.js                 # escucha en http://0.0.0.0:8000
PORT=9000 node server.js       # usar otro puerto
```

En segundo plano (sigue corriendo al cerrar la terminal):

```bash
nohup node server.js > server.log 2>&1 &
```

Para detenerla: `pkill -f "node server.js"` (o `kill <PID>`).

Abre http://localhost:8000 en el navegador.

## Funciones

- Agregar tareas
- Marcar / desmarcar como hechas
- Eliminar tareas y borrar todas las completadas

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET    | `/api/tareas` | Lista las tareas |
| POST   | `/api/tareas` | Crea una tarea: `{"texto": "..."}` |
| PATCH  | `/api/tareas/:id` | Cambia el estado (o `{"hecha": true/false}`) |
| DELETE | `/api/tareas/:id` | Elimina una tarea |
| DELETE | `/api/tareas?hechas=1` | Borra las completadas |

## Archivos

- `server.js` – servidor
- `public/index.html` – interfaz
- `tareas.json` – datos (se crea solo)
