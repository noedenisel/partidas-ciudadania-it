# Archivo familiar
Control de partidas de ciudadanía. Aplicación React con API Node 24 y SQLite. Cada cuenta conserva sus carpetas, personas y partidas. La pestaña Diferencias vuelve a calcular la revisión con los datos guardados.

## Ejecutar
Instalá Node 24 y ejecutá `npm ci`, `npm run build` y `APP_ORIGIN=http://localhost:3001 npm start`. Abrí http://localhost:3001. Para desarrollo con recarga, ejecutá `npm run server` y `npm run dev` en dos terminales y abrí http://localhost:5173. Pruebas con `npm test`.

## Publicación y cuentas
El servidor sirve dist y /api bajo el mismo origen. Requiere un proceso Node persistente y un volumen privado escribible para DATABASE_PATH. Configurá APP_ORIGIN con el origen HTTPS exacto y PORT con el puerto del servicio. Hacé copias de SQLite mediante su API de backup. Un despliegue estático de Vercel por sí solo no ejecuta este backend ni conserva SQLite. Para conservar el dominio anterior, se puede usar Vercel como proxy hacia el servidor persistente.

El registro con correo y contraseña funciona directamente. Para activar Google creá un cliente OAuth web y configurá GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el servidor. Registrá APP_ORIGIN/api/google/callback como URI de retorno, sustituyendo APP_ORIGIN por el origen real. Google y contraseña son identidades separadas, incluso con el mismo correo. Usá siempre el método con el que creaste la carpeta.

## Suscripciones
La cuenta inicial admite una familia. En Stripe creá tres precios recurrentes, habilitá el portal de clientes para cambiar entre ellos y cancelar, y configurá STRIPE_SECRET_KEY, STRIPE_PRICE_5, STRIPE_PRICE_10 y STRIPE_PRICE_UNLIMITED. Usá el mismo entorno de Stripe para las cuatro variables. Checkout muestra el precio y la moneda configurados por la titular. El servidor consulta las suscripciones activas o en prueba al abrir, crear o guardar carpetas. Un plan reducido da acceso a las primeras carpetas por orden de creación y conserva las demás para una futura ampliación.

## Recuperar partidas anteriores
Desde el mismo dominio y navegador de la versión anterior, ingresá a tu cuenta, creá una carpeta vacía e importá las partidas del navegador. Revisá los vínculos y guardá. La importación conserva el original local. Los vínculos sin coincidencia exacta pueden elegirse manualmente. Cada persona admite una partida de nacimiento, matrimonio y defunción, con los datos transcriptos.
