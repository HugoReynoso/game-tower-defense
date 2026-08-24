import Phaser from 'phaser';

export class BootScene extends Phaser.Scene{
  constructor(){super('boot')}
  preload(){
    this.load.image('enemySheet','assets/enemies.png');
    this.load.image('projectileSheet','assets/projectiles.png');
    this.load.image('homeBackground','assets/home-background.png');
  }
  create(){this.makeFallbacks();this.scene.start('menu')}
  private makeFallbacks(){
    const g=this.add.graphics();
    g.fillStyle(0xa644d5).fillCircle(24,24,22);g.generateTexture('fallbackEnemy',48,48);
    g.clear().fillStyle(0xffd65c).fillCircle(8,8,8);g.generateTexture('fallbackProjectile',16,16);g.destroy();
  }
}
