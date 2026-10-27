# Organizador de Materias para Aula Virtual ESPOL

Extensión de navegador para el **Tablero de Canvas** (`aulavirtual.espol.edu.ec`) que ayuda a organizar mejor las tareas pendientes.

## Funciones

- **Panel "Mis materias"** a la derecha del tablero, con todos tus cursos activos.
- **Filtro por materia:** haz clic en una o varias materias para ver solo sus tareas, con sus fechas de entrega.
- **Colores personalizados:** elige un color para cada materia y tus tareas se pintan con él.
- **Ocultar materias:** con el ícono del ojo, las materias que no usas o están obsoletas pasan a la sección "Ocultos" y dejan de molestar en el tablero.
- **Contador de pendientes:** muestra "Hay X tareas pendientes" según lo que se ve en pantalla.
- **Carga automática de más semanas:** al abrir el tablero, la extensión pulsa "Cargar más" varias veces para mostrar más adelante.

## Importante

- **Solo se muestra lo que el docente ya subió.** Si un profesor no ha publicado una tarea en el aula virtual, no aparecerá, y por lo tanto no se contará.
- **El contador no distingue tareas de otras cosas.** También cuenta anuncios y otros ítems con casillero sin marcar, porque se consideran pendientes aunque no sean tareas en sentido estricto.
- **Posible lag:** la extensión ejecuta "Cargar más" **5 veces** al abrir el tablero. Si tienes muchas tareas, la página puede ponerse lenta. Puedes bajar el valor de `MAX_CLICKS` en `content.js`.

## Instalación (Opera / Opera GX / Chrome / Edge)

1. Descarga o clona este repositorio.
2. Abre `opera://extensions` (o `chrome://extensions`).
3. Activa el **Modo desarrollador**.
4. Pulsa **Cargar descomprimida** y elige la carpeta del proyecto (la que contiene `manifest.json`).
5. Abre `https://aulavirtual.espol.edu.ec` y recarga con **Ctrl + F5**.

## Archivos

| Archivo | Descripción |
|---|---|
| `manifest.json` | Configuración de la extensión |
| `content.js` | Lógica: panel, filtros, colores, contador |
| `styles.css` | Estilos del panel |

## Créditos

Idea y uso: **Arihuz Icaza**.
Puedes usarla y modificarla libremente; si la compartes, por favor da créditos.
