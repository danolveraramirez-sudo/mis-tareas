# Changelog

## [Sin publicar] - rama `arreglos-raptor` (commits `66e9e53` y `5bbb7c4`), 10 de octubre de 2026

Arreglos de los 13 errores de `ERRORES.md` y de 2 detalles encontrados en la segunda prueba. Probado por Tricera: **PASA**.

### Corregido
- Editar una tarea vieja ya hecha ya no le pone fecha de completado ni la cuenta en "Hechas hoy" (#1).
- Borrar una tarea o "Borrar completadas" muestra un aviso con "Deshacer" durante 5 s; el borrado real ocurre después o al cerrar la página (#2).
- Si el servidor falla, aparece un aviso rojo y el texto que escribías no se pierde (#3).
- El selector muestra "Sin categoría" completo (#4).
- Todas las fechas usan formato de México (es-MX). El campo de fecha nativo sigue el idioma del navegador (#5).
- "Más recientes" da un orden predecible también con tareas viejas (#6).
- Clic fuera guarda la edición y Escape la cancela; la edición ya no se pierde si la lista se redibuja (#7).
- La API rechaza fechas imposibles con 400; vacío o `null` quita la fecha (#8).
- La API rechaza categorías desconocidas con 400; las tareas viejas con categorías raras tienen su propio chip de filtro (#9).
- El círculo de marcar queda alineado en las tareas vencidas (#10).
- El mensaje de lista vacía cambia según el caso: búsqueda, pendientes, completadas o filtros (#11).
- Un cuerpo de más de 100 KB recibe 413 al momento; un JSON inválido recibe 400 (#12).
- Los botones de editar, borrar y marcar tienen `aria-label`, y el de marcar también `aria-pressed` (#13).
- El botón 🏷️ "Asignar categoría" y la etiqueta de categoría también tienen `aria-label` (completa el #13).
- En celular con modo oscuro, el aviso de borrado ahora es claro con texto oscuro, cabe en una línea y ya no tapa "Borrar completadas".

### Cambiado
- "Borrar completadas" ahora manda un `DELETE` por cada tarea en lugar de uno solo.
- El aviso de "Borrar completadas" ahora es más corto: "N completadas borradas".

### Nota
- Mientras dura el aviso de borrado (5 s), tapa en parte la etiqueta 🏷️ de la última tarea. No impide usar la app.

## Rediseño - rama `rediseno-gratis` (commit `d94d2f7`)

Rediseño hecho con modelos gratis de OpenCode: categorías, prioridad, fecha límite, orden, filtros, búsqueda, estadísticas, modo oscuro y vista de celular.
