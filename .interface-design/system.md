# Finanzas Premium: Sistema de Diseño de Interfaz

Este documento define las reglas de diseño para mantener la consistencia y el alto contraste en la aplicación de Finanzas.

## Fundamentos Visuales
- **Fondo de Pantalla (Canvas):** `gray-950` (#030712). Siempre usar un negro profundo para permitir que el cristal (glass) resalte.
- **Tipo de Diseño:** Glassmorphism dimensional con jerarquía de capas.

## Jerarquía de Superficies (Glassness)

| Nivel | Intensidad (`GlassCard`) | Uso |
| :--- | :--- | :--- |
| **Bajo** | `low` | Sub-elementos muy sutiles, estados desactivados. |
| **Medio** | `medium` | Tarjetas de listas, contenedores de secciones (ej: Historial), tarjetas de cuentas en Dashboard. |
| **Alto** | `high` | Bloques interactivos principales, Formularios (Login/Registro), Tarjeta de Balance principal. |

## Reglas de Bordes
- **Opacidad:** Nunca usar menos de `rgba(255,255,255,0.1)` (equivalente a `border-white/10`) para bordes de componentes primarios.
- **Inputs:** Deben tener un borde visible en estado de reposo para diferenciar el área de entrada.

## Tipografía
- **Títulos:** Usar `h1`, `h2`, `h3` con peso `bold`.
- **Contraste:** Texto primario siempre `white`. Texto secundario `ink-secondary`.

## Estados de Interacción
- **Focus:** Usar `brand-500` (#465fff) para anillos de enfoque o resaltado de bordes.
- **Hover/Active:** Aumentar la intensidad del `GlassCard` (ej: de `medium` a `high`) durante la interacción.
