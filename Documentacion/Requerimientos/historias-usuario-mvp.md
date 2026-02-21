# DuoCafe - Historias de Usuario MVP (Fase 1)

## Convenciones

**Formato:** Como [actor], quiero [accion], para [beneficio]

**Actores:**
- **Consumidor:** Usuario final de la app (Caficultor Digital)
- **Marca (La Rosa):** Primera marca/aliado comercial en la plataforma
- **Admin:** Administrador de la plataforma DuoCafe

**Prioridad (MoSCoW):**
- **M (Must):** Indispensable para el MVP. Sin esto no se lanza.
- **S (Should):** Importante. Se incluye si el tiempo lo permite.
- **C (Could):** Deseable. Se puede diferir a siguiente iteracion.

**Estimacion (Story Points):**
- 1 = Trivial (< 4 horas)
- 2 = Pequena (4-8 horas)
- 3 = Mediana (1-2 dias)
- 5 = Grande (3-5 dias)
- 8 = Muy grande (1+ semana, considerar partir)

---

## Epica 1: Autenticacion y Registro de Consumidor

### HU-1.1: Registro con email y contrasena
**Como** consumidor, **quiero** crear una cuenta con mi email y contrasena, **para** acceder a la plataforma DuoCafe.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- El usuario puede ingresar nombre, email y contrasena
- El email debe ser unico en el sistema
- La contrasena debe tener minimo 8 caracteres
- Se envia email de verificacion
- El usuario no puede acceder a funciones protegidas sin verificar email
- Se muestra mensaje de error claro si el email ya esta registrado
- Se almacena la fecha de registro

### HU-1.2: Login con email y contrasena
**Como** consumidor, **quiero** iniciar sesion con mi email y contrasena, **para** acceder a mi cuenta y progreso.

**Prioridad:** M | **Puntos:** 2

**Criterios de aceptacion:**
- El usuario puede ingresar email y contrasena
- Si las credenciales son correctas, se inicia sesion y redirige al home
- Si son incorrectas, se muestra mensaje de error generico (seguridad)
- La sesion se mantiene activa (token JWT con refresh)
- Existe opcion "Olvidé mi contrasena"

### HU-1.3: Recuperacion de contrasena
**Como** consumidor, **quiero** recuperar mi contrasena si la olvido, **para** no perder acceso a mi cuenta y progreso.

**Prioridad:** M | **Puntos:** 2

**Criterios de aceptacion:**
- El usuario ingresa su email
- Recibe un enlace de restablecimiento por email (expira en 1 hora)
- Puede establecer nueva contrasena
- Se invalidan sesiones anteriores al cambiar contrasena

### HU-1.4: Login con Google
**Como** consumidor, **quiero** iniciar sesion con mi cuenta de Google, **para** registrarme mas rapido sin crear otra contrasena.

**Prioridad:** S | **Puntos:** 3

**Criterios de aceptacion:**
- Boton "Continuar con Google" visible en pantalla de login/registro
- Si es primera vez, se crea cuenta automaticamente con datos de Google (nombre, email, foto)
- Si ya existe cuenta con ese email, se vincula
- Se inicia sesion correctamente despues del flujo OAuth

### HU-1.5: Logout
**Como** consumidor, **quiero** cerrar mi sesion, **para** proteger mi cuenta en dispositivos compartidos.

**Prioridad:** M | **Puntos:** 1

**Criterios de aceptacion:**
- Opcion de cerrar sesion accesible desde el perfil/menu
- Se invalida el token de sesion
- Se redirige a la pantalla de login

---

## Epica 2: Onboarding del Consumidor

### HU-2.1: Pantalla de bienvenida
**Como** consumidor nuevo, **quiero** ver una bienvenida con Cafeto (mascota) que me explique que es DuoCafe, **para** entender la propuesta de valor antes de empezar.

**Prioridad:** M | **Puntos:** 2

**Criterios de aceptacion:**
- Se muestran 3-4 pantallas de introduccion (carousel/slides)
- Cada pantalla tiene ilustracion + texto breve explicando: aprender, ganar recompensas, descubrir origenes
- Cafeto aparece como guia
- Boton "Empezar" visible en todo momento para saltar
- Solo se muestra la primera vez

### HU-2.2: Quiz de nivel inicial
**Como** consumidor nuevo, **quiero** responder un quiz rapido sobre cafe, **para** que la plataforma conozca mi nivel y me asigne contenido adecuado.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- 3 preguntas de seleccion multiple sobre conocimiento general de cafe
- Segun las respuestas, se asigna nivel inicial (1: Curioso o 2: Catador Novato)
- Se muestran los Granos (XP) ganados por completar el quiz
- Animacion de celebracion al finalizar
- Se puede omitir (se asigna nivel 1 por defecto)

### HU-2.3: Seleccion de meta diaria
**Como** consumidor nuevo, **quiero** elegir cuanto tiempo quiero dedicar al dia, **para** que la app se adapte a mi ritmo.

**Prioridad:** S | **Puntos:** 2

**Criterios de aceptacion:**
- 3 opciones: Casual (5 min), Regular (10 min), Intenso (15 min)
- Se puede cambiar despues desde configuracion
- La meta seleccionada define cuantas lecciones/retos se sugieren por dia
- Visual claro de lo que implica cada opcion

### HU-2.4: Primera leccion inmediata
**Como** consumidor nuevo, **quiero** completar mi primera leccion durante el onboarding, **para** experimentar el valor de la app antes de terminar el registro.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Despues del quiz, se lanza automaticamente la Leccion 1.1 (De donde viene el cafe?)
- La leccion es corta (2-3 minutos)
- Al completar, se muestran Granos ganados + animacion de Cafeto celebrando
- Se muestra barra de progreso de la Ruta 1
- Solo despues de esta leccion se solicita crear cuenta (si no la creo antes)

---

## Epica 3: Perfil y Progresion del Consumidor

### HU-3.1: Ver mi perfil
**Como** consumidor, **quiero** ver mi perfil con mi nivel, estadisticas y logros, **para** conocer mi progreso en DuoCafe.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se muestra: nombre, foto (o avatar por defecto), nivel actual, titulo del nivel
- Barra de progreso hacia el siguiente nivel
- Cantidad total de Granos (XP)
- Cantidad de Cerezas disponibles
- Racha actual (dias consecutivos)
- Lista de badges obtenidos
- Estadisticas: lecciones completadas, dias activo, compras realizadas
- Boton para editar perfil

### HU-3.2: Editar mi perfil
**Como** consumidor, **quiero** editar mi nombre y foto de perfil, **para** personalizar mi identidad en la plataforma.

**Prioridad:** S | **Puntos:** 2

**Criterios de aceptacion:**
- Puede cambiar nombre, foto de perfil
- La foto se puede tomar con camara o elegir de galeria
- Se redimensiona/comprime automaticamente
- Los cambios se reflejan inmediatamente en la app

### HU-3.3: Sistema de niveles y XP
**Como** consumidor, **quiero** ganar Granos (XP) por cada actividad y subir de nivel, **para** sentir progresion y desbloquear beneficios.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- Cada actividad otorga Granos segun tabla definida:
  - Completar leccion: 10 Granos
  - Completar quiz de ruta: 25 Granos
  - Completar reto diario: 15 Granos
  - Registrar compra: 30 Granos
  - Racha de 7 dias: 50 Granos bonus
- Los Granos acumulados determinan el nivel (segun tabla de niveles)
- Al subir de nivel: animacion especial, notificacion de Cafeto, nuevo titulo
- La barra de progreso se actualiza en tiempo real
- Los Granos NO se gastan (son acumulativos, a diferencia de las Cerezas)

### HU-3.4: Sistema de moneda virtual (Cerezas)
**Como** consumidor, **quiero** ganar Cerezas por mis actividades, **para** canjearlas por recompensas reales de las marcas.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se ganan Cerezas en paralelo a los Granos (pero en cantidad diferente)
  - Completar leccion: 5 Cerezas
  - Completar quiz de ruta: 15 Cerezas
  - Completar reto diario: 10 Cerezas
  - Registrar compra: 20 Cerezas
  - Referir amigo: 50 Cerezas
- Las Cerezas SI se gastan al canjear recompensas
- Se muestra balance actual visible en header/perfil
- Historial de Cerezas ganadas y gastadas

---

## Epica 4: Contenido Educativo (Ruta 1 - Origenes del Cafe)

### HU-4.1: Ver mapa de ruta de aprendizaje
**Como** consumidor, **quiero** ver el mapa visual de la Ruta 1 con todas las lecciones, **para** saber mi progreso y que viene despues.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se muestra la Ruta 1 como un camino visual (estilo Duolingo) con nodos por leccion
- Lecciones completadas marcadas con check y color diferente
- Leccion actual resaltada y pulsante (invitando a tocar)
- Lecciones futuras visibles pero bloqueadas (candado)
- Scroll vertical por el camino
- Quiz de nivel al final de la ruta (bloqueado hasta completar todas las lecciones)

### HU-4.2: Completar una leccion interactiva
**Como** consumidor, **quiero** completar lecciones cortas e interactivas sobre cafe, **para** aprender mientras gano Granos y Cerezas.

**Prioridad:** M | **Puntos:** 8

**Criterios de aceptacion:**
- Cada leccion tiene 5-8 ejercicios interactivos (2-3 minutos total)
- Tipos de ejercicio soportados en MVP:
  - **Seleccion multiple:** Pregunta + 4 opciones, 1 correcta
  - **Verdadero/Falso:** Afirmacion + dos opciones
  - **Emparejar:** Conectar 4 pares (ej: region ↔ pais)
  - **Ordenar:** Poner 4 items en orden correcto
- Cada ejercicio tiene una breve explicacion que se muestra despues de responder
- Respuesta correcta: animacion verde + sonido positivo + avanza
- Respuesta incorrecta: animacion roja + se pierde 1 corazon + se muestra explicacion
- Barra de progreso dentro de la leccion (ej: 3/7 ejercicios)
- Al completar: pantalla de resumen (Granos ganados, Cerezas ganadas, precision)
- Si se queda sin corazones, no puede continuar esa leccion (debe esperar o usar Cerezas)

### HU-4.3: Sistema de corazones (vidas)
**Como** consumidor, **quiero** tener un sistema de vidas que me rete a responder bien, **para** que las lecciones tengan un componente de desafio.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- El usuario tiene 5 corazones maximos
- Se pierde 1 corazon por cada respuesta incorrecta en una leccion
- Si llega a 0 corazones, no puede iniciar nuevas lecciones
- Los corazones se regeneran: 1 corazon cada 30 minutos (hasta max 5)
- Se puede recuperar 1 corazon gastando 20 Cerezas
- Los corazones se muestran visualmente en la pantalla de leccion y en el header

### HU-4.4: Completar quiz de fin de ruta
**Como** consumidor, **quiero** hacer un quiz final al terminar todas las lecciones de la ruta, **para** demostrar mi conocimiento y ganar recompensas especiales.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se desbloquea al completar todas las lecciones de la Ruta 1 (6 lecciones)
- 10 preguntas que combinan temas de toda la ruta
- Se necesita 70% de acierto (7/10) para aprobar
- Si aprueba: badge "Explorador de Origenes" + 25 Granos + 15 Cerezas
- Si no aprueba: puede reintentar despues de 4 horas
- Pantalla de resultados con detalle de respuestas

### HU-4.5: Administrar contenido de lecciones (Admin)
**Como** admin, **quiero** crear y editar lecciones y sus ejercicios desde un panel, **para** gestionar el contenido educativo sin modificar codigo.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- CRUD de rutas de aprendizaje (nombre, descripcion, orden, imagen)
- CRUD de lecciones dentro de cada ruta (nombre, orden, estado activo/inactivo)
- CRUD de ejercicios dentro de cada leccion:
  - Tipo de ejercicio (seleccion multiple, V/F, emparejar, ordenar)
  - Pregunta/enunciado
  - Opciones de respuesta
  - Respuesta correcta
  - Explicacion
  - Imagen opcional
- Vista previa de la leccion tal como la vera el consumidor
- Poder ordenar lecciones y ejercicios con drag & drop o similar

---

## Epica 5: Rachas (Streaks)

### HU-5.1: Racha diaria
**Como** consumidor, **quiero** mantener una racha diaria de actividad, **para** sentirme motivado a volver todos los dias y ganar recompensas de racha.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- La racha aumenta en 1 por cada dia que el usuario realiza al menos 1 actividad calificada:
  - Completar una leccion
  - Completar un reto diario
- La racha se reinicia a 0 si pasa un dia completo (00:00 a 23:59 hora local) sin actividad
- Se muestra la racha actual prominentemente en el home
- Animacion de fuego/llama que crece con la racha (ej: llama pequena dia 1, grande dia 30+)
- Al perder la racha: pantalla de Cafeto triste + oferta de escudo de racha

### HU-5.2: Hitos de racha
**Como** consumidor, **quiero** recibir recompensas al alcanzar hitos de racha (7, 30, 60, 100 dias), **para** tener incentivos adicionales de constancia.

**Prioridad:** S | **Puntos:** 3

**Criterios de aceptacion:**
- Recompensas por hito:
  - 7 dias: 50 Granos + 25 Cerezas + badge "Racha de Fuego"
  - 30 dias: 150 Granos + 75 Cerezas + badge "Racha Imparable"
  - 60 dias: 300 Granos + 150 Cerezas
  - 100 dias: 500 Granos + 250 Cerezas + badge "Racha Legendaria"
- Al alcanzar un hito: pantalla especial de celebracion con Cafeto
- Los hitos alcanzados se muestran en el perfil

### HU-5.3: Escudo de racha
**Como** consumidor, **quiero** poder proteger mi racha un dia sin actividad, **para** no perder mi progreso si tengo un dia ocupado.

**Prioridad:** S | **Puntos:** 2

**Criterios de aceptacion:**
- Se puede activar 1 escudo de racha por semana (maximo)
- Cuesta 20 Cerezas activar un escudo
- El escudo se activa manualmente ANTES de que termine el dia (no retroactivo)
- Si el escudo esta activo y no se realiza actividad, la racha no se pierde
- Se muestra icono de escudo junto a la racha cuando esta activo
- Se informa cuantos escudos quedan disponibles en la semana

---

## Epica 6: Reto Diario

### HU-6.1: Ver y completar reto diario
**Como** consumidor, **quiero** ver un reto diferente cada dia y completarlo, **para** ganar Granos y Cerezas extra y mantener mi racha.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- Cada dia a las 00:00 (hora local) se asigna un nuevo reto al usuario
- El reto se muestra prominentemente en la pantalla de inicio
- Tipos de reto en MVP:
  - **Trivia:** Pregunta de conocimiento con 4 opciones (respuesta inmediata)
  - **Leccion rapida:** Completar 1 leccion cualquiera
  - **Exploracion:** Visitar el perfil de un productor o marca
- Al completar: +15 Granos, +10 Cerezas, cuenta para la racha diaria
- Si no se completa antes de las 23:59, se pierde (no se acumula)
- Se muestra temporizador con tiempo restante para completar

### HU-6.2: Administrar retos diarios (Admin)
**Como** admin, **quiero** crear y programar retos diarios, **para** mantener contenido fresco sin intervencion manual diaria.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- CRUD de retos con: tipo, pregunta/instruccion, respuesta correcta (si aplica), Granos, Cerezas
- Poder crear un banco de retos y que el sistema los asigne automaticamente (rotacion)
- Opcion de programar un reto para una fecha especifica
- Si no hay reto programado, el sistema selecciona uno aleatorio del banco (no repetido en ultimos 30 dias)

---

## Epica 7: Catalogo de Productos y Compra

### HU-7.1: Ver catalogo de productos
**Como** consumidor, **quiero** explorar el catalogo de productos de las marcas en DuoCafe, **para** descubrir cafes y decidir que comprar.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- Se muestran los productos de La Rosa (MVP con 1 marca)
- Cada producto muestra: foto, nombre, marca, precio, descripcion breve, origen/region
- Se puede filtrar por: tipo (molido/grano), origen/region, rango de precio
- Se puede ordenar por: precio, mas reciente, mas popular
- Vista de lista y vista de grid
- Al tocar un producto se va al detalle

### HU-7.2: Ver detalle de producto
**Como** consumidor, **quiero** ver la informacion completa de un producto, **para** tomar una decision de compra informada.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Foto(s) del producto (carousel si hay varias)
- Nombre, marca, precio, peso/presentacion
- Descripcion completa
- Informacion de origen: region, altitud, variedad, proceso
- Notas de cata (si estan disponibles)
- Nombre del productor (link a su perfil si existe)
- Boton "Lo quiero" prominente
- Resenas de otros usuarios (si existen)

### HU-7.3: Iniciar compra via WhatsApp
**Como** consumidor, **quiero** tocar "Lo quiero" y que se abra WhatsApp con un mensaje pre-armado a la marca, **para** completar la compra por el canal habitual.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Al tocar "Lo quiero" se abre WhatsApp con:
  - Numero de la marca (configurado en panel admin)
  - Mensaje pre-armado: "Hola! Soy [nombre] de DuoCafe. Me interesa [nombre producto] - [presentacion]. Mi codigo DuoCafe es: [codigo_usuario]"
- Si el usuario no tiene WhatsApp, se ofrece alternativa (link a Instagram o email)
- Se registra el "intento de compra" en el sistema (metrica)

### HU-7.4: Registrar compra con codigo
**Como** consumidor, **quiero** ingresar el codigo de compra que me dio la marca, **para** recibir mis Granos y Cerezas por la compra.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Seccion "Registrar compra" accesible desde el menu principal
- Campo para ingresar codigo alfanumerico de 8 caracteres
- El sistema valida que el codigo exista y no haya sido usado
- Estado "pendiente de confirmacion" hasta que la marca confirme
- Una vez confirmado: se acreditan 30 Granos + 20 Cerezas
- Se muestra en el historial de compras del usuario
- Se desbloquea contenido especial del producto (si existe)

### HU-7.5: Gestionar catalogo (Panel Marca)
**Como** La Rosa (marca), **quiero** administrar mi catalogo de productos en DuoCafe, **para** mantenerlo actualizado.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- CRUD de productos: nombre, descripcion, precio, presentacion, fotos
- Datos de origen: region, altitud, variedad, proceso, productor vinculado
- Notas de cata opcionales
- Estado activo/inactivo (ocultar producto sin eliminarlo)
- Numero de WhatsApp de contacto configurable
- Vista previa de como se ve el producto en la app

### HU-7.6: Generar y gestionar codigos de compra (Panel Marca)
**Como** La Rosa (marca), **quiero** generar codigos unicos para entregar a compradores, **para** que registren su compra en DuoCafe y ganen recompensas.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Generar codigos individuales o en lote (ej: 50 codigos)
- Cada codigo se vincula a un producto especifico
- Lista de codigos con estado: generado, entregado, canjeado, expirado
- Opcion de marcar como "entregado" cuando se le da al cliente
- Confirmacion de canje: cuando el consumidor ingresa el codigo, la marca recibe notificacion y confirma
- Los codigos expiran despues de 30 dias si no se usan

---

## Epica 8: Recompensas y Canje

### HU-8.1: Ver catalogo de canje
**Como** consumidor, **quiero** ver en que puedo gastar mis Cerezas, **para** canjearlas por recompensas reales.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se muestra el catalogo de recompensas de La Rosa (MVP)
- Cada recompensa muestra: nombre, descripcion, costo en Cerezas, imagen
- Se indica si el usuario tiene suficientes Cerezas para canjear (resaltado vs gris)
- Balance de Cerezas visible en la parte superior
- Filtro por tipo: descuentos, productos, experiencias

### HU-8.2: Canjear Cerezas por recompensa
**Como** consumidor, **quiero** canjear mis Cerezas por una recompensa, **para** obtener beneficios reales por mi actividad en DuoCafe.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Al seleccionar una recompensa y confirmar, se descuentan las Cerezas
- Se genera un codigo/cupon unico para la recompensa
- El cupon se muestra en pantalla y se guarda en "Mis canjes"
- El cupon tiene fecha de expiracion (30 dias)
- Se envia notificacion a la marca para que conozca el canje
- Confirmacion visual: "Canjeaste [recompensa] por [X] Cerezas"

### HU-8.3: Gestionar catalogo de canje (Panel Marca)
**Como** La Rosa (marca), **quiero** configurar las recompensas que ofrezco a cambio de Cerezas, **para** motivar compras y fidelidad.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- CRUD de recompensas: nombre, descripcion, costo en Cerezas, imagen, tipo
- Limite de stock opcional (ej: solo 50 muestras disponibles)
- Fecha de vigencia (inicio - fin)
- Estado activo/inactivo
- Reporte de canjes realizados

---

## Epica 9: Productores (Version Basica)

### HU-9.1: Ver perfil de productor
**Como** consumidor, **quiero** ver el perfil de un productor/finca, **para** conocer quien esta detras del cafe que consumo.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Se muestra: nombre del productor/finca, foto(s), region, departamento
- Informacion de la finca: altitud, variedades cultivadas, metodos de procesamiento
- Historia/bio breve del productor
- Productos vinculados (de marcas que usan su cafe)
- Galeria de fotos (finca, cultivo, proceso)
- Boton para "seguir" al productor (notificaciones de nuevos lotes)

### HU-9.2: Explorador de productores
**Como** consumidor, **quiero** explorar una lista de productores por region, **para** descubrir los origenes del cafe colombiano.

**Prioridad:** S | **Puntos:** 3

**Criterios de aceptacion:**
- Lista/mapa de productores registrados
- Filtro por departamento/region
- Cada tarjeta muestra: nombre, foto, region, variedades principales
- Al tocar, se va al perfil completo del productor
- En MVP: 2-3 productores aliados de La Rosa

### HU-9.3: Administrar perfil de productor (Admin)
**Como** admin, **quiero** crear y editar perfiles de productores, **para** dar visibilidad a los caficultores aliados.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- CRUD de productores: nombre, finca, region, altitud, bio, fotos
- Variedades que cultiva
- Metodos de procesamiento
- Vinculacion con productos de marcas
- Estado activo/inactivo
- En MVP: el admin crea los perfiles (no self-service del productor)

---

## Epica 10: Pantalla de Inicio (Home)

### HU-10.1: Home del consumidor
**Como** consumidor, **quiero** ver un resumen de mi actividad y acciones disponibles al abrir la app, **para** saber que hacer hoy y ver mi progreso rapidamente.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- **Header:** Foto/avatar, nivel, Cerezas disponibles, corazones restantes
- **Racha:** Contador de racha prominente con icono de fuego
- **Reto del dia:** Tarjeta con el reto diario (estado: pendiente/completado)
- **Continuar aprendiendo:** Boton para retomar la ultima leccion/ruta
- **Progreso de ruta:** Barra de progreso de la ruta actual
- **Seccion de novedades:** Nuevos productos, productores destacados (scroll horizontal)
- Cafeto con mensaje del dia (ej: "Hoy aprenderas sobre regiones cafeteras!")
- Pull-to-refresh para actualizar datos

---

## Epica 11: Notificaciones

### HU-11.1: Notificaciones push basicas
**Como** consumidor, **quiero** recibir notificaciones push relevantes, **para** recordar mantener mi racha y enterarme de novedades.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Solicitar permiso de notificaciones durante onboarding (no forzar)
- Notificaciones implementadas en MVP:
  - **Racha en peligro:** A las 20:00 si no ha hecho actividad hoy ("Cafeto dice: tu racha de [X] dias esta en peligro!")
  - **Nuevo reto diario:** A las 08:00 ("Nuevo reto del dia! Gana 15 Granos")
  - **Compra confirmada:** Cuando la marca confirma su codigo ("Tu compra fue confirmada! +30 Granos +20 Cerezas")
  - **Subida de nivel:** Inmediata ("Felicidades! Subiste a nivel [X]: [titulo]")
- El usuario puede desactivar notificaciones desde configuracion
- Tocar la notificacion lleva a la seccion relevante de la app

### HU-11.2: Centro de notificaciones in-app
**Como** consumidor, **quiero** ver un historial de mis notificaciones dentro de la app, **para** no perderme nada importante.

**Prioridad:** S | **Puntos:** 2

**Criterios de aceptacion:**
- Icono de campana en header con badge de no leidas
- Lista cronologica de notificaciones
- Marcar como leida al tocar
- Cada notificacion lleva a la seccion relevante

---

## Epica 12: Panel de Administracion

### HU-12.1: Dashboard admin general
**Como** admin de DuoCafe, **quiero** ver un dashboard con metricas generales de la plataforma, **para** monitorear el estado del ecosistema.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- Metricas visibles:
  - Usuarios registrados (total + nuevos hoy/semana/mes)
  - Usuarios activos (DAU, WAU, MAU)
  - Lecciones completadas (hoy/semana/mes)
  - Compras registradas (hoy/semana/mes)
  - Cerezas en circulacion (emitidas vs canjeadas)
  - Rachas activas (distribucion)
- Graficas de tendencia (ultimos 30 dias)
- Datos actualizados en tiempo real o con cache de 5 min

### HU-12.2: Gestion de usuarios (Admin)
**Como** admin, **quiero** ver y gestionar los usuarios de la plataforma, **para** dar soporte y moderar.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Lista de usuarios con busqueda por nombre/email
- Ver detalle de usuario: perfil, nivel, Granos, Cerezas, racha, historial de actividad
- Poder: desactivar cuenta, ajustar Cerezas manualmente (con razon), resetear contrasena
- Filtros: por nivel, por fecha de registro, por actividad

### HU-12.3: Login de admin y marca
**Como** admin o representante de marca, **quiero** acceder al panel de administracion con credenciales propias, **para** gestionar la plataforma o mi marca.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Login separado para panel admin (web)
- Roles: Super Admin (DuoCafe), Admin Marca (La Rosa)
- Cada rol ve solo las secciones que le corresponden
- Super Admin puede crear cuentas de Admin Marca
- Sesion con timeout por inactividad (30 min)

---

## Epica 13: Infraestructura y PWA

### HU-13.1: PWA instalable
**Como** consumidor, **quiero** instalar DuoCafe como app desde mi navegador, **para** acceder rapido desde mi celular sin ir a una app store.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- La web app cumple criterios PWA: manifest.json, service worker, iconos
- Se muestra banner "Agregar a pantalla de inicio" en movil
- Una vez instalada, se abre en modo standalone (sin barra del navegador)
- Icono de DuoCafe con logo en pantalla de inicio
- Funciona offline para contenido ya cargado (lecciones completadas, perfil)
- Splash screen con branding DuoCafe

### HU-13.2: Responsive design
**Como** consumidor, **quiero** que DuoCafe se vea bien en cualquier dispositivo, **para** usarla desde mi celular, tablet o computador.

**Prioridad:** M | **Puntos:** 5

**Criterios de aceptacion:**
- Diseño mobile-first
- Breakpoints: movil (< 640px), tablet (640-1024px), desktop (> 1024px)
- Todas las funcionalidades accesibles en cualquier tamano
- Panel admin optimizado para desktop pero funcional en tablet
- Navegacion: bottom tab bar en movil, sidebar en desktop

### HU-13.3: Rendimiento y carga
**Como** consumidor, **quiero** que la app cargue rapido y sea fluida, **para** no frustrarme esperando.

**Prioridad:** M | **Puntos:** 3

**Criterios de aceptacion:**
- Tiempo de carga inicial (First Contentful Paint): < 2 segundos en 4G
- Lighthouse score > 80 en Performance
- Imagenes optimizadas (lazy loading, formatos modernos)
- Skeleton screens mientras carga contenido
- Transiciones suaves entre pantallas

---

## Epica 14: Badges y Logros (MVP)

### HU-14.1: Sistema de badges
**Como** consumidor, **quiero** desbloquear badges al cumplir condiciones especiales, **para** coleccionarlos y mostrarlos en mi perfil.

**Prioridad:** S | **Puntos:** 5

**Criterios de aceptacion:**
- Badges disponibles en MVP:
  - Primera Taza (completar registro)
  - Racha de Fuego (7 dias consecutivos)
  - Explorador de Origenes (completar Ruta 1)
  - Primera Compra (registrar primera compra)
  - Amigo del Caficultor (visitar 3 perfiles de productores)
- Al desbloquear: notificacion + animacion + se anade al perfil
- Seccion "Mis Logros" en perfil con badges obtenidos y no obtenidos (siluetas)
- Cada badge tiene nombre, icono, descripcion y fecha de obtencion

### HU-14.2: Administrar badges (Admin)
**Como** admin, **quiero** crear y configurar badges, **para** agregar nuevos logros sin modificar codigo.

**Prioridad:** S | **Puntos:** 3

**Criterios de aceptacion:**
- CRUD de badges: nombre, descripcion, icono/imagen, condicion de desbloqueo
- Tipos de condicion: racha (X dias), lecciones (completar ruta X), compras (X compras), visitas (X perfiles visitados)
- Estado activo/inactivo
- Vista previa del badge

---

## Resumen del MVP

### Total de Historias: 35

### Por prioridad:
| Prioridad | Cantidad | Story Points |
|---|---|---|
| Must (M) | 27 | 104 |
| Should (S) | 8 | 22 |
| **Total** | **35** | **126** |

### Por epica:
| Epica | Historias | Must | Should | Puntos |
|---|---|---|---|---|
| 1. Autenticacion | 5 | 4 | 1 | 11 |
| 2. Onboarding | 4 | 3 | 1 | 10 |
| 3. Perfil y Progresion | 4 | 3 | 1 | 13 |
| 4. Contenido Educativo | 5 | 5 | 0 | 22 |
| 5. Rachas | 3 | 1 | 2 | 10 |
| 6. Reto Diario | 2 | 2 | 0 | 8 |
| 7. Catalogo y Compra | 6 | 6 | 0 | 22 |
| 8. Recompensas y Canje | 3 | 3 | 0 | 9 |
| 9. Productores | 3 | 2 | 1 | 9 |
| 10. Home | 1 | 1 | 0 | 5 |
| 11. Notificaciones | 2 | 1 | 1 | 5 |
| 12. Panel Admin | 3 | 3 | 0 | 11 |
| 13. Infraestructura PWA | 3 | 3 | 0 | 11 |
| 14. Badges | 2 | 0 | 2 | 8 |

### Orden sugerido de desarrollo (sprints):

**Sprint 1 — Fundacion (2 semanas)**
- HU-13.1, HU-13.2, HU-13.3 (Infraestructura PWA)
- HU-1.1, HU-1.2, HU-1.3, HU-1.5 (Auth basica)
- HU-12.3 (Login admin)

**Sprint 2 — Onboarding + Contenido (2 semanas)**
- HU-2.1, HU-2.2, HU-2.4 (Onboarding)
- HU-4.1, HU-4.2, HU-4.3 (Lecciones)
- HU-4.5 (Admin contenido)

**Sprint 3 — Gamificacion Core (2 semanas)**
- HU-3.1, HU-3.3, HU-3.4 (Perfil + XP + Cerezas)
- HU-5.1 (Rachas)
- HU-6.1, HU-6.2 (Reto diario)
- HU-10.1 (Home)

**Sprint 4 — Comercio (2 semanas)**
- HU-7.1, HU-7.2, HU-7.3, HU-7.4 (Catalogo + compra)
- HU-7.5, HU-7.6 (Panel marca)
- HU-8.1, HU-8.2, HU-8.3 (Recompensas)

**Sprint 5 — Productores + Cierre (2 semanas)**
- HU-9.1, HU-9.2, HU-9.3 (Productores)
- HU-4.4 (Quiz de ruta)
- HU-11.1 (Notificaciones push)
- HU-12.1, HU-12.2 (Dashboard admin)

**Sprint 6 — Polish + Should (2 semanas)**
- HU-1.4 (Login Google)
- HU-2.3 (Meta diaria)
- HU-3.2 (Editar perfil)
- HU-5.2, HU-5.3 (Hitos racha + escudo)
- HU-11.2 (Centro notificaciones)
- HU-14.1, HU-14.2 (Badges)
- Testing integral, bugs, optimizacion

**Tiempo estimado total MVP: ~12 semanas (6 sprints de 2 semanas)**

---

*Documento creado: 14 de febrero de 2026*
*Proyecto: DuoCafe — Historias de Usuario MVP*
