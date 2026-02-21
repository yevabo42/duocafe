# DuoCafé - Documento de Definición del Proyecto

## 1. Vision General

**DuoCafé** es una plataforma de gamificacion de proposito general para el **ecosistema cafetero colombiano** que conecta a tres actores fundamentales — **consumidores, cafeterias y productores** — a traves de educacion, recompensas y mecanicas de juego inspiradas en Duolingo.

No es una herramienta para una sola marca. Es la **infraestructura digital gamificada** donde el cafe de especialidad colombiano cobra vida: el consumidor aprende y es recompensado, la cafeteria/marca fideliza y vende, y el productor cuenta su historia y accede al mercado de forma directa.

**La Rosa** es la marca co-fundadora y primera marca en la plataforma, con beneficios y posicionamiento especial como pionera del ecosistema.

**Propuesta de valor:** Conectamos la cadena del cafe colombiano a traves del juego, la educacion y la economia real.

---

## 2. El Problema que Resuelve

### Para el sector cafetero colombiano:
- Colombia es el 3er productor mundial de cafe, pero la cadena de valor tiene demasiados intermediarios
- Los productores pequenos no tienen acceso directo a consumidores finales
- Las marcas de especialidad luchan por diferenciarse y fidelizar
- Los consumidores no conocen la historia detras de su taza
- No existe una plataforma digital que conecte los 3 eslabones de la cadena con engagement real

### DuoCafe resuelve esto creando un ecosistema donde:
- El **consumidor** tiene razones para volver todos los dias (no solo cuando necesita cafe)
- La **cafeteria/marca** tiene herramientas de fidelizacion y un canal de venta digital
- El **productor** tiene visibilidad, trazabilidad y acceso directo a mercado

---

## 3. Los Tres Actores

### 3.1 Consumidor (Caficultor Digital)

**Quien es:** Amante del cafe, curioso, comprador recurrente o potencial.

**Que hace en DuoCafe:**
- Aprende sobre cafe a traves de lecciones gamificadas (estilo Duolingo)
- Gana Granos (XP) y Cerezas (moneda virtual) por cada actividad
- Compite en ligas semanales con otros consumidores
- Descubre y compra de multiples marcas y productores
- Rastrea el origen de su cafe (trazabilidad del grano a la taza)
- Canjea recompensas por productos, descuentos y experiencias
- Mantiene rachas diarias, desbloquea logros y sube de nivel
- Refiere amigos y gana recompensas

**Que obtiene:**
- Educacion real sobre cafe de especialidad
- Recompensas tangibles (descuentos, productos, experiencias)
- Conexion directa con quien produce y tuesta su cafe
- Estatus y reconocimiento (niveles, badges, ligas)
- Comunidad de amantes del cafe

### 3.2 Cafeteria / Marca (Aliado Comercial)

**Quien es:** Tostadores, marcas de cafe, tiendas de especialidad. La Rosa es la primera.

**Que hace en DuoCafe:**
- Registra su marca y perfil en la plataforma
- Publica su catalogo de productos
- Crea contenido exclusivo para sus seguidores (lecciones de marca, retos tematicos)
- Configura su propio programa de recompensas (canjeos, descuentos, experiencias)
- Gestiona compras y pedidos
- Conecta con productores para contar la historia de origen de sus cafes
- Lanza campanas y eventos especiales dentro del ecosistema
- Accede a metricas de engagement, ventas y comportamiento

**Que obtiene:**
- Canal de fidelizacion gamificado listo para usar (sin desarrollar el propio)
- Acceso a una comunidad activa de amantes del cafe
- Herramientas de marketing (retos, eventos, contenido patrocinado)
- Datos de comportamiento y preferencias de sus clientes
- Conexion directa con productores para storytelling de origen
- Visibilidad frente a consumidores que aun no los conocen

### 3.3 Productor (Origen)

**Quien es:** Caficultores, fincas, cooperativas, asociaciones de productores colombianos.

**Que hace en DuoCafe:**
- Registra su finca/cooperativa con perfil detallado (region, altitud, variedades, procesos)
- Publica sus lotes disponibles con informacion de trazabilidad
- Cuenta su historia (fotos, videos, recorridos virtuales de finca)
- Se conecta con cafeterias/marcas que compran su cafe
- Participa en rutas educativas como protagonista (ej: "Conoce al productor detras de tu taza")
- Recibe visibilidad directa ante el consumidor final

**Que obtiene:**
- Visibilidad de su trabajo ante el mercado final
- Conexion directa con tostadores y marcas (reduccion de intermediarios)
- Mejor precio al vender directo o con menos eslabones
- Dignificacion de su labor (el consumidor conoce su nombre y su historia)
- Trazabilidad verificable de su producto
- Acceso a datos de que buscan los consumidores

---

## 4. Como Interactuan los 3 Actores (Economia Real)

```
                    ┌─────────────────────┐
                    │     DUOCAFE          │
                    │  Plataforma Central  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼───────┐  ┌──────▼───────┐  ┌───────▼───────┐
    │  PRODUCTOR    │  │  CAFETERIA   │  │  CONSUMIDOR   │
    │               │  │  / MARCA     │  │               │
    │ Finca/Coop    │  │              │  │ Caficultor    │
    │ Lotes         │──▶ Compra grano │  │ Digital       │
    │ Historia      │  │ Tuesta/Vende │──▶ Aprende       │
    │ Trazabilidad  │  │ Fideliza     │  │ Compra        │
    │               │  │              │  │ Compite       │
    └───────┬───────┘  └──────┬───────┘  └───────┬───────┘
            │                 │                   │
            │    ┌────────────┼───────────┐       │
            │    │   FLUJO DE VALOR       │       │
            │    ├────────────────────────┤       │
            └────▶ Productor → Marca:     │       │
                 │  Grano verde/tostado   │       │
                 │  Historia + trazabilid.│       │
                 ├────────────────────────┤       │
                 │ Marca → Consumidor:    │◀──────┘
                 │  Cafe procesado        │
                 │  Educacion + contenido │
                 │  Recompensas           │
                 ├────────────────────────┤
                 │ Consumidor → Productor:│
                 │  Compra consciente     │
                 │  Reconocimiento        │
                 │  Retroalimentacion     │
                 └────────────────────────┘
```

### Ciclo Virtuoso de la Economia Real:

1. **Productor** cultiva y procesa cafe de calidad → registra lote en DuoCafe con trazabilidad
2. **Cafeteria/Marca** compra el grano, lo tuesta → lo publica en DuoCafe vinculado al productor
3. **Consumidor** descubre el producto, aprende sobre su origen → compra informado
4. **Consumidor** gana recompensas, sube de nivel, desbloquea contenido exclusivo del productor
5. **Productor** recibe visibilidad, mejor precio, retroalimentacion directa
6. **Marca** fideliza al consumidor, vende mas, se diferencia por transparencia
7. **El ciclo se repite** con mas actores, mas lotes, mas historias

---

## 5. Mecanicas de Gamificacion (Modelo Duolingo Adaptado)

### 5.1 Sistema de Progresion

#### Moneda Virtual: "Cerezas"
- Nombre universal de la plataforma (cereza de cafe, no atada a ninguna marca)
- Se ganan completando lecciones, rachas, compras y referidos
- Se canjean por beneficios de CUALQUIER marca/cafeteria dentro del ecosistema
- Cada marca puede ofrecer su propio catalogo de canje

#### Puntos de Experiencia: "Granos" (XP)
- Determinan el nivel del usuario y su posicion en ligas
- Se obtienen por TODA actividad:
  - Completar lecciones de cafe
  - Registrar compras (de cualquier marca del ecosistema)
  - Completar retos diarios
  - Referir amigos
  - Dejar resenas de productos
  - Visitar perfiles de productores
  - Completar rutas de trazabilidad

#### Niveles de Caficultor
| Nivel | Nombre | Granos requeridos |
|---|---|---|
| 1 | Curioso | 0 |
| 2 | Catador Novato | 500 |
| 3 | Barista en Casa | 2,000 |
| 4 | Conocedor | 5,000 |
| 5 | Sommelier del Cafe | 12,000 |
| 6 | Maestro Tostador | 25,000 |
| 7 | Caficultor Experto | 50,000 |
| 8 | Leyenda del Cafe | 100,000 |

### 5.2 Rachas (Streaks)

- **Racha diaria:** Al menos UNA actividad diaria para mantener la racha
  - Completar una micro-leccion (2-3 min)
  - Registrar su cafe del dia
  - Completar un reto rapido
  - Explorar un perfil de productor
- **Escudo de racha:** Se puede "congelar" la racha 1 vez por semana (cuesta Cerezas)
- **Hitos de racha:** Recompensas especiales en racha de 7, 30, 60, 100, 365 dias
- **Racha de compra:** Racha mensual separada — comprar al menos 1 producto del ecosistema por mes

### 5.3 Ligas y Tabla de Posiciones

Sistema de ligas semanales:

| Liga | Nombre Tematico |
|---|---|
| Liga 1 | Semilla |
| Liga 2 | Grano Verde |
| Liga 3 | Pergamino |
| Liga 4 | Tostado |
| Liga 5 | Espresso |
| Liga 6 | Origen Dorado |

- Grupos de ~30 usuarios por liga
- Los top 10 ascienden, los bottom 5 descienden
- Recompensas semanales para top 3 de cada grupo
- Liga especial "Origen Dorado" con beneficios exclusivos

### 5.4 Rutas de Aprendizaje (Lecciones)

Estructurado como los "arboles de habilidades" de Duolingo, con dos tipos de rutas:

#### Rutas Universales (contenido de la plataforma):

**Ruta 1: Origenes del Cafe**
- Leccion 1.1: De donde viene el cafe?
- Leccion 1.2: Regiones cafeteras de Colombia (Huila, Nariño, Antioquia, Eje Cafetero...)
- Leccion 1.3: Regiones cafeteras del mundo
- Leccion 1.4: Variedades de cafe (Arabica, Caturra, Castillo, Geisha...)
- Leccion 1.5: Que es el cafe de especialidad?
- Leccion 1.6: El terroir del cafe colombiano
- **Quiz de nivel**

**Ruta 2: Del Grano a la Taza**
- Leccion 2.1: Cosecha y recoleccion selectiva
- Leccion 2.2: Metodos de procesamiento (lavado, natural, honey, anaerobico)
- Leccion 2.3: Secado y beneficio
- Leccion 2.4: El arte del tostado
- Leccion 2.5: Perfiles de tueste
- Leccion 2.6: Molienda y su importancia
- **Quiz de nivel**

**Ruta 3: Metodos de Preparacion**
- Leccion 3.1: Espresso y sus variantes
- Leccion 3.2: Pour over / V60 / Kalita
- Leccion 3.3: Prensa francesa
- Leccion 3.4: Chemex
- Leccion 3.5: Cold brew y metodos frios
- Leccion 3.6: AeroPress
- Leccion 3.7: Moka / Cafetera italiana
- **Quiz de nivel**

**Ruta 4: Cata y Degustacion**
- Leccion 4.1: La rueda de sabores SCA
- Leccion 4.2: Acidez, cuerpo, dulzura y balance
- Leccion 4.3: Como hacer una cata en casa (protocolo SCA simplificado)
- Leccion 4.4: Puntaje y clasificacion de cafe de especialidad
- Leccion 4.5: Maridaje con cafe
- **Quiz de nivel**

**Ruta 5: Cafe y Sostenibilidad**
- Leccion 5.1: Comercio justo y precio justo
- Leccion 5.2: Cafe organico y certificaciones
- Leccion 5.3: Impacto ambiental y practicas sostenibles
- Leccion 5.4: El rol del caficultor en la economia colombiana
- Leccion 5.5: Como tu compra impacta al productor
- **Quiz de nivel**

#### Rutas de Marca (contenido creado por cada cafeteria/marca):

Cada marca puede crear su propia ruta educativa dentro de la plataforma:
- **Ejemplo - Ruta La Rosa:** Historia de La Rosa, fincas aliadas, proceso de seleccion, perfiles de cata de sus productos
- **Ejemplo - Ruta Cafe XYZ:** Su filosofia, su metodo de tueste, sus origenes exclusivos
- Completar rutas de marca desbloquea badges y recompensas especificas de esa marca
- Las marcas administran su contenido desde el panel de aliado comercial

#### Rutas de Origen (contenido desde los productores):

Los productores pueden contribuir contenido a rutas especiales:
- **"Conoce a tu Caficultor":** Recorridos virtuales por fincas
- **"Diario de Cosecha":** Seguimiento en tiempo real de un lote desde la cereza hasta el empaque
- **"Voces del Origen":** Historias en primera persona de productores

**Formato de lecciones** (estilo Duolingo):
- Micro-contenido: 2-3 minutos por leccion
- Preguntas interactivas: seleccion multiple, verdadero/falso, emparejar, ordenar
- Imagenes, fotos reales de fincas y procesos
- Feedback inmediato con explicaciones
- Barra de progreso visual
- Corazones/vidas: 5 vidas, se pierde 1 por error (se recuperan con tiempo o Cerezas)

### 5.5 Retos y Misiones

#### Reto Diario (plataforma)
- 1 reto nuevo cada dia
- Ejemplos:
  - "Prepara tu cafe con un metodo diferente al habitual y cuentanos"
  - "Cual departamento colombiano produce mas cafe?"
  - "Visita el perfil de un productor que no conozcas"

#### Retos de Marca (creados por cafeterias/marcas)
- Cada marca puede crear retos patrocinados
- Ejemplo La Rosa: "Prueba nuestro nuevo lote del Huila y dejanos tu nota de cata" → 50 Cerezas + badge
- Ejemplo Cafe XYZ: "Prepara un V60 con nuestro cafe y comparte foto" → 30 Cerezas

#### Misiones Semanales
- "Completa 5 lecciones esta semana" → 50 Cerezas
- "Compra de 2 marcas diferentes" → 100 Cerezas
- "Conoce a 3 productores" → 75 Cerezas

#### Eventos Especiales (temporadas)
- **Cosecha Dorada** (oct-dic, temporada principal de cosecha colombiana): retos tematicos, XP x2
- **Semana del Barista:** Retos de preparacion con premios reales
- **Dia del Caficultor Colombiano (27 de junio):** Evento especial, contenido productor
- **Black Friday Cafetero:** Ofertas exclusivas para usuarios de alto nivel
- Las marcas pueden crear sus propios eventos dentro del calendario

### 5.6 Logros y Badges

#### Badges Universales (plataforma):
| Badge | Condicion |
|---|---|
| Primera Taza | Completar registro |
| Racha de Fuego (7) | 7 dias consecutivos |
| Racha Imparable (30) | 30 dias consecutivos |
| Racha Legendaria (100) | 100 dias consecutivos |
| Explorador de Origenes | Completar Ruta 1 |
| Barista Certificado | Completar Ruta 3 |
| Catador Oficial | Completar Ruta 4 |
| Amigo del Planeta | Completar Ruta 5 |
| Sabio del Cafe | Completar todas las rutas universales |
| Explorador de Marcas | Comprar de 5 marcas diferentes |
| Amigo del Caficultor | Visitar 10 perfiles de productores |
| Embajador DuoCafe | Referir 5 amigos activos |
| Leyenda del Cafe | Alcanzar nivel 8 |

#### Badges de Marca (creados por cada marca):
- Cada marca puede definir sus propios badges
- Ejemplo La Rosa: "Rosa de Oro" — comprar todos los origenes de La Rosa
- Los badges de marca aparecen con el branding de la marca en el perfil del usuario

#### Badges de Origen (productores):
- "Amigo de Finca [nombre]" — visitar perfil + comprar cafe de ese productor
- "Explorador del Huila" — completar ruta de productores del Huila
- Coleccionables por region cafetera colombiana

### 5.7 Mascota de Plataforma: "Cafeto"

- Personaje guia de la experiencia (como Duo el buho en Duolingo)
- Un arbol de cafe animado/estilizado con personalidad amigable
- Nombre "Cafeto" (arbol del cafe) — universal, no atado a ninguna marca
- Aparece en lecciones, notificaciones y celebraciones
- **Notificaciones con personalidad:**
  - "Tu racha esta en peligro! Ya tomaste tu cafe hoy?"
  - "Cafeto te extrana... vuelve a aprender sobre cafe"
  - "Alguien en tu liga te supero! Lo vas a permitir?"
  - "Nuevo lote de [marca] disponible. Tu lo ves primero por ser nivel 5!"
  - "Hoy es Dia del Caficultor! Conoce a los heroes detras de tu taza"

---

## 6. Trazabilidad: Del Grano a la Taza

Una funcionalidad diferenciadora que conecta a los 3 actores:

### 6.1 Pasaporte del Cafe

Cada producto en la plataforma puede tener un **"Pasaporte"** que el consumidor desbloquea al comprar:

```
┌─────────────────────────────────────┐
│       PASAPORTE DEL CAFE            │
│                                     │
│  Producto: La Rosa - Huila Especial │
│  ──────────────────────────────     │
│                                     │
│  ORIGEN                             │
│  Finca: El Paraiso                  │
│  Productor: Don Carlos Meneses      │
│  Region: Huila, Colombia            │
│  Altitud: 1,750 msnm               │
│  Variedad: Caturra                  │
│                                     │
│  PROCESO                            │
│  Recoleccion: Selectiva manual      │
│  Procesamiento: Lavado              │
│  Secado: Camas africanas, 18 dias   │
│                                     │
│  TUESTE                             │
│  Tostador: La Rosa                  │
│  Perfil: Medio                      │
│  Fecha tueste: 2026-02-10           │
│                                     │
│  CATA                               │
│  Puntaje SCA: 86                    │
│  Notas: Caramelo, citricos, floral  │
│  Acidez: Media-alta                 │
│  Cuerpo: Medio                      │
│                                     │
│  [Ver finca] [Conocer productor]    │
│  [Receta recomendada] [Dejar cata]  │
└─────────────────────────────────────┘
```

### 6.2 Impacto en la Economia Real

Cada compra muestra al consumidor:
- Que % del precio llega al productor
- Como su compra impacta a la comunidad cafetera
- Cuantos caficultores ha apoyado desde que usa DuoCafe
- Su "huella cafetera" personal (regiones, productores, variedades exploradas)

---

## 7. Sistema de Recompensas Multi-Marca

### 7.1 Catalogo de Canje Universal (Cerezas → Beneficios)

| Cerezas | Recompensa |
|---|---|
| 50 | Receta exclusiva de bebida |
| 100 | Contenido premium desbloqueado (leccion especial) |
| 200 | Escudo de racha extra |
| 500 | Descuento canjeable en cualquier marca del ecosistema |

### 7.2 Catalogos de Canje por Marca

Cada marca configura su propio catalogo:

**Ejemplo La Rosa:**
| Cerezas | Recompensa La Rosa |
|---|---|
| 100 | 10% descuento |
| 200 | Envio gratis |
| 350 | 25% en producto selecto |
| 500 | Muestra gratis de nuevo lote |
| 1,000 | Pack exclusivo "Catador La Rosa" |
| 2,500 | Experiencia de cata virtual con el tostador |

### 7.3 Integracion con Canal de Venta

Modelo flexible que se adapta al canal de cada marca:

**Nivel 1 - Link externo (MVP):**
- Catalogo in-app con boton "Lo quiero" → abre WhatsApp/Instagram/web de la marca
- La marca confirma la compra y entrega codigo al consumidor
- Consumidor ingresa codigo en DuoCafe → se acreditan recompensas
- Admin de marca confirma desde panel

**Nivel 2 - Pedido in-app:**
- El consumidor hace el pedido directamente en DuoCafe
- La marca recibe notificacion y procesa
- Pago externo (transferencia, Nequi, Daviplata) o pasarela integrada

**Nivel 3 - E-commerce completo (futuro):**
- Carrito, pasarela de pago, tracking de envio, todo dentro de DuoCafe

### 7.4 Motor de Referidos

- Cada usuario tiene un **codigo de referido unico**
- Al compartirlo: Quien invita recibe 50 Cerezas + el invitado recibe 25 Cerezas al registrarse
- **Bonus por conversion:** Si el referido hace su primera compra, ambos reciben 100 Cerezas
- Tabla de referidos: "Embajadores DuoCafe"
- Materiales para compartir: imagenes, stories templates, links personalizados

---

## 8. Experiencia de Usuario por Actor

### 8.1 Consumidor - Onboarding
1. Pantalla de bienvenida con Cafeto
2. "Que tanto sabes de cafe?" → Quiz rapido de 3 preguntas (asigna nivel)
3. Seleccion de meta diaria (Casual: 5 min / Regular: 10 min / Intenso: 15 min)
4. "Que te interesa?" → Seleccionar marcas/regiones favoritas
5. Elegir primer ruta de aprendizaje
6. Completar primera leccion (enganche inmediato)
7. Crear cuenta (despues de experimentar valor)

### 8.2 Consumidor - Sesion Diaria
1. Abrir app → Ver racha, reto del dia, posicion en liga
2. Completar reto diario (+Granos, mantener racha)
3. Avanzar en leccion actual (1-2 lecciones)
4. Revisar tabla de posiciones
5. Opcional: explorar catalogo, descubrir productores, canjear Cerezas

### 8.3 Consumidor - Flujo de Compra
1. Explora catalogo (puede filtrar por marca, region, proceso, puntaje)
2. Ve el Pasaporte del Cafe (origen, productor, notas de cata)
3. Toca "Lo quiero" → contacto con la marca
4. Completa compra
5. Ingresa codigo en DuoCafe
6. Se acreditan Granos + Cerezas + se desbloquea contenido del producto

### 8.4 Cafeteria/Marca - Panel de Aliado
1. Dashboard: metricas de engagement, ventas, seguidores
2. Gestion de catalogo de productos
3. Creacion de contenido (lecciones de marca, retos)
4. Configuracion de recompensas y canjeos
5. Gestion de pedidos y confirmacion de compras
6. Vinculacion con productores/origenes
7. Campanas y eventos especiales
8. Metricas y reportes

### 8.5 Productor - Panel de Origen
1. Perfil de finca (fotos, ubicacion, historia, variedades)
2. Registro de lotes con datos de trazabilidad
3. Conexion con marcas que usan su cafe
4. Contenido multimedia (fotos de cosecha, proceso, vida en finca)
5. Metricas: cuantos consumidores conocen su finca, visitas al perfil
6. Mensajes de reconocimiento de consumidores

---

## 9. Modelo de Negocio

### 9.1 Fuentes de Ingreso

| Fuente | Descripcion | Quién paga |
|---|---|---|
| **Suscripcion Aliado (SaaS)** | Plan mensual para cafeterias/marcas por usar la plataforma | Cafeterias/Marcas |
| **Comision por venta** | % sobre ventas generadas a traves de DuoCafe (solo cuando aplique e-commerce) | Cafeterias/Marcas |
| **Contenido patrocinado** | Retos de marca, lecciones destacadas, posicionamiento preferente | Cafeterias/Marcas |
| **Plan Premium consumidor** | Plan "DuoCafe Plus" — sin anuncios, vidas ilimitadas, contenido exclusivo | Consumidores |

### 9.2 Planes para Aliados Comerciales (Cafeterias/Marcas)

| Plan | Precio | Incluye |
|---|---|---|
| **Semilla (Gratis)** | $0 | Perfil basico, catalogo (5 productos), 1 reto/mes, metricas basicas |
| **Cosecha** | $X/mes | Catalogo ilimitado, retos ilimitados, 1 ruta de marca, metricas avanzadas, soporte |
| **Origen Premium** | $Y/mes | Todo Cosecha + posicion destacada, eventos exclusivos, API de integracion, soporte prioritario |
| **Fundador (La Rosa)** | Especial | Todos los beneficios Premium + co-branding + participacion en decisiones de producto |

### 9.3 Productores

- **Siempre gratis** para productores (es fundamental para el ecosistema)
- La plataforma se sostiene con el valor que generan cafeterias/marcas y consumidores premium
- Productores son el activo mas valioso — su contenido atrae consumidores y marcas

### 9.4 Plan Premium Consumidor: "DuoCafe Plus"

| Beneficio | Gratis | Plus |
|---|---|---|
| Lecciones universales | 1 ruta | Todas |
| Vidas | 5 (se regeneran) | Ilimitadas |
| Racha | Escudo 1x/semana | Escudo 3x/semana |
| Contenido productor | Basico | Completo (recorridos, videos) |
| Ligas | Todas | Todas + stats detalladas |
| Cerezas bonus | - | x1.5 en toda actividad |

---

## 10. Arquitectura Tecnica (Alto Nivel)

### 10.1 Stack Propuesto

| Componente | Tecnologia |
|---|---|
| App Movil | React Native / Flutter (cross-platform iOS + Android) |
| Web App (PWA) | Next.js / React |
| Backend / API | Node.js + NestJS (multi-tenant) |
| Base de Datos | PostgreSQL (multi-tenant) + Redis (cache, rachas, ligas) |
| Autenticacion | Firebase Auth / Auth0 |
| Notificaciones Push | Firebase Cloud Messaging |
| Almacenamiento multimedia | AWS S3 / Cloudflare R2 |
| Panel Admin Plataforma | Dashboard web (React) |
| Panel Aliado Comercial | Dashboard web (React) — acceso por rol |
| Panel Productor | Dashboard web simplificado / App |
| Hosting | AWS / Vercel / Railway |

### 10.2 Arquitectura Multi-Tenant

```
DuoCafe Platform (Multi-tenant)
│
├── Core Platform (DuoCafe)
│   ├── Motor de Gamificacion (XP, niveles, rachas, ligas, badges)
│   ├── Motor de Contenido (lecciones, quizzes, rutas)
│   ├── Motor de Recompensas (Cerezas, canjeos)
│   ├── Motor de Trazabilidad (pasaportes, cadena de origen)
│   ├── Motor de Notificaciones (push, in-app, email)
│   └── Motor de Referidos
│
├── Modulo de Consumidores
│   ├── Registro / Login (email, Google, Apple)
│   ├── Perfil gamificado (nivel, badges, estadisticas)
│   ├── Feed de actividad
│   ├── Explorador de marcas y productores
│   └── Cartera de Cerezas y canjeos
│
├── Modulo de Aliados Comerciales (Cafeterias/Marcas)
│   ├── Registro y perfil de marca
│   ├── Gestion de catalogo (productos, precios, fotos)
│   ├── Creador de contenido (lecciones, retos)
│   ├── Configurador de recompensas
│   ├── Gestion de pedidos/compras
│   ├── Vinculacion con productores
│   ├── Campanas y eventos
│   └── Dashboard analitico
│
├── Modulo de Productores
│   ├── Registro y perfil de finca
│   ├── Registro de lotes y trazabilidad
│   ├── Galeria multimedia
│   ├── Conexiones con marcas
│   └── Metricas de visibilidad
│
├── Modulo de Administracion (DuoCafe)
│   ├── Dashboard global
│   ├── Gestion de contenido universal
│   ├── Moderacion
│   ├── Gestion de planes y suscripciones
│   ├── Configuracion de eventos/temporadas
│   └── Reportes y analitica
│
└── APIs e Integraciones
    ├── API REST / GraphQL
    ├── Webhooks para integraciones externas
    ├── Integracion WhatsApp Business API
    ├── Integracion pasarelas de pago (futuro)
    └── API publica para aliados
```

---

## 11. Metricas Clave (KPIs)

### Plataforma General
| Metrica | Descripcion | Meta inicial |
|---|---|---|
| DAU / MAU | Usuarios activos diarios / mensuales | Ratio > 40% |
| Retencion D7 | Usuarios que vuelven al dia 7 | > 50% |
| Retencion D30 | Usuarios que vuelven al dia 30 | > 30% |
| Racha promedio | Dias promedio de racha activa | > 5 dias |
| Lecciones/semana | Promedio por usuario activo | > 3 |

### Economia
| Metrica | Descripcion | Meta inicial |
|---|---|---|
| Tasa de conversion | Usuarios con al menos 1 compra | > 15% |
| Frecuencia de compra | Compras/usuario activo/mes | > 1.2 |
| GMV | Volumen bruto de ventas en la plataforma | Crecimiento mes a mes |
| Marcas activas | Marcas con al menos 1 venta/mes | > 80% de registradas |
| Productores visibles | Con perfil completo y al menos 1 marca vinculada | Crecimiento mes a mes |

### Viralidad
| Metrica | Descripcion | Meta inicial |
|---|---|---|
| Coeficiente viral | Referidos que se registran por usuario | > 0.5 |
| Referidos efectivos | % de invitaciones → registro | > 20% |
| NPS | Net Promoter Score | > 50 |

---

## 12. Fases de Desarrollo (Roadmap)

### Fase 1 - MVP
**Foco: Validar la propuesta con consumidores + La Rosa como primera marca**
- Registro y autenticacion de consumidores
- Perfil con nivel, Granos y Cerezas
- 1 ruta de aprendizaje completa (Ruta 1: Origenes)
- Sistema de rachas basico
- Reto diario
- Perfil de La Rosa como primera marca
- Catalogo de productos La Rosa con link a WhatsApp
- Registro de compras por codigo
- Catalogo de canje basico La Rosa
- Notificaciones push basicas (Cafeto)
- Panel admin basico (DuoCafe + La Rosa)
- PWA como plataforma inicial
- Perfil basico de 2-3 productores aliados de La Rosa

### Fase 2 - Engagement + Multi-marca
**Foco: Profundizar gamificacion y abrir a mas marcas**
- Rutas 2 y 3 de aprendizaje
- Sistema de ligas completo
- Misiones semanales
- Sistema de badges/logros completo
- Sistema de referidos
- Panel de Aliado Comercial para onboarding de nuevas marcas
- Capacidad para que marcas creen retos y contenido
- App movil (React Native / Flutter)
- Metricas avanzadas para marcas

### Fase 3 - Productores + Trazabilidad
**Foco: Activar el pilar de productores y la trazabilidad**
- Panel de Productor completo
- Pasaportes del Cafe (trazabilidad)
- Rutas de Origen (contenido de productores)
- Rutas 4 y 5 de aprendizaje
- Eventos especiales / temporadas
- Contenido social (compartir logros)
- Vinculacion productores ↔ marcas funcional

### Fase 4 - Escala
**Foco: Monetizacion, e-commerce, comunidad**
- Planes de suscripcion para aliados comerciales
- DuoCafe Plus para consumidores
- E-commerce integrado (pedido + pago in-app)
- Comunidad (foro, grupos de cata)
- API publica para integraciones
- Expansion a mas regiones/paises cafeteros

---

## 13. Posicionamiento de La Rosa como Co-fundadora

| Beneficio | Detalle |
|---|---|
| Co-branding | "DuoCafe, creado con La Rosa" en comunicacion |
| Posicion fundadora permanente | Badge especial, seccion destacada |
| Acceso a todos los features | Sin restriccion de plan, acceso anticipado a nuevas funciones |
| Participacion en roadmap | Voz en decisiones de producto y priorizacion |
| Contenido destacado | Leccion de marca y retos siempre visibles |
| Datos del ecosistema | Acceso a insights agregados (anonimizados) del ecosistema |
| Primer productor vinculado | Narrativa de "la primera historia de origen en DuoCafe" |

---

## 14. Diferenciadores Competitivos

| Programas de lealtad tradicionales | DuoCafe |
|---|---|
| Una sola marca | Ecosistema multi-marca |
| Solo acumular puntos comprando | Ganar puntos aprendiendo, jugando Y comprando |
| Sin educacion | Convertirte en experto en cafe |
| Sin conexion con el origen | Trazabilidad y conexion directa con el productor |
| Sin comunidad | Ligas, competencia, comunidad cafetera |
| Recompensas genericas | Recompensas experienciales y multi-marca |
| No impulsa economia real | Conecta los 3 eslabones de la cadena del cafe |
| Estatico | Contenido nuevo constante (retos, temporadas, lecciones) |

---

## 15. Branding de la Plataforma

- **Nombre:** DuoCafe (plataforma) — universal, no atada a una marca
- **Co-branding:** "DuoCafe, creado con La Rosa"
- **Mascota:** Cafeto (arbol de cafe animado) — universal
- **Moneda:** Cerezas (cereza de cafe) — universal
- **XP:** Granos — universal
- **Tagline:** "Conectamos tu taza con su origen"
- **Tagline alt:** "Aprende, juega, impacta el cafe colombiano"

---

*Documento creado: 14 de febrero de 2026*
*Proyecto: DuoCafe — Plataforma de Gamificacion para el Ecosistema Cafetero*
*Co-fundador: La Rosa — Cafe de Especialidad*
