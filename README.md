# Garbitegia Ivan — Web de lavandería

Sitio estático de alta gama para **Garbitegia Ivan**, lavandería de autoservicio con dos sedes en Eibar (Gipuzkoa) y Ermua (Bizkaia). Sin frameworks, sin build y sin dependencias externas en el camino crítico.

## Cómo verlo

Desde la raíz del proyecto:

```bash
python -m http.server 4173
```

Abre `http://127.0.0.1:4173/index.html`.

> Conviene servirlo por HTTP (no abrir el HTML con doble clic): los mapas, las fuentes y el manifest se cargan por red.

## Estructura

```
index.html                  Página principal
aviso-legal.html            Aviso legal y créditos
privacidad.html             Privacidad y cookies
assets/css/style.css        Sistema de diseño y responsive
assets/js/main.js           Interacciones, estado horario, mapas, guía de carga y vídeos
assets/img/                 Logotipo, fotografías optimizadas y fotos de las sedes
assets/video/               Vídeos de fondo (Mixkit, uso libre)
assets/vendor/leaflet.*     Leaflet 1.9.4 (se carga solo al acercarse a las sedes)
assets/fonts/               Instrument Serif y Manrope, autoalojadas
assets/fotoseibar/          Originales de trabajo de Eibar (no se usan en la web)
assets/fotosermua/          Originales de trabajo de Ermua (no se usan en la web)
site.webmanifest            Manifest de aplicación web
robots.txt                  Indexación abierta
_headers                    Caché y cabeceras de seguridad para Netlify/Cloudflare Pages
```

## Diseño

- **Tipografía:** Instrument Serif (titulares, editorial) + Manrope (texto e interfaz).
- **Paleta:** verde bosque `#13251f`, papel cálido `#f8f5ee`, verde agua `#1f6f5f`, arena `#e9dfcb`.
- **Hero:** vídeo de fondo con póster propio, titular animado y estado de apertura calculado en hora de Madrid.
- **Servicios:** rejilla editorial con seis tarjetas, imágenes de ambiente y una **guía de carga interactiva** que recomienda lavadora según lo que vayas a lavar.
- **Sedes:** dos fichas con dirección, horario, teléfono, etiquetas, botón de copiar dirección, WhatsApp y **mapas Leaflet** con teselas de OpenStreetMap, marcador animado y etiqueta permanente.
- **El local:** mosaico de 18 fotografías reales con filtros por sede.
- **Opiniones:** valoración de Google y tres reseñas reales.
- **FAQ:** acordeón accesible y datos estructurados `FAQPage`.
- **Detalles:** barra de progreso de lectura, contador animado, revelados al hacer scroll, toast al copiar, menú móvil con foco atrapado, botón flotante de WhatsApp y barra de acciones fija en móvil.

No se publican tarifas ni precios: la web deriva las consultas al teléfono, WhatsApp y a las fichas de Google Maps. Se han retirado las fotografías de los paneles de programas y tarifas.

## Datos del negocio utilizados

| Dato | Eibar | Ermua |
| --- | --- | --- |
| Dirección | Urkizu Pasealekua Ibilbidea, 20600 Eibar | San Isidro Kalea, 5, bajo 3, 48260 Ermua |
| Teléfono | 672 74 17 00 | 672 74 17 00 |
| Horario | Todos los días, 8:00–22:00 | Todos los días, 8:00–22:00 |
| Último lavado | 21:00 | 21:00 |

Fuentes consultadas: ficha de Google Business Profile y directorios locales
([lavalava.es](https://lavalava.es/lavanderia-autoservicio-eibar-garbitegia-ivan2-eibar/),
[lavenderiacerca.com](https://lavenderiacerca.com/garbitegia-ivan-ermua-vizcaya/)),
además de la cartelería visible en las fotografías reales
(«Tu colada en 1 hora», «Último lavado 21:00», «Incluye detergente y suavizante»,
«Abierto 365 días», «Videovigilancia», acceso adaptado).

## Medios y licencias

- **Logotipo** (`logo-garbitegia.webp`, `logo-garbitegia-light.webp`, `favicon-*.png`): logotipo original de Garbitegia Ivan, recortado y convertido a WebP/PNG.
- **Fotografías reales de las sedes** (`eibar-*.webp`, `ermua-*.webp`, `sede-*.webp`): imágenes del negocio procedentes de fichas públicas. **Antes de publicar, confirma la cesión de derechos con el titular.** Las copias disponibles son miniaturas (195–224 px) y las dos fotos grandes de ficha (800 px); por eso la galería se ha diseñado como mosaico de piezas pequeñas. Si llegan originales en alta resolución, basta sustituir los archivos manteniendo el nombre.
- **Fotografías de ambiente** (`hero-poster-wide.webp`, `interior-machines.webp`, `drum-detail.webp`, `service-industrial.webp`, `towels-folded.webp`): [Pexels](https://www.pexels.com/license/), uso gratuito. El póster del hero es un recorte 16:9 de una foto de Pexels.
- **Eibar y Ermua** (`local-eibar.webp`, `local-ermua.webp`): Wikimedia Commons, dominio público.
- **Vídeos** (`launderette.mp4`, `spinning.mp4`): [Mixkit](https://mixkit.co/license/), uso libre.
- **Mapas:** datos © colaboradores de OpenStreetMap, ODbL. Leaflet, licencia BSD.
- **Tipografías:** Instrument Serif y Manrope, SIL Open Font License, servidas desde el propio sitio.

## Rendimiento y accesibilidad

Medición local con Chrome, caché desactivada y movimiento reducido (1440 × 900 / 390 × 844):

| Métrica | Escritorio | Móvil |
| --- | --- | --- |
| Peso inicial transferido | ~314 KB | ~314 KB |
| Peticiones iniciales | 10 | 10 |
| LCP local | ~1,2 s | ~0,9 s |
| CLS | 0,0002 | 0 |

Decisiones que explican esas cifras:

- **Leaflet (164 KB) ya no va en el `<head>`**: se inyecta al acercarse a la sección de sedes. Los mapas no se descargan en la primera pantalla.
- **El vídeo del hero no se descarga al cargar**: se muestra el póster (69 KB, antes 169 KB) y el vídeo (668 KB) se pide en tiempo de inactividad, respetando `prefers-reduced-motion` y `saveData`.
- **El vídeo del ritual** usa `preload="none"` y solo se reproduce al entrar en pantalla.
- Fuentes autoalojadas y precargadas; sin peticiones a Google Fonts.
- Imágenes en WebP con `width`/`height`, `loading="lazy"` y `decoding="async"`; póster y logotipo con `fetchpriority="high"`.
- `_headers` añade caché larga para fuentes y vendor, una semana para imágenes y revalidación para HTML. Es compatible con Netlify y Cloudflare Pages; otros hostings lo ignoran.

Accesibilidad:

- Enlace de salto, foco visible, `aria-expanded`/`aria-controls`, `aria-current` en la navegación y `aria-live` en el estado y en la guía de carga.
- Menú móvil con `role="dialog"`, foco atrapado y cierre con Escape.
- Contraste revisado y respeto a `prefers-reduced-motion`.
- **Fallback sin JavaScript:** el contenido se muestra, aparecen una navegación básica y enlaces a Google Maps en lugar de los mapas, y se ocultan los controles que no funcionarían (filtros, copiar, guía). La web es legible y navegable sin JS.

## Antes de publicar (checklist)

1. Completar los datos fiscales/registrales del titular en `aviso-legal.html`.
2. Añadir el dominio final y un `canonical` absoluto (y actualizar `og:image` si cambia la ruta).
3. Confirmar la cesión de las fotos reales; si llegan originales de mayor resolución, sustituirlas manteniendo nombres y proporciones.
4. Revisar horarios, «último lavado» y servicios con el negocio antes de cada temporada.
5. Publicar en un hosting con HTTPS (Netlify, Cloudflare Pages, Vercel o similar) y conservar `_headers` si el proveedor lo admite.
6. Revisar la política de uso de teselas de OpenStreetMap si el tráfico crece mucho; para volúmenes altos, contratar un proveedor de mapas.
7. No añadir precios ni tarifas: la web está pensada para derivar la consulta al teléfono/WhatsApp.
8. Opcional: sustituir las reseñas de Google por un widget oficial y añadir analítica sin cookies.

## Notas

- El sitio no tiene backend ni formulario: la conversión se resuelve con teléfono, WhatsApp y enlaces a Google Maps.
- Los mapas y las teselas requieren conexión; hay fallback con dirección y enlace a Google Maps.
- El vídeo del hero se sirve después de la carga; si el navegador bloquea la reproducción, se mantiene el póster.
- Al actualizar CSS o JS, cambia el parámetro `?v=` de `index.html` (y de las páginas legales para el CSS) para invalidar cachés.
- `assets/fotoseibar/` y `assets/fotosermua/` son material de trabajo y pueden excluirse del despliegue. También puede excluirse el PNG original del logotipo.
