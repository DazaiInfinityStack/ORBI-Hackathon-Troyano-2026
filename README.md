# ORBI
Orbi es una plataforma educativa gamificada para niños de 6 a 10 años, basada en la Teoría de las Inteligencias Múltiples de Howard Gardner. A través de minijuegos interactivos, narración con IA generativa y un sistema de progresión visual espacial, Orbi identifica y potencia las fortalezas cognitivas únicas de cada niño, convirtiendo el aprendizaje en una aventura entre planetas.

¿Qué hace Orbi?
8 Planetas, 8 Inteligencias
Cada inteligencia de Gardner tiene su propio planeta con mecánicas de juego diseñadas específicamente para ese tipo de pensamiento. El niño desbloquea planetas conforme avanza, construyendo su universo personal.
Aprendizaje adaptado al niño
El sistema registra el desempeño en cada inteligencia y genera un perfil de fortalezas en tiempo real. No existe una sola forma de ser inteligente — Orbi lo demuestra.
IA generativa integrada
Gemini genera historias personalizadas con el nombre del niño (Verbum), identifica seres vivos mediante la cámara del dispositivo (Terra), y produce reportes de inteligencias para los padres con lenguaje claro y accionable.
Voz de Orbi
ElevenLabs da voz a Orbi, la mascota espacial de la plataforma, narrandole las historias al niño directamente en el juego.
Mi Planeta — Perfil personal
Cada niño tiene un planeta generativo único: su color, superficie, anillos y lunas orbitantes cambian según sus inteligencias dominantes y su progreso. Ningún planeta es igual al de otro niño.
Dashboard para padres
Un reporte con análisis de IA muestra a los padres qué inteligencias destacan en su hijo, con gráficas de progreso y recomendaciones pedagógicas.

Arquitectura del Proyecto
Frontend
Desarrollado en React + Vite, con CSS puro y animaciones SVG nativas. Sin librerías de UI externas — cada componente visual fue construido desde cero para garantizar la experiencia visual espacial que el proyecto requiere. La interfaz es completamente responsiva y optimizada para uso táctil en tabletas y celulares.
Backend
Implementado en Node.js con Express 5. Gestiona la persistencia de jugadores, puntajes y planetas desbloqueados. Se integra directamente con las APIs de Gemini y ElevenLabs para la generación de contenido en tiempo real.
Base de datos
MongoDB Atlas almacena los perfiles de cada niño: nombre, puntajes por inteligencia, planetas desbloqueados e historial de sesiones.
IA Generativa
Gemini opera en dos modalidades: generación de texto para historias personalizadas y análisis de visión para identificar animales y plantas mediante la cámara del dispositivo.

Tecnologías Utilizadas
CapaTecnologíaFrontendReact, Vite, CSS Animations, SVGBackendNode.js, Express 5Base de datosMongoDB Atlas + MongooseIA generativaGoogle Gemini APISíntesis de vozElevenLabs APIAudio nativoWeb Audio APICámaraMediaDevices API

Los 8 Planetas
PlanetaInteligenciaMecánica🔵 KálculoLógico-MatemáticaAlimenta al monstruo con la cantidad y forma correcta🟢 VerbumLingüístico-VerbalOrbi narra una historia generada por IA con tu nombre🔴 PrismaVisual-EspacialCompleta patrones de colores en cuadrículas🟣 SonusMusicalMemoriza y repite secuencias de notas reales🌿 TerraNaturalistaEscanea seres vivos con la cámara e identifícalos con IA🟠 KinetisCorporal-CinestésicaAtrapa burbujas de colores antes de que escapen🟡 NexusInterpersonalElige la respuesta más empática ante situaciones sociales⭐ LumisIntrapersonalResponde preguntas sobre ti mismo y genera tu Carta de Identidad

Desafíos y Soluciones
Diseño inclusivo para niños de 6 años
El mayor reto no fue técnico sino de diseño: crear interfaces que un niño de primer grado pueda navegar sin instrucciones. La solución fue eliminar cualquier texto instructivo del gameplay y diseñar cada mecánica para que sea autoexplicable en los primeros tres segundos.
IA generativa en tiempo real sin latencia perceptible
Las llamadas a Gemini debían sentirse inmediatas para no romper la inmersión del juego. Se implementó un sistema de estados intermedios con animaciones de Orbi que hacen la espera parte de la experiencia, no un obstáculo.
Planeta generativo único por niño
Cada niño debía tener un planeta visualmente distinto sin depender de assets externos. La solución fue un generador SVG determinista basado en un hash del nombre del niño, produciendo colores, manchas, bandas y anillos reproducibles y únicos para cada usuario.
Progresión motivacional sostenida
Mantener el engagement de un niño de 6 años durante múltiples sesiones requirió un sistema de desbloqueo progresivo: los planetas nuevos se revelan conforme el niño acumula puntos, creando anticipación constante.

Logros

Plataforma completa con 8 juegos funcionales construida durante el hackathon
Integración real de IA generativa y visión artificial en contexto educativo infantil
Sistema de perfil visual dinámico que evoluciona con el aprendizaje del niño
Arquitectura lista para escalar con nuevos juegos, idiomas y contenido curricular


Próximos Pasos
Currículum adaptado por grado escolar
Alinear los desafíos de cada planeta con los contenidos oficiales de primaria en México, permitiendo que Orbi sea un complemento directo al aula.
Modo multijugador cooperativo
Explorar mecánicas donde dos niños con inteligencias dominantes distintas deban colaborar para resolver retos combinados.
Análisis longitudinal para docentes
Extender el dashboard de padres hacia un panel para maestros, con progresión grupal y detección temprana de áreas de oportunidad.
Accesibilidad
Incorporar soporte para daltonismo, navegación por voz y modos de alto contraste para garantizar que Orbi sea para todos los niños.

Orbi nació de una convicción simple: todos los niños son inteligentes. Solo necesitan el espacio correcto para demostrarlo.
