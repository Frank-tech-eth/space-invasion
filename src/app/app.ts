import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameComponent } from './game/game.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GameComponent],
  template: `
    <div class="social-bar" (mouseenter)="showTooltip = true" (mouseleave)="showTooltip = false">
      <div class="social-tooltip" *ngIf="showTooltip">Más Proyectos</div>
      <a href="https://github.com/Frank-tech-eth" target="_blank" class="social-icon" aria-label="GitHub">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" fill="#fff"/>
        </svg>
      </a>
      <div class="social-icon disabled" aria-label="Correo" title="Próximamente">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2 0v.01L12 13l8-8.99V4H4Zm16 2.41-6.59 6.59a2 2 0 0 1-2.82 0L4 6.41V20h16V6.41Z" fill="#fff"/>
        </svg>
      </div>
      <div class="social-icon" aria-label="Siguiente" title="Próximamente">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7L8 5Z" fill="#fff"/>
        </svg>
      </div>
    </div>
    <div class="app-container">
      <main class="game-main">
        <app-game (win)="showSocialWin = true"></app-game>
        <div *ngIf="showSocialWin" class="social-win-bar">
          <a href="https://github.com/Frank-tech-eth" target="_blank" class="social-icon" aria-label="GitHub">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.578.688.48C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2Z" fill="#fff"/>
            </svg>
          </a>
          <div class="social-icon disabled" aria-label="Correo" title="Próximamente">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm2 0v.01L12 13l8-8.99V4H4Zm16 2.41-6.59 6.59a2 2 0 0 1-2.82 0L4 6.41V20h16V6.41Z" fill="#fff"/>
            </svg>
          </div>
          <div class="social-icon" aria-label="Siguiente" title="Próximamente">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7L8 5Z" fill="#fff"/>
            </svg>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .social-bar {
      position: fixed;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0,0,0,0.7);
      border-radius: 0 16px 16px 0;
      padding: 16px 8px 16px 4px;
      z-index: 1000;
      transition: background 0.3s;
    }
    .social-bar:hover {
      background: rgba(0,0,0,0.9);
    }
    .social-tooltip {
      color: #00ff88;
      font-size: 1.1rem;
      margin-bottom: 18px;
      font-weight: bold;
      letter-spacing: 1px;
      text-shadow: 0 0 8px #00ff88;
      writing-mode: vertical-lr;
      transform: rotate(180deg);
      transition: opacity 0.3s;
    }
    .social-icon {
      margin: 10px 0;
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s;
      border-radius: 50%;
      background: rgba(0,255,136,0.1);
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .social-icon:hover {
      opacity: 1;
      background: #00ff88;
      transform: scale(1.1);
    }
    .social-icon.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: rgba(255,255,255,0.1);
    }
    @media (max-width: 700px) {
      .social-bar { display: none; }
    }
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
      color: white;
      font-family: 'Arial', sans-serif;
      display: flex;
      flex-direction: column;
    }

    .game-main {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0;
    }
    .social-win-bar {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      gap: 32px;
      margin: 32px auto 0 auto;
      padding: 16px 0;
      background: rgba(0,0,0,0.7);
      border-radius: 16px;
      box-shadow: 0 0 24px #00ff88a0;
      z-index: 2000;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    @media (max-width: 700px) {
      .social-bar { display: none; }
      .social-win-bar {
        flex-direction: row;
        gap: 18px;
        width: 90vw;
        max-width: 95vw;
        margin: 0 auto;
        padding: 12px 0;
        font-size: 1.1rem;
      }
    }
    .social-icon {
      margin: 0 10px;
      cursor: pointer;
      opacity: 0.85;
      transition: opacity 0.2s, transform 0.2s;
      border-radius: 50%;
      background: rgba(0,255,136,0.1);
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .social-icon:hover {
      opacity: 1;
      background: #00ff88;
      transform: scale(1.1);
    }
    .social-icon.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: rgba(255,255,255,0.1);
    }
  `]
})
export class App {
  title = 'space-invasion';
  showTooltip = false;
  showSocialWin = false;
}
