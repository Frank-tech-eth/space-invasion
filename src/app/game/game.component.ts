import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

interface Player extends GameObject {
  lives: number;
  score: number;
}

interface Enemy extends GameObject {
  points: number;
  direction: number;
}

interface Bullet extends GameObject {
  isPlayerBullet: boolean;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-container" #gameContainer>
      <!-- Pantalla de inicio -->
      <div *ngIf="gameState === 'menu'" class="menu-screen">
        <h2>🚀 Space Invasion</h2>
        <p>¡Defiende la Tierra!</p>
        <button (click)="startGame()" class="start-button">Iniciar Juego</button>
        <div class="instructions">
          <h3>🎯 Controles del Juego</h3>
          <p>Flechas ← → Mover nave espacial</p>
          <p>Barra ESPACIO Disparar láser</p>
          <p>Tecla P Pausar juego</p>
          <p>Controles táctiles en dispositivos móviles</p>
        </div>
      </div>

      <!-- Pantalla de juego -->
      <div *ngIf="gameState === 'playing'" class="game-screen">
        <div class="game-info">
          <div class="score">Puntuación: {{ player.score }}</div>
          <div class="lives">Vidas: {{ player.lives }}</div>
          <div class="level">Nivel: {{ currentLevel }}</div>
        </div>
        
        <div class="canvas-wrapper">
          <canvas #gameCanvas 
                  [width]="canvasWidth" 
                  [height]="canvasHeight"
                  class="game-canvas">
          </canvas>
        </div>
        
        <!-- Controles táctiles para móvil -->
        <div class="mobile-controls">
          <div class="movement-controls">
            <button 
              class="control-btn left-btn" 
              (touchstart)="onTouchStart('left')" 
              (touchend)="onTouchEnd('left')"
              (mousedown)="onMouseDown('left')"
              (mouseup)="onMouseUp('left')"
              (mouseleave)="onMouseUp('left')">
              ←
            </button>
            <button 
              class="control-btn right-btn" 
              (touchstart)="onTouchStart('right')" 
              (touchend)="onTouchEnd('right')"
              (mousedown)="onMouseDown('right')"
              (mouseup)="onMouseUp('right')"
              (mouseleave)="onMouseUp('right')">
              →
            </button>
          </div>
          <div class="action-controls">
            <button 
              class="control-btn shoot-btn" 
              (touchstart)="onTouchStart('shoot')" 
              (touchend)="onTouchEnd('shoot')"
              (mousedown)="onMouseDown('shoot')"
              (mouseup)="onMouseUp('shoot')"
              (mouseleave)="onMouseUp('shoot')">
              🔥
            </button>
            <button 
              class="control-btn pause-btn" 
              (click)="pauseGame()">
              ⏸️
            </button>
          </div>
        </div>
      </div>

      <!-- Pantalla de pausa -->
      <div *ngIf="gameState === 'paused'" class="pause-screen">
        <h2>Juego Pausado</h2>
        <button (click)="resumeGame()" class="resume-button">Continuar</button>
        <button (click)="restartGame()" class="restart-button">Reiniciar</button>
      </div>

      <!-- Pantalla de game over -->
      <div *ngIf="gameState === 'gameOver'" class="game-over-screen">
        <div class="stars-background">
          <div class="star" *ngFor="let star of [1,2,3,4,5,6,7,8,9,10]"></div>
        </div>
        
        <div class="game-over-content">
          <h2 class="game-over-title">💀 Game Over</h2>
          
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-label">Puntuación Final</div>
              <div class="stat-value">{{ player.score }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">👾</div>
              <div class="stat-label">Nivel Alcanzado</div>
              <div class="stat-value">{{ currentLevel }}</div>
            </div>
          </div>
          
          <div class="share-section">
            <h3>🎯 ¡Comparte tu puntuación!</h3>
            <div class="social-buttons">
              <button class="social-btn whatsapp-btn" (click)="shareToWhatsApp()">
                <span class="social-icon">💬</span>
                <span class="social-text">WhatsApp</span>
              </button>
              <button class="social-btn telegram-btn" (click)="shareToTelegram()">
                <span class="social-icon">✈️</span>
                <span class="social-text">Telegram</span>
              </button>
              <button class="social-btn instagram-btn" (click)="shareToInstagram()">
                <span class="social-icon">📸</span>
                <span class="social-text">Instagram</span>
              </button>
            </div>
          </div>
          
          <button (click)="restartGame()" class="restart-button">🔄 Jugar de nuevo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-container {
      width: 100vw;
      max-width: 800px;
      height: 100vh;
      max-height: 1000px;
      margin: 0 auto;
      background: #000;
      border: 2px solid #00ff88;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
    .canvas-wrapper {
      width: 100%;
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .game-canvas {
      width: 100%;
      height: auto;
      max-width: 800px;
      max-height: 600px;
      background: #000;
      display: block;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 0 24px #00ff88a0;
    }
    @media (max-width: 800px) {
      .game-container {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }
      .game-canvas {
        width: 100vw;
        height: auto;
        max-width: 100vw;
        max-height: 60vw;
      }
    }
    @media (max-width: 480px) {
      .game-container {
        width: 100vw;
        height: 100vh;
        max-width: 100vw;
        max-height: 100vh;
        border-radius: 0;
      }
      .game-canvas {
        width: 100vw;
        height: auto;
        max-width: 100vw;
        max-height: 60vw;
      }
      .mobile-controls {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        background: rgba(0,0,0,0.7);
        padding-bottom: env(safe-area-inset-bottom, 10px);
        z-index: 100;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .control-btn {
        width: 48px;
        height: 48px;
        font-size: 20px;
      }
    }

    .menu-screen, .pause-screen, .game-over-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      z-index: 10;
    }

    .menu-screen h2, .pause-screen h2 {
      font-size: 2.5rem;
      color: #00ff88;
      margin-bottom: 20px;
      text-shadow: 0 0 10px #00ff88;
    }

    /* Estilos específicos para Game Over */
    .game-over-screen {
      background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #660099 100%);
    }

    .stars-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
    }

    .star {
      position: absolute;
      width: 4px;
      height: 4px;
      background: #fff;
      border-radius: 50%;
      animation: twinkle 2s infinite;
    }

    .star:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
    .star:nth-child(2) { top: 20%; left: 80%; animation-delay: 0.3s; }
    .star:nth-child(3) { top: 30%; left: 20%; animation-delay: 0.6s; }
    .star:nth-child(4) { top: 40%; left: 70%; animation-delay: 0.9s; }
    .star:nth-child(5) { top: 50%; left: 15%; animation-delay: 1.2s; }
    .star:nth-child(6) { top: 60%; left: 85%; animation-delay: 1.5s; }
    .star:nth-child(7) { top: 70%; left: 25%; animation-delay: 1.8s; }
    .star:nth-child(8) { top: 80%; left: 75%; animation-delay: 2.1s; }
    .star:nth-child(9) { top: 90%; left: 35%; animation-delay: 2.4s; }
    .star:nth-child(10) { top: 15%; left: 60%; animation-delay: 2.7s; }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .game-over-content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 600px;
      padding: 20px;
    }

    .game-over-title {
      font-size: 3rem;
      color: #ff4444;
      margin-bottom: 30px;
      text-shadow: 0 0 15px #ff4444;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .stats-container {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .stat-item {
      background: rgba(0, 255, 136, 0.1);
      border: 2px solid #00ff88;
      border-radius: 15px;
      padding: 25px;
      min-width: 200px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      transition: transform 0.3s ease;
    }

    .stat-item:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 3rem;
      margin-bottom: 10px;
    }

    .stat-label {
      color: #00ff88;
      font-size: 1.1rem;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 0 0 5px #00ff88;
    }

    .stat-value {
      color: #ffffff;
      font-size: 2.5rem;
      font-weight: bold;
      text-shadow: 0 0 10px #ffffff;
    }

    .share-section {
      margin-bottom: 30px;
    }

    .share-section h3 {
      color: #00ff88;
      font-size: 1.5rem;
      margin-bottom: 20px;
      text-shadow: 0 0 8px #00ff88;
    }

    .social-buttons {
      display: flex;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .social-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
      justify-content: center;
    }

    .twitter-btn {
      background: #1da1f2;
      color: white;
    }

    .twitter-btn:hover {
      background: #0d8bd9;
      transform: scale(1.05);
    }

    .facebook-btn {
      background: #4267b2;
      color: white;
    }

    .facebook-btn:hover {
      background: #365899;
      transform: scale(1.05);
    }

    .whatsapp-btn {
      background: #25d366;
      color: white;
    }

    .whatsapp-btn:hover {
      background: #1ea952;
      transform: scale(1.05);
    }

    .telegram-btn {
      background: #229ED9;
      color: white;
    }
    .telegram-btn:hover {
      background: #1787b7;
      transform: scale(1.05);
    }
    .instagram-btn {
      background: linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7);
      color: white;
    }
    .instagram-btn:hover {
      filter: brightness(1.1);
      transform: scale(1.05);
    }

    .social-icon {
      font-size: 1.2rem;
    }

    .social-text {
      font-size: 0.9rem;
    }

    .start-button, .resume-button, .restart-button {
      background: #00ff88;
      color: #000;
      border: none;
      padding: 15px 30px;
      font-size: 1.2rem;
      border-radius: 5px;
      cursor: pointer;
      margin: 10px;
      font-weight: bold;
      transition: all 0.3s ease;
    }

    .start-button:hover, .resume-button:hover, .restart-button:hover {
      background: #00cc6a;
      transform: scale(1.05);
    }

    .instructions {
      margin-top: 30px;
      text-align: center;
      background: rgba(0, 255, 136, 0.1);
      border: 2px solid #00ff88;
      border-radius: 15px;
      padding: 25px;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .instructions h3 {
      color: #00ff88;
      font-size: 1.4rem;
      margin-bottom: 20px;
      text-shadow: 0 0 8px #00ff88;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .instructions p {
      margin: 12px 0;
      font-size: 1.1rem;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 8px 0;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .instructions p:hover {
      background: rgba(0, 255, 136, 0.2);
      transform: translateX(5px);
    }

    .instructions p:before {
      content: "🎮";
      font-size: 1.2rem;
    }

    .instructions p:nth-child(2):before { content: "⬅️➡️"; }
    .instructions p:nth-child(3):before { content: "🔥"; }
    .instructions p:nth-child(4):before { content: "⏸️"; }
    .instructions p:nth-child(5):before { content: "📱"; }

    @media (max-width: 600px) {
      .instructions {
        margin: 20px 15px;
        padding: 20px 15px;
        max-width: calc(100% - 30px);
      }
      
      .instructions h3 {
        font-size: 1.2rem;
        margin-bottom: 15px;
      }
      
      .instructions p {
        font-size: 1rem;
        margin: 10px 0;
        padding: 6px 0;
      }
    }

    .game-screen {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .game-info {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      color: #00ff88;
      font-weight: bold;
      z-index: 5;
    }

    .game-canvas {
      display: block;
      background: #000;
    }

    .game-controls {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
    }

    .control-button {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid #00ff88;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .control-button:hover {
      background: rgba(0, 255, 136, 0.3);
    }

    /* Controles móviles */
    .mobile-controls {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      z-index: 10;
    }

    .movement-controls {
      display: flex;
      gap: 15px;
    }

    .action-controls {
      display: flex;
      gap: 15px;
    }

    .control-btn {
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      background: linear-gradient(145deg, #1a3a1a, #0d1f0d);
      color: #00ff88;
      border: 2px solid #00ff88;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(0, 255, 136, 0.1),
        0 0 10px rgba(0, 255, 136, 0.3);
    }

    .control-btn:active {
      transform: scale(0.95);
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 2px rgba(0, 255, 136, 0.2),
        0 0 15px rgba(0, 255, 136, 0.5);
    }

    .control-btn:hover {
      background: linear-gradient(145deg, #0d1f0d, #1a3a1a);
      box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(0, 255, 136, 0.2),
        0 0 20px rgba(0, 255, 136, 0.4);
    }

    .left-btn, .right-btn {
      background: linear-gradient(145deg, #1a3a1a, #0d1f0d);
      color: #00ff88;
    }

    .shoot-btn {
      background: linear-gradient(145deg, #3a1a1a, #1f0d0d);
      color: #ff4444;
      border-color: #ff4444;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(255, 68, 68, 0.1),
        0 0 10px rgba(255, 68, 68, 0.3);
    }

    .shoot-btn:hover {
      background: linear-gradient(145deg, #1f0d0d, #3a1a1a);
      box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(255, 68, 68, 0.2),
        0 0 20px rgba(255, 68, 68, 0.4);
    }

    .pause-btn {
      background: linear-gradient(145deg, #1a1a3a, #0d0d1f);
      color: #4488ff;
      border-color: #4488ff;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(68, 136, 255, 0.1),
        0 0 10px rgba(68, 136, 255, 0.3);
    }

    .pause-btn:hover {
      background: linear-gradient(145deg, #0d0d1f, #1a1a3a);
      box-shadow: 
        0 6px 12px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(68, 136, 255, 0.2),
        0 0 20px rgba(68, 136, 255, 0.4);
    }

    /* Ocultar controles en pantallas grandes */
    @media (min-width: 768px) {
      .mobile-controls {
        display: none;
      }
    }

    /* Ajustes para pantallas pequeñas */
    @media (max-width: 480px) {
      .control-btn {
        width: 50px;
        height: 50px;
        font-size: 20px;
      }
      
      .mobile-controls {
        padding: 0 10px;
        bottom: 10px;
      }
      
      .movement-controls, .action-controls {
        gap: 10px;
      }
    }
  `]
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() win = new EventEmitter<void>();
  
  canvasWidth = 800;
  canvasHeight = 600;
  
  gameState: 'menu' | 'playing' | 'paused' | 'gameOver' = 'menu';
  
  player: Player = {
    x: 0,
    y: 0,
    width: 40,
    height: 30,
    speed: 5,
    active: true,
    lives: 3,
    score: 0
  };
  
  enemies: Enemy[] = [];
  playerBullets: Bullet[] = [];
  enemyBullets: Bullet[] = [];
  
  currentLevel = 1;
  enemySpeed = 1;
  enemyDirection = 1;
  enemyDropDistance = 20;
  
  // Ajustes de velocidad base
  basePlayerSpeed = 420; // nave mucho más rápida
  baseBulletSpeed = 400; // balas más lentas
  baseEnemySpeed = 22;   // enemigos más lentos
  maxPlayerBullets = 5; // hasta 5 balas en pantalla

  private animationId: number = 0;
  private keys: { [key: string]: boolean } = {};
  private canvasReady = false;
  private lastTimestamp: number = 0;
  private touchKeys: { [key: string]: boolean } = {};
  
  private backgroundMusic: HTMLAudioElement | null = null;
  private shootSound: HTMLAudioElement | null = null;
  private enemyShootSound: HTMLAudioElement | null = null;
  private gameOverSound: HTMLAudioElement | null = null;
  private damageSound: HTMLAudioElement | null = null;
  private nextLevelSound: HTMLAudioElement | null = null;
  private bossMusic: HTMLAudioElement | null = null;
  private winSound: HTMLAudioElement | null = null;

  showLevelMessage = false;
  levelMessage = '';

  showBossIntro = false;
  bossIntroProgress = 0;
  bossMaxHealth = 30;
  bossHealth = 30;

  // Para el disparo circular del jefe
  timeToNextBossCircle = 0;

  ngOnInit() {
    this.backgroundMusic = new Audio('assets/music/space.mp3');
    this.backgroundMusic.loop = true;
    this.backgroundMusic.volume = 0.5;
    this.bossMusic = new Audio('assets/music/boss.mp3');
    this.bossMusic.loop = true;
    this.bossMusic.volume = 0.5;
    this.shootSound = new Audio('assets/sfx/pew.mp3');
    this.shootSound.volume = 0.5;
    this.enemyShootSound = new Audio('assets/sfx/shots.mp3');
    this.enemyShootSound.volume = 0.5;
    this.gameOverSound = new Audio('assets/sfx/gameover.mp3');
    this.gameOverSound.volume = 0.7;
    this.damageSound = new Audio('assets/sfx/damage.mp3');
    this.damageSound.volume = 0.7;
    this.nextLevelSound = new Audio('assets/sfx/next-level.mp3');
    this.nextLevelSound.volume = 0.8;
    this.winSound = new Audio('assets/sfx/win.mp3');
    this.winSound.volume = 0.8;
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.canvasReady = true;
      this.draw();
      // Reproducir música al cargar el canvas
      this.playMusic();
    });
  }
  
  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopMusic();
  }
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.keys[event.code] = true;
    
    if (event.code === 'Space' && this.gameState === 'playing') {
      event.preventDefault();
      this.shoot();
    }
    
    if (event.code === 'KeyP' && this.gameState === 'playing') {
      this.pauseGame();
    }
  }
  
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.keys[event.code] = false;
  }

  // Métodos para controles táctiles
  onTouchStart(action: string) {
    this.touchKeys[action] = true;
    if (action === 'shoot') {
      this.shoot();
    }
  }

  onTouchEnd(action: string) {
    this.touchKeys[action] = false;
  }

  onMouseDown(action: string) {
    this.touchKeys[action] = true;
    if (action === 'shoot') {
      this.shoot();
    }
  }

  onMouseUp(action: string) {
    this.touchKeys[action] = false;
  }
  
  initializeGame() {
    this.player.x = this.canvasWidth / 2 - this.player.width / 2;
    this.player.y = this.canvasHeight - this.player.height - 20;
    this.player.lives = 3;
    this.player.score = 0;
    this.currentLevel = 1;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.touchKeys = {}; // Resetear controles táctiles
    this.createEnemies();
  }
  
  createEnemies() {
    this.enemies = [];
    const rows = 5;
    const cols = 10;
    const enemyWidth = 40;
    const enemyHeight = 30;
    const spacing = 60;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const enemy: Enemy = {
          x: col * spacing + 50,
          y: row * spacing + 50,
          width: enemyWidth,
          height: enemyHeight,
          speed: this.enemySpeed,
          active: true,
          points: (rows - row) * 10,
          direction: 1
        };
        this.enemies.push(enemy);
      }
    }
  }
  
  startGame() {
    if (!this.canvasReady) return;
    this.initializeGame();
    this.gameState = 'playing';
    setTimeout(() => this.draw(), 0);
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  playMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(() => {});
      // Refuerzo el loop manualmente
      this.backgroundMusic.onended = () => {
        this.backgroundMusic!.currentTime = 0;
        this.backgroundMusic!.play().catch(() => {});
      };
    }
  }

  pauseMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    if (this.bossMusic) {
      this.bossMusic.pause();
      this.bossMusic.currentTime = 0;
    }
  }

  pauseGame() {
    this.gameState = 'paused';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.pauseMusic();
  }
  
  resumeGame() {
    this.gameState = 'playing';
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  restartGame() {
    this.initializeGame();
    this.gameState = 'playing';
    setTimeout(() => this.draw(), 0);
    this.lastTimestamp = performance.now();
    this.gameLoop(this.lastTimestamp);
    this.playMusic();
  }
  
  playShootSound() {
    if (this.shootSound) {
      this.shootSound.currentTime = 0;
      this.shootSound.play().catch(() => {});
    }
  }

  playEnemyShootSound() {
    if (this.enemyShootSound) {
      this.enemyShootSound.currentTime = 0;
      this.enemyShootSound.play().catch(() => {});
    }
  }

  playGameOverSound() {
    if (this.gameOverSound) {
      this.gameOverSound.currentTime = 0;
      this.gameOverSound.play().catch(() => {});
    }
  }

  playDamageSound() {
    if (this.damageSound) {
      this.damageSound.currentTime = 0;
      this.damageSound.play().catch(() => {});
    }
  }

  playNextLevelSound() {
    if (this.nextLevelSound) {
      this.nextLevelSound.currentTime = 0;
      this.nextLevelSound.play().catch(() => {});
    }
  }

  playWinSound() {
    if (this.winSound) {
      this.winSound.currentTime = 0;
      this.winSound.play().catch(() => {});
    }
  }

  showLevelTransition(level: number) {
    this.levelMessage = `¡Nivel ${level}!`;
    this.showLevelMessage = true;
    setTimeout(() => {
      this.showLevelMessage = false;
    }, 2000);
  }

  shoot() {
    if (this.playerBullets.length < this.maxPlayerBullets) {
      const bullet: Bullet = {
        x: this.player.x + this.player.width / 2 - 2,
        y: this.player.y,
        width: 4,
        height: 14, // balas más largas para que parezcan más juntas
        speed: this.baseBulletSpeed,
        active: true,
        isPlayerBullet: true
      };
      this.playerBullets.push(bullet);
      this.playShootSound();
    }
  }
  
  enemyShoot() {
    if (this.enemies.length > 0 && Math.random() < 0.04) {
      const randomEnemy = this.enemies[Math.floor(Math.random() * this.enemies.length)];
      if (randomEnemy.active) {
        const bullet: Bullet = {
          x: randomEnemy.x + randomEnemy.width / 2 - 2,
          y: randomEnemy.y + randomEnemy.height,
          width: 4,
          height: 10,
          speed: this.baseBulletSpeed * 0.5,
          active: true,
          isPlayerBullet: false
        };
        this.enemyBullets.push(bullet);
        this.playEnemyShootSound(); // Sonido de disparo alien
      }
    }
  }
  
  updatePlayer(delta: number) {
    const moveAmount = this.basePlayerSpeed * delta;
    // Controles de teclado
    if ((this.keys['ArrowLeft'] || this.touchKeys['left']) && this.player.x > 0) {
      this.player.x -= moveAmount;
      if (this.player.x < 0) this.player.x = 0;
    }
    if ((this.keys['ArrowRight'] || this.touchKeys['right']) && this.player.x < this.canvasWidth - this.player.width) {
      this.player.x += moveAmount;
      if (this.player.x > this.canvasWidth - this.player.width) this.player.x = this.canvasWidth - this.player.width;
    }
  }
  
  updateEnemies(delta: number) {
    let shouldChangeDirection = false;
    const speed = this.baseEnemySpeed + (this.currentLevel - 1) * 7;
    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.x += speed * delta * enemy.direction;
        if (enemy.x <= 0 || enemy.x >= this.canvasWidth - enemy.width) {
          shouldChangeDirection = true;
        }
        // Solo termina el juego si un alien llega a la línea del jugador
        if (enemy.y + enemy.height >= this.player.y) {
          this.gameOver();
          return;
        }
      }
    }
    if (shouldChangeDirection) {
      for (const enemy of this.enemies) {
        if (enemy.active) {
          enemy.direction *= -1;
          enemy.y += this.enemyDropDistance;
        }
      }
      this.enemyDirection *= -1;
    }
  }
  
  updateBullets(delta: number) {
    // Balas del jugador
    const bulletSpeed = this.baseBulletSpeed;
    this.playerBullets = this.playerBullets.filter(bullet => {
      bullet.y -= bulletSpeed * delta;
      return bullet.active && bullet.y > 0;
    });
    // Balas enemigas
    this.enemyBullets = this.enemyBullets.filter(bullet => {
      if ((bullet as any).dx !== undefined && (bullet as any).dy !== undefined) {
        bullet.x += (bullet as any).dx * bullet.speed * delta;
        bullet.y += (bullet as any).dy * bullet.speed * delta;
      } else {
        bullet.y += bulletSpeed * 0.5 * delta;
      }
      return bullet.active && bullet.y < this.canvasHeight && bullet.x > 0 && bullet.x < this.canvasWidth;
    });
  }
  
  checkCollisions() {
    // Colisión entre balas del jugador y enemigos
    for (const bullet of this.playerBullets) {
      for (const enemy of this.enemies) {
        if (bullet.active && enemy.active && this.isColliding(bullet, enemy)) {
          bullet.active = false;
          // Si es jefe
          if (this.currentLevel === 3 && this.enemies.length === 1) {
            this.bossHealth--;
            if (this.bossHealth <= 0) {
              enemy.active = false;
              this.player.score += enemy.points;
              this.levelMessage = '!Yoou win!';
              this.showLevelMessage = true;
              this.playWinSound();
              this.win.emit(); // EMITIR EVENTO DE VICTORIA
              // No ocultar el mensaje, dejarlo fijo
              // Aquí puedes poner lógica de victoria/final
            }
          } else {
            enemy.active = false;
            this.player.score += enemy.points;
            if (this.enemies.every(e => !e.active)) {
              this.nextLevel();
            }
          }
        }
      }
    }
    // Colisión entre balas enemigas y jugador
    for (const bullet of this.enemyBullets) {
      if (bullet.active && this.isColliding(bullet, this.player)) {
        bullet.active = false;
        this.player.lives--;
        this.playDamageSound();
        if (this.player.lives <= 0) {
          this.gameOver();
        }
      }
    }
    // Ya no se pierde por contacto directo con los enemigos
  }
  
  isColliding(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }
  
  nextLevel() {
    this.currentLevel++;
    this.enemySpeed += 0.5;
    this.createEnemies();
    this.playNextLevelSound();
    this.showLevelTransition(this.currentLevel);
    // Carga previa al jefe
    if (this.currentLevel === 3) {
      this.showBossIntro = true;
      this.bossIntroProgress = 0;
      let interval = setInterval(() => {
        this.bossIntroProgress += 10; // aún más rápido (0.5 segundos)
        if (this.bossIntroProgress >= 100) {
          clearInterval(interval);
          this.showBossIntro = false;
          this.startBossFight();
        }
      }, 5); // 0.5 segundos
      this.stopMusic();
      if (this.bossMusic) {
        this.bossMusic.currentTime = 0;
        this.bossMusic.play().catch(() => {});
        this.bossMusic.onended = () => {
          this.bossMusic!.currentTime = 0;
          this.bossMusic!.play().catch(() => {});
        };
      }
    }
  }

  startBossFight() {
    // Solo un jefe gigante
    this.enemies = [{
      x: this.canvasWidth / 2 - 80,
      y: 60,
      width: 160,
      height: 80,
      speed: 0,
      active: true,
      points: 500,
      direction: 1
    }];
    this.bossHealth = this.bossMaxHealth;
    this.timeToNextBossCircle = 1; // cada 1 segundo exacto
  }

  gameOver() {
    this.gameState = 'gameOver';
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.stopMusic();
    this.playGameOverSound();
  }
  
  draw() {
    if (!this.gameCanvas || !this.gameCanvas.nativeElement) return;
    const ctx = this.gameCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    // Limpiar canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    // Barra de mapa vertical y centrada a la derecha (de abajo hacia arriba)
    ctx.save();
    const barX = this.canvasWidth - 50;
    const barY = this.canvasHeight / 2 - 100;
    ctx.fillStyle = '#222';
    ctx.fillRect(barX, barY, 16, 200);
    // Progreso de abajo hacia arriba
    ctx.fillStyle = '#00ff88';
    let progress = Math.min((this.currentLevel - 1) / 2, 1); // 0 en nivel 1, 0.5 en 2, 1 en 3
    ctx.fillRect(barX, barY + 200 - 200 * progress, 16, 200 * progress);
    // Niveles alineados a la derecha, de abajo hacia arriba
    ctx.font = '14px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText('Nivel 1', barX - 10, barY + 200);
    ctx.fillText('Nivel 2', barX - 10, barY + 100);
    ctx.fillText('Nivel 3', barX - 10, barY + 10);
    // Cara del jefe arriba
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👾', barX + 20, barY);
    ctx.restore();
    // Barra de carga/mapa antes del jefe (solo animación, no barra principal)
    if (this.showBossIntro) {
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.fillRect(this.canvasWidth / 2 - 150, this.canvasHeight / 2 - 20, 300, 30);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(this.canvasWidth / 2 - 150, this.canvasHeight / 2 - 20, 3 * this.bossIntroProgress, 30);
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('¡Prepárate!', this.canvasWidth / 2, this.canvasHeight / 2 - 40);
      ctx.restore();
      return;
    }
    // Dibujar nave (triángulo futurista)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.player.x + this.player.width / 2, this.player.y); // punta
    ctx.lineTo(this.player.x, this.player.y + this.player.height); // esquina izq
    ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height); // esquina der
    ctx.closePath();
    ctx.fillStyle = '#00ffea';
    ctx.shadowColor = '#00ffea';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();
    // Dibujar cabina
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.player.x + this.player.width / 2, this.player.y + this.player.height * 0.7, this.player.width * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    // Dibujar enemigos (pixel art tipo Space Invaders)
    for (const enemy of this.enemies) {
      if (enemy.active) {
        this.drawAlien(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.points);
      }
    }
    // Dibujar balas del jugador
    ctx.fillStyle = '#00ff88';
    for (const bullet of this.playerBullets) {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    }
    // Dibujar balas enemigas
    ctx.fillStyle = '#ff4444';
    for (const bullet of this.enemyBullets) {
      if (bullet.active) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      }
    }
    // Si es jefe, dibujar barra de vida SOLO si está activo y vida > 0
    if (this.currentLevel === 3 && this.enemies.length === 1 && this.enemies[0].active && this.bossHealth > 0) {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width, 10);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width * (this.bossHealth / 30), 10);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(this.enemies[0].x, this.enemies[0].y - 20, this.enemies[0].width, 10);
      ctx.restore();
    }
    // Mensaje de nivel o victoria
    if (this.showLevelMessage) {
      // Si es victoria, oscurecer pantalla
      if (this.levelMessage === '!Yoou win!') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        ctx.restore();
      }
      ctx.save();
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 20;
      ctx.fillText(this.levelMessage, this.canvasWidth / 2, this.canvasHeight / 2);
      ctx.restore();
    }
  }

  // Dibuja un alien tipo Space Invader pixelado
  private drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, points: number) {
    // El color depende de los puntos (fila)
    let color = '#ffeb3b';
    if (points >= 40) color = '#ff4081';
    else if (points >= 30) color = '#7c4dff';
    else if (points >= 20) color = '#00e676';
    // Pixel art: matriz 8x8
    const pixel = w / 8;
    const shape = [
      [0,1,1,0,0,1,1,0],
      [1,0,1,1,1,1,0,1],
      [1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1],
      [1,1,0,1,1,0,1,1],
      [1,1,1,1,1,1,1,1],
      [0,1,1,0,0,1,1,0],
      [1,0,0,0,0,0,0,1],
    ];
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (shape[row][col]) {
          ctx.fillRect(x + col * pixel, y + row * pixel, pixel, pixel);
        }
      }
    }
    ctx.restore();
  }
  
  gameLoop(timestamp: number) {
    if (this.gameState === 'playing') {
      const delta = (timestamp - this.lastTimestamp) / 1000; // en segundos
      this.lastTimestamp = timestamp;
      this.updatePlayer(delta);
      this.updateEnemies(delta);
      this.updateBullets(delta);
      this.enemyShoot();
      // Disparo circular del jefe
      if (this.currentLevel === 3 && this.enemies.length === 1 && this.enemies[0].active && this.bossHealth > 0) {
        this.timeToNextBossCircle -= delta;
        if (this.timeToNextBossCircle <= 0) {
          this.bossCircularShoot();
          this.timeToNextBossCircle = 1;
        }
      }
      this.checkCollisions();
      this.draw();
      this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  bossCircularShoot() {
    const boss = this.enemies[0];
    const centerX = boss.x + boss.width / 2;
    const centerY = boss.y + boss.height / 2;
    const numBullets = 12;
    const angleStep = (2 * Math.PI) / numBullets;
    for (let i = 0; i < numBullets; i++) {
      const angle = i * angleStep;
      const speed = this.baseBulletSpeed * 0.5;
      this.enemyBullets.push({
        x: centerX,
        y: centerY,
        width: 6,
        height: 6,
        speed: speed,
        active: true,
        isPlayerBullet: false,
        // Extra: dirección personalizada
        dx: Math.cos(angle),
        dy: Math.sin(angle)
      } as any);
    }
    this.playEnemyShootSound();
  }

  // Métodos para compartir en redes sociales
  shareToTwitter() {
    const text = `¡Conseguí ${this.player.score} puntos en Space Invasion! 🚀 Nivel ${this.currentLevel} 👾 ¡Juega ahora!`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  }

  shareToFacebook() {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  }

  shareToWhatsApp() {
    const text = `¡Conseguí ${this.player.score} puntos en Space Invasion! 🚀 Nivel ${this.currentLevel} 👾 ¡Juega ahora!`;
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  }

  shareToTelegram() {
    const text = `¡Conseguí ${this.player.score} puntos en Space Invasion! 🚀 Nivel ${this.currentLevel} 👾 ¡Juega ahora!`;
    const url = window.location.href;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank');
  }

  shareToInstagram() {
    // Instagram no permite compartir directamente desde web, así que abrimos el perfil del juego o mostramos un mensaje
    const instagramProfile = 'https://www.instagram.com/tu_perfil_juego/'; // Cambia por el perfil real
    window.open(instagramProfile, '_blank');
  }
} 