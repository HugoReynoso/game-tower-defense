import Phaser from 'phaser';
import {TOWERS} from '../config';
import type {TargetMode,TowerId} from '../types';

type Part={glyph:string,x?:number,y?:number,size?:number,angle?:number};

const LEVEL_FORMS:Record<TowerId,Part[][]>={
  archer:[[{glyph:'🏹'}],[{glyph:'🏹'},{glyph:'➶',x:7,y:-9,size:22,angle:-12}],[{glyph:'🏹'},{glyph:'➶',x:5,y:-11,size:21,angle:-16},{glyph:'➶',x:10,y:-3,size:20,angle:-5}],[{glyph:'🏰',y:5,size:38},{glyph:'🏹',y:-11,size:27}]],
  cannon:[[{glyph:'💣'}],[{glyph:'💣',x:-6,y:5,size:35},{glyph:'💣',x:7,y:-5,size:35}],[{glyph:'🧨',x:-5,y:4,size:35},{glyph:'💣',x:7,y:-5,size:34}],[{glyph:'🏰',y:5,size:38},{glyph:'💣',y:-13,size:25}]],
  frost:[[{glyph:'❄️'}],[{glyph:'❄️',x:-6,y:4,size:34},{glyph:'❄️',x:7,y:-5,size:32}],[{glyph:'🧊',size:42},{glyph:'❄️',y:-2,size:24}],[{glyph:'🏰',y:6,size:38},{glyph:'🧊',y:-13,size:24}]],
  fire:[[{glyph:'🔥'}],[{glyph:'🔥',x:-6,y:5,size:34},{glyph:'🔥',x:7,y:-5,size:33}],[{glyph:'🌋',size:43},{glyph:'🔥',y:-15,size:22}],[{glyph:'🏰',y:6,size:38},{glyph:'🔥',y:-14,size:25}]],
  lightning:[[{glyph:'⚡'}],[{glyph:'⚡',x:-6,y:4,size:35},{glyph:'⚡',x:7,y:-5,size:34}],[{glyph:'🌩️',size:43},{glyph:'⚡',y:6,size:22}],[{glyph:'🏰',y:6,size:38},{glyph:'⚡',y:-14,size:25}]],
  poison:[[{glyph:'☠️'}],[{glyph:'☠️',x:-6,y:4,size:33},{glyph:'☠️',x:7,y:-5,size:31}],[{glyph:'🧪',size:42},{glyph:'☠️',y:-8,size:20}],[{glyph:'🏰',y:6,size:38},{glyph:'🧪',y:-14,size:24}]],
  magic:[[{glyph:'🔮'}],[{glyph:'🔮',x:-6,y:5,size:34},{glyph:'🔮',x:7,y:-5,size:32}],[{glyph:'🪄',x:-6,y:4,size:36},{glyph:'🔮',x:9,y:-7,size:26}],[{glyph:'🏰',y:6,size:38},{glyph:'🔮',y:-14,size:24}]],
  bomb:[[{glyph:'🧨'}],[{glyph:'🧨',x:-6,y:5,size:34},{glyph:'🧨',x:7,y:-5,size:32}],[{glyph:'💣',x:-6,y:4,size:35},{glyph:'🧨',x:7,y:-6,size:31}],[{glyph:'🏰',y:6,size:38},{glyph:'🧨',y:-14,size:24}]],
  nature:[[{glyph:'🌿'}],[{glyph:'🌿',x:-6,y:5,size:34},{glyph:'🌿',x:7,y:-5,size:32}],[{glyph:'🌵',size:43},{glyph:'🌿',x:8,y:-7,size:21}],[{glyph:'🏰',y:6,size:38},{glyph:'🌳',y:-15,size:24}]],
  sun:[[{glyph:'☀️'}],[{glyph:'☀️',x:-6,y:4,size:34},{glyph:'☀️',x:7,y:-5,size:32}],[{glyph:'🌞',size:43},{glyph:'✨',x:10,y:-10,size:19}],[{glyph:'🏰',y:6,size:38},{glyph:'🌟',y:-14,size:24}]],
};

export class Tower{
  body:Phaser.GameObjects.Container;
  visual:Phaser.GameObjects.Container;
  spent:number;
  level=1;
  mode:TargetMode='FIRST';
  cooldown=0;
  damageBonus=1;
  rangeBonus=1;
  rateBonus=1;

  constructor(public scene:Phaser.Scene,public id:TowerId,public x:number,public y:number){
    const shadow=scene.add.ellipse(0,19,42,13,0x10291e,.28);
    this.visual=scene.add.container(0,0);
    this.body=scene.add.container(x,y,[shadow,this.visual]).setDepth(6).setSize(58,58).setInteractive();
    this.spent=TOWERS[id].cost;
    this.renderLevel();
  }

  get data(){return TOWERS[this.id]}
  get range(){return this.data.range*this.rangeBonus}

  renderLevel(){
    this.visual.removeAll(true);
    const base=LEVEL_FORMS[this.id][Math.min(this.level,4)-1];
    const mastery:Part[]=this.level===5?[{glyph:'◆',x:-14,y:13,size:14}]:this.level>=6?[{glyph:'◆',x:-14,y:13,size:14},{glyph:'◆',x:14,y:13,size:14}]:[];
    [...base,...mastery].forEach(part=>{
      const item=this.scene.add.text(part.x||0,part.y||0,part.glyph,{fontSize:`${part.size||43}px`,shadow:{offsetX:0,offsetY:4,color:'#132b20',blur:4,fill:true}}).setOrigin(.5).setAngle(part.angle||0);
      this.visual.add(item);
    });
  }

  upgrade(){
    const cost=Math.round(this.data.cost*(.82+.34*this.level));
    this.spent+=cost;this.level++;this.damageBonus*=1.35;this.rateBonus*=1.15;this.rangeBonus*=1.08;
    this.renderLevel();
    this.scene.tweens.add({targets:this.visual,scale:1.24,duration:130,yoyo:true});
    return cost;
  }

  destroy(){this.body.destroy()}
}
