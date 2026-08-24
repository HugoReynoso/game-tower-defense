import Phaser from 'phaser';
import {TOWERS} from '../config';
import type {TargetMode,TowerId} from '../types';

export class Tower {
  body: Phaser.GameObjects.Container;
  glyph: Phaser.GameObjects.Text;
  spent: number;
  level = 1;
  mode: TargetMode = 'FIRST';
  cooldown = 0;
  damageBonus = 1;
  rangeBonus = 1;
  rateBonus = 1;

  constructor(public scene: Phaser.Scene, public id: TowerId, public x: number, public y: number) {
    const d = TOWERS[id];
    const shadow = scene.add.ellipse(0, 19, 42, 13, 0x10291e, .28);
    this.glyph = scene.add.text(0, 0, d.frame, {
      fontSize: '43px',
      shadow: {offsetX: 0, offsetY: 5, color: '#132b20', blur: 5, fill: true},
    }).setOrigin(.5);
    this.body = scene.add.container(x, y, [shadow, this.glyph]).setDepth(6).setSize(58, 58).setInteractive();
    this.spent = d.cost;
  }

  get data() { return TOWERS[this.id]; }
  get range() { return this.data.range * this.rangeBonus; }

  upgrade() {
    const cost = Math.round(this.data.cost * (.65 + .25 * this.level));
    this.spent += cost;
    this.level++;
    this.damageBonus *= 1.35;
    this.rateBonus *= 1.15;
    this.rangeBonus *= 1.08;
    const ornaments = [['',''], ['',''], ['✦',''], ['✦','✦'], ['★','★']] as const;
    const [left,right] = ornaments[this.level] || ['',''];
    this.glyph.setText(`${left}${this.data.frame}${right}`);
    this.glyph.setFontSize(43 + this.level * 2);
    this.scene.tweens.add({targets: this.glyph, scale: 1.28, duration: 130, yoyo: true});
    return cost;
  }

  destroy() { this.body.destroy(); }
}
