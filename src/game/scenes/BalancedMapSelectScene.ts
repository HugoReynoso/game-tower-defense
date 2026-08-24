import Phaser from 'phaser';
import {MAPS} from '../config';
import {tr} from '../I18n';
import {SoundManager} from '../SoundManager';

type Difficulty='EASY'|'NORMAL'|'HARD';
type MapId=keyof typeof MAPS;
type Card={id:MapId,border:Phaser.GameObjects.Rectangle,glow:Phaser.GameObjects.Rectangle};

const LOOK:Record<MapId,{top:number,bottom:number,road:number,edge:number,icon:string,label:string,difficulty:string}>={
  'green-valley':{top:0x8fdc69,bottom:0x397d50,road:0xa96d45,edge:0xffda84,icon:'🌲',label:'LUSH KINGDOM',difficulty:'BEGINNER'},
  'sunstone-loop':{top:0xf0c968,bottom:0xa96635,road:0x8e5744,edge:0xffdf83,icon:'☀️',label:'DESERT CITADEL',difficulty:'TACTICAL'},
  'moonlit-marsh':{top:0x5c9c8c,bottom:0x243f55,road:0x685b59,edge:0xb7d2ad,icon:'🌙',label:'HAUNTED WETLAND',difficulty:'TACTICAL'},
  'crystal-cavern':{top:0x657bd1,bottom:0x252b63,road:0x56527a,edge:0x8eeeff,icon:'💎',label:'ARCANE DEPTHS',difficulty:'EXPERT'},
  'volcano-pass':{top:0xb84b32,bottom:0x3a1721,road:0x49363b,edge:0xff8248,icon:'🌋',label:'MOLTEN FORTRESS',difficulty:'EXPERT'},
  'sky-ruins':{top:0x78cfe7,bottom:0x526eb2,road:0xb78b60,edge:0xffefb0,icon:'☁️',label:'FLOATING REALM',difficulty:'MASTER'},
};

export class BalancedMapSelectScene extends Phaser.Scene{
  difficulty:Difficulty='NORMAL';
  map:MapId='green-valley';
  cards:Card[]=[];
  difficultyCards:Array<{id:Difficulty,box:Phaser.GameObjects.Rectangle,line:Phaser.GameObjects.Rectangle,color:number}>=[];
  constructor(){super('map-select')}

  create(){
    const bg=this.add.graphics();
    bg.fillGradientStyle(0x173f32,0x102f27,0x071c18,0x061511).fillRect(0,0,1280,720);
    for(let i=0;i<32;i++)bg.fillStyle(i%3?0xffffff:0x79d6aa,i%3?.025:.04).fillCircle(Phaser.Math.Between(0,1280),Phaser.Math.Between(0,720),Phaser.Math.Between(8,40));
    this.add.text(28,24,`‹ ${tr('home')}`,{fontSize:'17px',fontStyle:'bold',color:'#eaffdf',backgroundColor:'#214b3b',padding:{x:14,y:9}}).setInteractive().on('pointerdown',()=>this.scene.start('menu'));
    this.add.text(640,38,tr('choose'),{fontSize:'32px',fontStyle:'bold',color:'#fff2ad',stroke:'#102d23',strokeThickness:7}).setOrigin(.5);
    this.add.text(640,73,'SELECT A REALM AND PREPARE YOUR DEFENSE',{fontSize:'12px',fontStyle:'bold',color:'#8ed8b5'}).setOrigin(.5);
    (Object.keys(MAPS) as MapId[]).forEach((id,i)=>this.createMapCard(id,230+(i%3)*410,165+Math.floor(i/3)*185));
    this.createDifficulty();
    this.add.rectangle(640,663,310,56,0x07130f,.55);
    const play=this.add.rectangle(640,657,310,56,0xffca4f).setStrokeStyle(3,0xffef9b).setInteractive({useHandCursor:true});
    this.add.text(640,657,`⚔  ${tr('defend')}`,{fontSize:'21px',fontStyle:'bold',color:'#302817'}).setOrigin(.5);
    play.on('pointerover',()=>play.setScale(1.025)).on('pointerout',()=>play.setScale(1)).on('pointerdown',()=>{SoundManager.tone('wave');this.scene.start('game',{map:this.map,difficulty:this.difficulty})});
    this.refreshMaps();this.refreshDifficulty();
  }

  createMapCard(id:MapId,x:number,y:number){
    const look=LOOK[id],map=MAPS[id];
    const shadow=this.add.rectangle(x,y+7,378,166,0x020b08,.62).setOrigin(.5);
    const glow=this.add.rectangle(x,y,384,170,0xffd75d,.12).setOrigin(.5);
    const border=this.add.rectangle(x,y,374,160,0x173b30).setStrokeStyle(2,0x527a68).setOrigin(.5).setInteractive({useHandCursor:true});
    const art=this.add.graphics();
    art.fillGradientStyle(look.top,look.top,look.bottom,look.bottom).fillRoundedRect(x-180,y-73,360,105,15);
    for(let n=0;n<10;n++)art.fillStyle(n%2?0xffffff:look.edge,n%2?.06:.12).fillCircle(x-160+n*36,y-55+(n%3)*22,8+n%4*3);
    this.drawPreviewPath(art,id,x,y-30,look);
    this.add.text(x-158,y-55,look.icon,{fontSize:'26px'}).setOrigin(.5);
    this.add.text(x+157,y-58,look.difficulty,{fontSize:'9px',fontStyle:'bold',color:'#fff',backgroundColor:'#132a23',padding:{x:7,y:4}}).setOrigin(.5);
    this.add.text(x-168,y+49,map.name.toUpperCase(),{fontSize:'18px',fontStyle:'bold',color:'#fff'}).setOrigin(0,.5);
    this.add.text(x-168,y+70,look.label,{fontSize:'10px',fontStyle:'bold',color:'#9fd9bd'}).setOrigin(0,.5);
    this.add.text(x+160,y+59,'SELECT  ›',{fontSize:'11px',fontStyle:'bold',color:'#ffe27a'}).setOrigin(1,.5);
    border.on('pointerover',()=>{border.setScale(1.012);shadow.setScale(1.012)}).on('pointerout',()=>{border.setScale(1);shadow.setScale(1)}).on('pointerdown',()=>{SoundManager.tone('click');this.map=id;this.refreshMaps()});
    this.cards.push({id,border,glow});
  }

  drawPreviewPath(g:Phaser.GameObjects.Graphics,id:MapId,cx:number,cy:number,look:(typeof LOOK)[MapId]){
    const path=MAPS[id].path,minX=Math.min(...path.map(p=>p.x)),maxX=Math.max(...path.map(p=>p.x)),minY=Math.min(...path.map(p=>p.y)),maxY=Math.max(...path.map(p=>p.y));
    const point=(p:{x:number,y:number})=>({x:cx-137+(p.x-minX)/(maxX-minX)*274,y:cy-32+(p.y-minY)/(maxY-minY)*64});
    const first=point(path[0]);
    g.lineStyle(18,0x10231d,.38).beginPath().moveTo(first.x+3,first.y+4);path.slice(1).forEach(p=>{const q=point(p);g.lineTo(q.x+3,q.y+4)});g.strokePath();
    g.lineStyle(14,look.edge).beginPath().moveTo(first.x,first.y);path.slice(1).forEach(p=>{const q=point(p);g.lineTo(q.x,q.y)});g.strokePath();
    g.lineStyle(9,look.road).beginPath().moveTo(first.x,first.y);path.slice(1).forEach(p=>{const q=point(p);g.lineTo(q.x,q.y)});g.strokePath();
    g.fillStyle(0x74e58e).fillCircle(first.x,first.y,5);const last=point(path[path.length-1]);g.fillStyle(0xff6d58).fillCircle(last.x,last.y,5);
  }

  createDifficulty(){
    this.add.text(640,451,tr('difficulty'),{fontSize:'15px',fontStyle:'bold',color:'#9dd9bc'}).setOrigin(.5);
    const data:Array<[Difficulty,number,string,number]>=[['EASY',390,'120 ❤️  •  575 GOLD',0x78dc72],['NORMAL',640,'95 ❤️  •  500 GOLD',0xffc950],['HARD',890,'70 ❤️  •  410 GOLD',0xff715f]];
    data.forEach(([id,x,stats,color])=>{const box=this.add.rectangle(x,516,220,84,0x16382d).setStrokeStyle(2,0x496e5e).setInteractive();const line=this.add.rectangle(x,555,146,4,color);this.add.text(x,495,id,{fontSize:'18px',fontStyle:'bold',color:'#fff'}).setOrigin(.5);this.add.text(x,526,stats,{fontSize:'11px',color:'#cce7da'}).setOrigin(.5);box.on('pointerdown',()=>{SoundManager.tone('click');this.difficulty=id;this.refreshDifficulty()});this.difficultyCards.push({id,box,line,color})});
  }

  refreshMaps(){this.cards.forEach(c=>{const selected=c.id===this.map;c.border.setStrokeStyle(selected?4:2,selected?0xffd75d:0x527a68);c.glow.setVisible(selected)})}
  refreshDifficulty(){this.difficultyCards.forEach(c=>{const selected=c.id===this.difficulty;c.box.setStrokeStyle(selected?4:2,selected?c.color:0x496e5e);c.line.setVisible(selected)})}
}
