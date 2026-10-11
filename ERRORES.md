# Errores encontrados: rediseño de Mis tareas

Rama `rediseno-gratis`, commit `d94d2f7`. Pruebas hechas por Tricera el 10 de octubre de 2026.

**Veredicto: PASA.** No hay errores de gravedad alta. Hay 3 de gravedad media y 10 de gravedad baja.

| # | Error | Gravedad |
|---|-------|----------|
| 1 | Editar una tarea vieja ya hecha la cuenta como "hecha hoy" | Media |
| 2 | Borrar no pide confirmación ni se puede deshacer | Media |
| 3 | No hay aviso cuando falla el servidor | Media |
| 4 | "Sin categoría" se corta en el selector de escritorio | Baja |
| 5 | El formato de fecha cambia según el navegador | Baja |
| 6 | Las tareas sin fecha de creación quedan al final en "Más recientes" | Baja |
| 7 | La edición se cierra sin guardar y sin avisar | Baja |
| 8 | La API acepta fechas imposibles | Baja |
| 9 | La API acepta categorías que no existen | Baja |
| 10 | El círculo de marcar se desalinea en las tareas vencidas | Baja |
| 11 | Mensaje equivocado en "Completadas" cuando está vacío | Baja |
| 12 | El servidor se queda colgado con peticiones muy grandes | Baja |
| 13 | Los botones no se leen bien con lector de pantalla | Baja |

Los errores 8, 9, 12 y 13 salieron de revisar el código y no se probaron con la app corriendo.

> **Actualización:** los 13 están arreglados en la rama `arreglos-raptor` (commit `66e9e53`), y Tricera dio **PASA**. Los 2 detalles bajos que salieron en la segunda prueba se arreglaron en `5bbb7c4` (ver `CHANGELOG.md`).

---

## Gravedad media

### 1. Editar una tarea vieja ya hecha la cuenta como "hecha hoy"
**Pasos:**
1. Ten una tarea guardada en el formato viejo, ya marcada como hecha (`{id, texto, hecha: true}`) y sin el campo `completada`.
2. Edita su texto y presiona Enter.

**Qué pasa:** la app le pone a `completada` la fecha y hora de este momento, y la tarea aparece en la estadística "Hechas hoy".
**Qué debería pasar:** la tarea debería conservar su estado y no sumarse a "Hechas hoy", porque se terminó en otro momento.
**Sugerencia:** al guardar una edición, solo cambiar `completada` cuando cambie `hecha`. Si una tarea vieja está hecha y no tiene fecha, dejarla sin fecha y no contarla en "Hechas hoy".

### 2. Borrar no pide confirmación ni se puede deshacer
**Pasos:**
1. Haz clic en el botón de borrar de una tarea, o en "Borrar completadas".

**Qué pasa:** se borra de inmediato, sin preguntar ni dar opción de deshacer. Un clic equivocado hace perder datos.
**Qué debería pasar:** debería pedir confirmación o mostrar un aviso con "Deshacer" durante unos segundos.
**Sugerencia:** agregar un aviso temporal con botón "Deshacer" (es lo más cómodo), o al menos un `confirm()` en "Borrar completadas".

### 3. No hay aviso cuando falla el servidor
**Pasos:**
1. Abre la app y luego apaga el servidor.
2. Intenta agregar, editar o marcar una tarea.

**Qué pasa:** no se ve ningún cambio ni mensaje. El error solo aparece en la consola del navegador.
**Qué debería pasar:** la app debería avisar que no se pudo guardar y que hay que intentar de nuevo.
**Sugerencia:** revisar la respuesta de cada petición (`fetch`) y, si falla, mostrar un aviso visible, por ejemplo "No se pudo guardar, revisa tu conexión".

---

## Gravedad baja

### 4. "Sin categoría" se corta en el selector de escritorio
**Pasos:** abre la app en una pantalla de 1280px de ancho y mira el selector de categoría.
**Qué pasa:** se lee "Sin categorí…".
**Qué debería pasar:** debería leerse "Sin categoría" completo.
**Sugerencia:** darle al selector un ancho mínimo mayor, o usar un texto más corto como "Ninguna".

### 5. El formato de fecha cambia según el navegador
**Pasos:** abre la app en Chrome configurado en inglés y compara el encabezado, las etiquetas de fecha y el campo de fecha límite.
**Qué pasa:** el encabezado usa formato de México (es-MX), las etiquetas de fecha usan formato de España (es-ES) y el campo de fecha muestra mm/dd/yyyy.
**Qué debería pasar:** todas las fechas deberían verse en el mismo formato.
**Sugerencia:** usar `es-MX` en todos lados. El campo de fecha nativo siempre sigue el idioma del navegador, así que, si importa, mostrar al lado la fecha ya formateada.

### 6. Las tareas sin fecha de creación quedan al final en "Más recientes"
**Pasos:** ten tareas viejas (sin el campo `creada`) junto con tareas nuevas y ordena por "Más recientes".
**Qué pasa:** las tareas viejas siempre aparecen al final.
**Qué debería pasar:** es aceptable, pero conviene que el orden sea predecible.
**Sugerencia:** al cargar una tarea vieja, ponerle como `creada` una fecha aproximada (por ejemplo, derivada de su `id` si es una marca de tiempo) o dejarlo documentado como comportamiento esperado.

### 7. La edición se cierra sin guardar y sin avisar
**Pasos:** empieza a editar una tarea y, sin presionar Enter, escribe en la búsqueda o marca otra tarea.
**Qué pasa:** la edición se cierra y el cambio se pierde, sin aviso. Además, hacer clic fuera no cierra la edición.
**Qué debería pasar:** salir de la edición (clic fuera o usar otro control) debería guardar el cambio o, al menos, ser consistente.
**Sugerencia:** guardar la edición cuando el campo pierde el foco (`blur`) y dejar Escape solo para cancelar.

### 8. La API acepta fechas imposibles
**Pasos:** envía `PATCH` a una tarea con `{"vence": "2026-02-31"}`.
**Qué pasa:** se guarda y se muestra como "3 mar".
**Qué debería pasar:** el servidor debería rechazarla con un error 400. Desde la interfaz no pasa, solo por la API.
**Sugerencia:** en `server.js`, validar que la fecha exista de verdad (por ejemplo, convertirla y comprobar que el día, el mes y el año no cambien).

### 9. La API acepta categorías que no existen
**Pasos:** envía una tarea con una categoría que no está en la lista, por ejemplo "Escuela".
**Qué pasa:** se muestra como una etiqueta gris pero no aparece en los filtros.
**Qué debería pasar:** el servidor debería aceptar solo las categorías conocidas, o la interfaz debería mostrar también las nuevas en los filtros.
**Sugerencia:** validar la categoría contra la lista en `server.js` y responder 400 si no es válida.

### 10. El círculo de marcar se desalinea en las tareas vencidas
**Pasos:** ten una tarea vencida junto a otras que no lo están.
**Qué pasa:** el borde rojo de la fila vencida empuja el círculo 3px a la derecha, así que no queda alineado con los demás.
**Qué debería pasar:** todos los círculos deberían quedar en la misma línea.
**Sugerencia:** darles a todas las filas un borde izquierdo del mismo ancho (transparente en las normales) o dibujar el rojo con `box-shadow inset`.

### 11. Mensaje equivocado en "Completadas" cuando está vacío
**Pasos:** sin ninguna tarea completada, elige el filtro "Completadas".
**Qué pasa:** dice "Sin resultados, prueba otra búsqueda", aunque no se buscó nada.
**Qué debería pasar:** debería decir algo como "Todavía no tienes tareas completadas".
**Sugerencia:** elegir el mensaje según si hay texto en la búsqueda o solo hay un filtro activo.

### 12. El servidor se queda colgado con peticiones muy grandes
**Pasos:** envía al servidor una petición de más de 100 KB.
**Qué pasa:** la petición nunca recibe respuesta.
**Qué debería pasar:** debería responder de inmediato con un error 413 ("demasiado grande").
**Sugerencia:** en `server.js`, cuando el cuerpo pase el límite, responder 413 y cerrar la conexión en vez de solo dejar de leer.

### 13. Los botones no se leen bien con lector de pantalla
**Pasos:** usa un lector de pantalla sobre los botones de editar, borrar y marcar.
**Qué pasa:** solo tienen `title`, así que los lectores de pantalla no los describen bien.
**Qué debería pasar:** cada botón debería anunciar qué hace y a qué tarea, por ejemplo "Borrar: comprar pan".
**Sugerencia:** agregar `aria-label` a cada botón con la acción y el texto de la tarea.
