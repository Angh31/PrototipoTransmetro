# Manual de Usuario — Sistema de Control Integral Transmetro

> Municipalidad de Guatemala · 2026 · **@author Anghel CC**

Esta guía explica cómo usar el sistema según el rol de cada persona.

---

## 1. Ingreso al sistema

1. Abrí la dirección del sistema en el navegador.
2. La aplicación abre en la **vista pública de pasajeros**. Para entrar al sistema interno, pulsá **"Acceso al Sistema"** (esquina superior derecha).
3. Ingresá tu **usuario** y **contraseña** y pulsá **Ingresar al sistema**.

> La sesión permanece activa aunque cierres la pestaña, hasta que pulses **Cerrar sesión** o pasen 8 horas. Tras 5 intentos fallidos la cuenta se bloquea 15 minutos.

### Usuarios de prueba

> Las credenciales se entregan por separado al evaluador (no se publican en el repositorio).

| Rol | Qué puede hacer |
|-----|-----------------|
| Administrador | Todo el sistema, incluyendo Usuarios y Auditoría |
| Supervisor | Flota, pilotos, líneas, operación y reportes |
| Operador | Dashboard, operación, estaciones, alertas, cámaras y tarjeta |
| Piloto | Mi Operación: consulta de turnos, líneas asignadas y registro de recorridos |
| Guardia | Accesos: monitoreo de accesos por estación, guardias asignados y registro de novedades |

Los nombres de usuario usan la convención `nombre.apellido` (sin tildes).

---

## 2. Menú según el rol

El menú lateral muestra solo los módulos permitidos para tu rol:

| Módulo | Admin | Supervisor | Operador | Piloto | Guardia |
|--------|:----:|:----------:|:--------:|:------:|:-------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Operación | ✓ | ✓ | ✓ | — | — |
| Mi Operación (Piloto) | — | — | — | ✓ | — |
| Accesos (Guardia) | — | — | — | — | ✓ |
| Líneas | ✓ | ✓ | — | — | — |
| Estaciones | ✓ | ✓ | ✓ | — | ✓ |
| Flota | ✓ | ✓ | — | — | — |
| Pilotos | ✓ | ✓ | — | — | — |
| Alertas | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cámaras | ✓ | ✓ | ✓ | — | ✓ |
| Tarjeta | ✓ | ✓ | ✓ | — | — |
| Reportes | ✓ | ✓ | — | — | — |
| Usuarios | ✓ | — | — | — | — |
| Auditoría | ✓ | — | — | — | — |

---

## 3. Módulos

### Dashboard
Panel de inicio con los indicadores clave (líneas, estaciones, buses en servicio, alertas activas), un **mapa de la red** (botón "Mostrar mapa") y el gráfico de **flota por línea**. Las alertas aparecen en vivo.

### Operación (Centro de Mando)
Simula la llegada de un bus a una estación: elegís bus, estación, pasajeros del bus y ocupación de la estación, y el sistema responde con la decisión (despacho normal, urgente, espera o bloqueo) aplicando las reglas críticas. Arriba se ven los indicadores de impacto ambiental de la flota eléctrica.

### Líneas, Estaciones, Flota, Pilotos
Listados con detalle. Según permisos, podés **crear** (botón "+ Nuevo…") y **editar** (botón "Editar" en el panel de detalle). Reglas aplicadas automáticamente: un bus siempre necesita parqueo; los buses BYD solo van en parqueos con carga eléctrica; la flota por línea va de 1 a 2 buses por estación.

### Alertas
Centro de alertas en tiempo real. Pestañas **Activas** e **Historial completo**. Pulsá **"Resolver acción"** para cerrar una alerta.

### Cámaras (Centro de Monitoreo)
Tablero de videovigilancia con un recuadro por estación, indicador "En vivo", hora y conteo de personas. En el prototipo es una demostración visual; en producción mostraría la transmisión real de cada cámara.

### Tarjeta Ciudadana
Detección de pasajes en tiempo real: muestra las validaciones que van ocurriendo (tarjeta, estación, hora), la recaudación estimada y el ranking de estaciones con más validaciones. Estos ingresos alimentan el cálculo de ocupación de las estaciones.

### Mi Operación (Piloto)
Vista dedicada al piloto: turnos del día (mañana/tarde), líneas en servicio y consulta del recorrido completo de cada línea con sus paradas. Botón **"Registrar recorrido"** para dejar constancia del viaje realizado.

### Accesos (Guardia)
Vista dedicada al personal de seguridad: turnos del día, estaciones a cargo y, al elegir una estación, el detalle de sus accesos con los **guardias asignados por turno**. Botón **"Registrar novedad"** para dejar constancia de incidencias.

### Reportes
Indicadores por rango de fecha (**Hoy / Semana / Mes**): total de alertas, por día, por tipo y estaciones con más alertas, más la flota activa por línea. Botones **Exportar CSV** e **Imprimir / PDF**.

### Usuarios y Accesos (solo admin)
Crear cuentas, cambiar rol, **activar/desactivar** acceso (con confirmación), **restablecer contraseña** y **desbloquear** cuentas. El sistema impide quedarse sin ningún administrador activo.

### Auditoría (solo admin)
Bitácora de acciones del sistema: inicios de sesión, bloqueos, creación/edición de usuarios, resolución de alertas, etc.

---

## 4. Mi cuenta

En la parte inferior del menú, pulsá tu **nombre de usuario** para abrir el menú con:

- **Cambiar contraseña** — cambiar tu propia clave (pide la actual).
- **Configuración** — ver los parámetros del sistema.
- **Cerrar sesión**.

---

## 5. Vista pública de pasajeros

Accesible **sin iniciar sesión** (botón "Ver información pública" en el login, o la dirección base del sistema):

- Indicadores de la red, líneas disponibles con su recorrido y **avisos al público**.
- **Mapa interactivo** (botón "Ver mapa") con capas de mapa oscuro, OpenStreetMap y satélite.
- **Selector de idioma Español / Inglés**.

---

*Sistema de Control Integral Transmetro · Municipalidad de Guatemala · 2026 · @author Anghel CC*
