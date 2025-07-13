# 🚀 Space Invasion

Un emocionante juego de Space Invaders desarrollado con Angular 20. ¡Defiende la Tierra de los invasores alienígenas!

## 🎮 Características del Juego

- **Múltiples niveles**: La dificultad aumenta con cada nivel
- **Sistema de puntuación**: Gana puntos eliminando enemigos
- **Vidas múltiples**: Tienes 3 vidas para completar la misión
- **Controles intuitivos**: Usa las flechas del teclado para moverte
- **Efectos visuales**: Interfaz moderna con efectos de neón

## 🎯 Cómo Jugar

### Controles:
- **← →** Mover nave espacial
- **ESPACIO** Disparar
- **P** Pausar/Reanudar juego

### Objetivo:
- Elimina todos los enemigos alienígenas antes de que lleguen a la Tierra
- Cada enemigo eliminado te da puntos
- Completa niveles para aumentar la dificultad
- ¡No dejes que los enemigos te alcancen!

## 🚀 Instalación y Ejecución

### Prerrequisitos:
- Node.js (versión 18 o superior)
- npm o yarn

### Pasos de instalación:

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd space-invasion
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Ejecutar el servidor de desarrollo:**
```bash
npm start
```

4. **Abrir en el navegador:**
Navega a `http://localhost:4200/` para jugar

## 🛠️ Tecnologías Utilizadas

- **Angular 20**: Framework principal
- **TypeScript**: Lenguaje de programación
- **HTML5 Canvas**: Renderizado del juego
- **CSS3**: Estilos y animaciones
- **RxJS**: Manejo de eventos

## 🎨 Características Técnicas

- **Arquitectura modular**: Componentes reutilizables
- **Game Loop optimizado**: 60 FPS fluidos
- **Detección de colisiones**: Sistema preciso de colisiones
- **Estados del juego**: Menú, jugando, pausado, game over
- **Responsive design**: Adaptable a diferentes pantallas

## 🏆 Sistema de Puntuación

- **Enemigo de la fila 1**: 50 puntos
- **Enemigo de la fila 2**: 40 puntos
- **Enemigo de la fila 3**: 30 puntos
- **Enemigo de la fila 4**: 20 puntos
- **Enemigo de la fila 5**: 10 puntos

## 🔧 Comandos de Desarrollo

```bash
# Servidor de desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── game/
│   │   └── game.component.ts    # Componente principal del juego
│   ├── app.ts                   # Componente raíz
│   ├── app.config.ts           # Configuración de la aplicación
│   └── app.routes.ts           # Rutas de la aplicación
├── styles.scss                 # Estilos globales
└── main.ts                     # Punto de entrada
```

## 🎮 Estados del Juego

1. **Menú Principal**: Pantalla de inicio con instrucciones
2. **Jugando**: Estado activo del juego
3. **Pausado**: Juego en pausa temporal
4. **Game Over**: Fin del juego con puntuación final

## 🚀 Próximas Mejoras

- [ ] Efectos de sonido
- [ ] Power-ups y bonus
- [ ] Diferentes tipos de enemigos
- [ ] Sistema de high scores
- [ ] Modo multijugador
- [ ] Animaciones más elaboradas

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. ¡Siéntete libre de contribuir y mejorar el juego!

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

¡Disfruta defendiendo la Tierra! 🌍👾
