# Entrega técnica para revisión
Base recuperable: commit publicado 56620bcc1a69bb0635fd8772f981bedf1fdeaae0.
## Datos y arquitectura
React y Vite sirven los formularios. El Worker autentica y opera sobre el objeto folders/<id de cuenta>. El almacén anterior era una lista; el nuevo documento contiene schema=2, families, grants y uses. El registro de consumos conserva identificador de operación, identificador interno y fecha cuando se conoce. No conserva nombres ni contenido del expediente eliminado. El control de versión del objeto hace atómica la escritura conjunta de documentos y consumos. Un conflicto exige reintentar. La misma clave de creación se conserva al reintentar desde el formulario.
## Migración y recuperación
Una lectura antigua se interpreta sin escribir. El primer cambio confirmado convierte el documento. Cada expediente preexistente cuenta como un consumo. La versión de referencia carecía de eliminación. No se inventan fechas históricas. La asignación inicial se toma de la suscripción existente. No hay renovaciones automáticas ni activación de cobros. Esta rama no se aplicó a cuentas reales.
Antes de una migración real: detener escrituras, realizar copia versionada del almacén bajo control del titular y verificar restauración en un entorno aislado. Comparar identificadores, cantidades y contenido. Para volver atrás antes de reabrir escrituras, restaurar la copia anterior junto con el código anterior. Después de admitir escrituras nuevas, una reversión requiere conciliación; no sobreescribir los registros posteriores.
## Seguridad y pendientes
Sesiones mediante cookie HttpOnly y Secure, autorización por cuenta, comprobación de origen y revisión por expediente. Se retiró el token de sessionStorage y de las respuestas JSON. Falta probar la devolución real de Google en staging, el comportamiento de cookies en navegadores integrados y el aislamiento sobre infraestructura real. La vinculación verificada, recuperación por correo, verificación de dirección, limitación durable de intentos y validación exhaustiva de partidas siguen pendientes. El secreto de OAuth expuesto se debe rotar antes de promover cambios. No se han consultado ni copiado datos de clientes. El respaldo corresponde al código, no a la base de datos real.
## Verificación
npm ci, npm test, npm run build y node worker/build.mjs. Seis pruebas con datos sintéticos contra la API y un adaptador con escrituras condicionales. Revisar la vista aislada con una creación, archivo, restauración y eliminación. La vista usa el mismo motor en memoria y reinicia al recargar.
## Seguimiento
- [x] Base versionada, rama independiente, arquitectura y procedimiento de recuperación.
- [x] Cupos persistentes independientes de la lista, migración compatible, pruebas de duplicados, concurrencia, eliminación, archivo, restauración y aislamiento.
- [ ] Ensayo sobre almacenamiento real de staging, restauración completa, OAuth real, recuperación y vinculación de cuentas.
- [ ] Fases 2 a 5 de la directiva pendientes. La fase 6 queda para backlog.
