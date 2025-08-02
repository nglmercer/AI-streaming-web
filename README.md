# Proyecto Cliente WebSocket con Live2D

Este proyecto es una aplicación web interactiva que muestra un personaje de Live2D y se conecta a un servidor WebSocket para recibir actualizaciones y comandos en tiempo real. La interfaz está construida con Astro y Svelte, utilizando Tailwind CSS para el estilo.

## Características Principales

- **Visualización de Live2D:** Muestra un modelo de Live2D en un lienzo (`<canvas>`).
- **Interactividad:** El modelo puede reaccionar a eventos con expresiones y movimientos.
- **Conexión WebSocket:** Utiliza un gestor de conexiones (`WsConnectionManager`) para comunicarse con un servidor WebSocket.
- **Cola de Audio:** Gestiona y reproduce audio recibido a través del WebSocket.
- **Subtítulos:** Muestra subtítulos para los mensajes de texto recibidos.
- **Componentes Modulares:** La aplicación está dividida en componentes reutilizables de Astro para una mejor organización.

## ¿Cómo funciona?

La aplicación se inicializa en `Live2DCanvas.astro`. Este componente se encarga de:

1.  **Configurar el WebSocket:** Crea una conexión a un servidor WebSocket (por defecto, `ws://127.0.0.1:12393/client-ws`).
2.  **Manejar Mensajes:** Escucha los mensajes entrantes del servidor. Dependiendo del tipo de mensaje (`audio`, `text-input`, `full-text`), realiza diferentes acciones:
    *   **Audio:** Encola y reproduce el audio recibido. También puede disparar animaciones (expresiones o movimientos) en el modelo de Live2D.
    *   **Texto:** Muestra el texto como subtítulos en la pantalla.
3.  **Gestionar el Estado de la Conexión:** Muestra el estado actual de la conexión WebSocket (conectado, desconectado, reconectando) en un indicador visual.

## Tecnologías Utilizadas

- **Frontend:**
  - [Astro](https://astro.build/)
  - [Svelte](https://svelte.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
- **Live2D y Gráficos:**
  - [PixiJS](https://pixijs.com/)
  - `pixi-live2d-display-lipsyncpatch`
- **Comunicación:**
  - `websocket-ts`
- **Gestión de Audio:**
  - `@ricky0123/vad-web`

## Cómo Empezar

1.  **Instalar dependencias:**

    ```bash
    npm install
    ```

2.  **Iniciar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

3.  Abre tu navegador en la dirección que te indique la consola (normalmente `http://localhost:4321`).

## Estructura del Proyecto

- `src/components`: Contiene los componentes de Astro, como `Live2DCanvas.astro`, que es el componente principal.
- `src/lib`: Incluye la lógica de la aplicación, como el gestor de WebSocket (`WsConnectionManager.ts`) y la gestión de audio.
- `src/pages`: Las páginas de la aplicación Astro.
- `public/libs`: Librerías de terceros como `live2d.min.js` y `pixi.min.js`.
