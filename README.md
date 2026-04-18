# ORBI

ORBI
Orbi es una app educativa gamificada para niños de 6 a 10 años basada en la Teoría de las Inteligencias Múltiples de Howard Gardner. La idea principal es que no todos los niños aprenden igual ni son inteligentes de la misma forma, y quisimos hacer algo que reflejara eso. A través de 8 minijuegos, narración con IA y un sistema de progresión visual, Orbi identifica y potencia las fortalezas de cada niño convirtiendo el aprendizaje en una aventura entre planetas.

Inspiración
El proyecto nace de una pregunta que todos nos hemos hecho: ¿por qué hay niños que se les dificulta la escuela tradicional pero son increíbles para otras cosas? Gardner demostró que la inteligencia no es una sola, son ocho. Quisimos construir algo que le demostrara eso a los niños de una forma que realmente les importara, con juegos, con su nombre, con su propio planeta. Cada integrante del equipo aportó desde su área y eso se nota en el resultado.

¿Qué hace Orbi?
8 Planetas, 8 Inteligencias: cada inteligencia de Gardner tiene su propio planeta con un minijuego diseñado específicamente para ese tipo de pensamiento. El niño desbloquea planetas conforme acumula puntos, construyendo su universo personal.
Aprendizaje adaptado al niño: el sistema registra el desempeño en cada inteligencia y construye un perfil de fortalezas en tiempo real. No existe una sola forma de ser inteligente y Orbi lo demuestra jugando.
IA generativa integrada: Gemini genera historias personalizadas con el nombre del niño, identifica seres vivos a través de la cámara del dispositivo, y produce reportes para los padres con lenguaje claro y accionable.
Voz de Orbi: ElevenLabs le da voz a Orbi, la mascota espacial de la plataforma, narrándole las historias directamente al niño dentro del juego.
Mi Planeta: cada niño tiene un planeta generativo único. Su color, superficie, anillos y lunas cambian según sus inteligencias dominantes y su progreso. Ningún planeta se ve igual al de otro niño.
Dashboard para padres: un reporte con análisis de IA muestra qué inteligencias destacan en su hijo, con gráficas de progreso y recomendaciones.

Arquitectura del Proyecto
Orbi se compone de tres partes principales:
Interfaz de Usuario (Frontend): desarrollada con React y Vite, sin librerías de UI externas. Todo el diseño visual, las animaciones y los gráficos los construimos desde cero con CSS puro y SVG. La interfaz es completamente responsiva y está optimizada para uso táctil en tabletas y celulares.
Módulo de IA y Lógica (Backend): implementado en Node.js con Express 5. Gestiona los perfiles de jugadores, puntajes y planetas desbloqueados. Se conecta directamente con las APIs de Gemini y ElevenLabs para la generación de contenido en tiempo real.
Base de Datos: MongoDB Atlas almacena los perfiles de cada niño, sus puntajes por inteligencia, los planetas desbloqueados y el historial de sesiones.

Tecnologías Utilizadas
Frontend: React, Vite, CSS Animations, SVG puro.
Backend: Node.js, Express 5, Mongoose.
Base de datos: MongoDB Atlas.
IA Generativa: Google Gemini API para texto y visión artificial.
Síntesis de voz: ElevenLabs API.
APIs nativas del navegador: Web Audio API para las notas musicales en Sonus, MediaDevices API para la cámara en Terra.

Los 8 Planetas
Kálculo — Inteligencia Lógico-Matemática. El niño alimenta a un monstruo con la cantidad y forma correcta de objetos.
Verbum — Inteligencia Lingüístico-Verbal. Orbi genera una historia personalizada con el nombre del niño y se la narra con voz real.
Prisma — Inteligencia Visual-Espacial. El niño completa patrones de colores en una cuadrícula que escala en dificultad.
Sonus — Inteligencia Musical. Se reproduce una secuencia de notas reales y el niño debe repetirla en el orden correcto.
Terra — Inteligencia Naturalista. El niño apunta la cámara a un animal o planta y Gemini lo identifica con un dato curioso.
Kinetis — Inteligencia Corporal-Cinestésica. Burbujas de colores suben por la pantalla y el niño las atrapa antes de que escapen.
Nexus — Inteligencia Interpersonal. Se presentan situaciones sociales reales y el niño elige la respuesta más empática, con retroalimentación educativa en cada caso.
Lumis — Inteligencia Intrapersonal. El niño responde preguntas sobre sí mismo y al final se genera su Carta de Identidad espacial única.

Desafíos y Soluciones
Diseñar para niños de 6 años: el reto más grande no fue técnico sino de diseño. No podíamos poner instrucciones largas ni textos complicados. Cada juego tenía que ser autoexplicable desde los primeros tres segundos. La solución fue eliminar cualquier texto instructivo del gameplay y hacer que la mecánica se entendiera solo con ver la pantalla.
IA en tiempo real sin romper la experiencia: las llamadas a Gemini no son instantáneas y eso podía sacar al niño del juego. Lo resolvimos animando a Orbi mientras espera la respuesta, convirtiendo la carga en parte de la experiencia y no en una interrupción.
Planeta generativo único por niño: necesitábamos que cada niño tuviera un planeta visualmente distinto sin depender de imágenes externas. Construimos un generador SVG determinista basado en un hash del nombre del niño que produce colores, manchas, bandas y anillos únicos y reproducibles para cada usuario.
Progresión motivacional: mantener el interés de un niño de 6 años en múltiples sesiones requirió un sistema de desbloqueo progresivo. Los planetas nuevos se revelan conforme acumula puntos, generando anticipación constante para seguir jugando.

Logros y Aprendizajes
Logramos construir una plataforma completa con los 8 juegos funcionando durante el hackathon. Integrar IA generativa y visión artificial en un contexto educativo infantil fue un aprendizaje enorme para el equipo, especialmente pensar cómo hacer que una tecnología tan compleja se sintiera invisible para un niño de primer grado. El trabajo multidisciplinario entre diseño, frontend, backend e IA fue clave para que todo encajara en el tiempo disponible.

Próximos Pasos
Currículum por grado escolar: alinear los retos de cada planeta con los contenidos oficiales de primaria en México para que Orbi sea un complemento directo al aula.
Modo cooperativo: explorar mecánicas donde dos niños con inteligencias dominantes distintas deban colaborar para resolver retos combinados.
Panel para docentes: extender el dashboard hacia un panel para maestros con progresión grupal y detección de áreas de oportunidad por salón.
Accesibilidad: incorporar soporte para daltonismo, navegación por voz y modos de alto contraste para que Orbi sea para todos los niños.

Orbi nació de una idea simple: todos los niños son inteligentes. Solo necesitan el espacio correcto para demostrarlo.
