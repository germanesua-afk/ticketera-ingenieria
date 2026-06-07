# Carpeta /lib

Esta carpeta contiene **funciones y lógica de apoyo** que usa el resto de la aplicación.

## Qué suele haber aquí

- Conexiones a Supabase (`lib/supabase/`)
- Funciones de autenticación y manejo de usuarios (`auth.ts`)
- Lógica de negocio transversal (ej: cálculo de semáforos en `semaphore.ts`)
- Utilidades generales

## Diferencia con /features

- `lib/` = Funciones técnicas o de utilidad general.
- `features/` = Lógica específica de un módulo del negocio (tickets, proyectos, etc.).

Si una función empieza a crecer mucho y está muy atada a un módulo (ej: tickets), idealmente debería mudarse a `features/tickets/`.