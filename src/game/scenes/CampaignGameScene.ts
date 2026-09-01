import Phaser from 'phaser';
import {ModernGameScene} from './ModernGameScene';
import {MAPS,PATH,TOWERS,WAVES} from '../config';
import type {TowerId,TargetMode} from '../types';
import type {Tower} from '../entities/Tower';
import {tr} from '../I18n';
import {SoundManager} from '../SoundManager';

type Difficulty='EASY'|'NORMAL'|'HARD';
type MapId=keyof typeof MAPS;

export class CampaignGameScene extends ModernGameScene {
  init(data:{difficulty?:Difficulty;map?:MapId}) {
    super.init(data);
    const balance={EASY:{lives:120,gold:575,hp:1.224},NORMAL:{lives:95,gold:500,hp:1.368},HARD:{lives:70,gold:410,hp:1.584}}[this.difficulty];
    Object.assign(this,{lives:balance.lives,gold:balance.gold,enemyHp:balance.hp});
  }

  create() {
    super.create();
    const e=this.textures.get('enemySheet');
    if(!e.has('ghost')) {
      e.add('ghost',0,0,390,400,390); e.add('firebeast',0,390,390,450,390);
      e.add('swarm',0,840,400,400,360); e.add('mushroom',0,100,790,500,450);
      e.add('golem',0,620,760,620,480);
    }
  }

  drawMap() {
    const themes:Record<MapId,{top:number,bottom:number,road:number,edge:number,water:number,accent:number,detail:number}>={
      'green-valley':{top:0xa9df70,bottom:0x63b954,road:0xb87949,edge:0xf0d087,water:0x43afc5,accent:0x2d7b47,detail:0x78c65c},
      'sunstone-loop':{top:0xf5d77c,bottom:0xc89149,road:0x93624c,edge:0xffdf86,water:0x3f9dbb,accent:0xa46535,detail:0xd8913f},
      'moonlit-marsh':{top:0x6da789,bottom:0x395f61,road:0x665b59,edge:0xaec5a3,water:0x315f7b,accent:0x294c4e,detail:0x5e8c74},
      'crystal-cavern':{top:0x7387cc,bottom:0x303766,road:0x585374,edge:0x8ee9f5,water:0x315f89,accent:0x5445a4,detail:0x59b9d0},
      'volcano-pass':{top:0xb95738,bottom:0x55252a,road:0x49373b,edge:0xff8250,water:0xd94a2c,accent:0x6f2026,detail:0xd65a35},
      'sky-ruins':{top:0x91d4e8,bottom:0x6684bc,road:0x8aa1ad,edge:0xffffff,water:0x6ec8e4,accent:0x45659c,detail:0xd8f5ff},
    };
    const c=themes[this.mapId];
    const base=this.add.graphics();
    base.fillGradientStyle(0x173b30,0x173b30,0x0d2b23,0x0d2b23).fillRect(0,0,1080,620);
    if(this.mapId==='sky-ruins')this.add.image(534,342,'frostpeakBackground').setDisplaySize(1048,538).setDepth(0);
    const g=this.add.graphics();
    if(this.mapId==='sky-ruins')g.fillStyle(0xbcecff,.16).fillRoundedRect(10,74,1048,538,26);else g.fillGradientStyle(c.top,c.top,c.bottom,c.bottom).fillRoundedRect(10,74,1048,538,26);
    for(let i=0;i<28;i++){
      const x=Phaser.Math.Between(25,1040),y=Phaser.Math.Between(90,525),r=Phaser.Math.Between(18,58);
      g.fillStyle(i%3?0xffffff:c.accent,i%3?.045:.07).fillCircle(x,y,r);
    }
    g.fillStyle(c.water,.94).fillRoundedRect(10,540,1048,72,22);
    g.fillGradientStyle(0xffffff,0xffffff,c.water,c.water,.16).fillRoundedRect(20,548,1028,14,7);
    for(let x=35;x<1040;x+=54)g.fillStyle(0xffffff,.13).fillEllipse(x,580+(x%3)*4,28,3);
    g.lineStyle(92,0x132b23,.35).beginPath().moveTo(PATH[0].x+7,PATH[0].y+9);PATH.slice(1).forEach(p=>g.lineTo(p.x+7,p.y+9));g.strokePath();
    g.lineStyle(82,c.edge).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    g.lineStyle(66,c.road).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    g.lineStyle(3,0xffefb0,.55).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    for(let i=0;i<26;i++){
      const x=Phaser.Math.Between(35,1030),y=Phaser.Math.Between(95,520);
      if(this.distanceToPath(x,y)>75){
        if(i%4===0){g.fillStyle(0xffffff,.75).fillCircle(x,y,3);g.fillStyle(0xffda65,.9).fillCircle(x,y,1.5)}
        else {g.fillStyle(0x173e2d,.22).fillEllipse(x+4,y+14,38,12);g.fillStyle(c.accent,.95).fillCircle(x,y,13);g.fillStyle(c.detail,.9).fillCircle(x-8,y-6,11);}
      }
    }
    const decor:Record<MapId,string[]>= {
      'green-valley':['🌲','🌳','🌿'],
      'sunstone-loop':['🌵','🪨','☀️'],
      'moonlit-marsh':['🪷','🌙','🪵'],
      'crystal-cavern':['💎','🔷','🪨'],
      'volcano-pass':['🌋','🔥','🪨'],
      'sky-ruins':['❄️','💎','🌲'],
    };
    const spots=[[80,430],[330,110],[520,390],[705,120],[940,360],[980,500],[520,120]];
    spots.forEach(([x,y],i)=>{if(this.distanceToPath(x,y)>76)this.add.text(x,y,decor[this.mapId][i%3],{fontSize:`${22+(i%3)*4}px`}).setOrigin(.5).setAlpha(.82).setDepth(2)});
    this.add.text(20,90,'⚑ START',{fontSize:'16px',fontStyle:'bold',color:'#fff',backgroundColor:'#287a4b',padding:{x:9,y:6}}).setDepth(3);
    const last=PATH[PATH.length-1];
    this.add.text(Math.min(960,last.x-80),Math.max(88,last.y-50),'🏰 GATE',{fontSize:'16px',fontStyle:'bold',color:'#fff',backgroundColor:'#9b4939',padding:{x:9,y:6}}).setDepth(3);
  }

  createUI() {
    const panel=this.add.graphics().setDepth(20);
    panel.fillGradientStyle(0x285943,0x204a39,0x102a22,0x18372d).fillRoundedRect(1070,8,202,704,25);
    panel.lineStyle(5,0xc4ed78,.9).strokeRoundedRect(1070,8,202,704,25);
    const hud=this.add.graphics().setDepth(20);
    hud.fillStyle(0x173b30,.94).fillRoundedRect(14,12,635,54,18);
    hud.lineStyle(3,0xb6e676,.8).strokeRoundedRect(14,12,635,54,18);
    this.hud=this.add.text(35,39,'',{fontSize:'20px',fontStyle:'bold',color:'#fff4a5'}).setOrigin(0,.5).setDepth(21);
    this.add.text(800,38,`${MAPS[this.mapId].name}  •  ${this.difficulty}`,{fontSize:'15px',fontStyle:'bold',color:'#e8f9d7',backgroundColor:'#315f49',padding:{x:16,y:10}}).setOrigin(.5).setDepth(21);
    this.add.text(1025,38,'Ⅱ',{fontSize:'26px',color:'#382914',backgroundColor:'#ffd154',padding:{x:16,y:7}}).setOrigin(.5).setDepth(21).setInteractive().on('pointerdown',()=>this.togglePause());
    this.add.text(1171,42,'10 GUARDIANS',{fontSize:'15px',fontStyle:'bold',color:'#e9ffc7'}).setOrigin(.5).setDepth(22);
    const ids:TowerId[]=['archer','cannon','frost','fire','lightning','poison','magic','bomb','nature','sun'];
    ids.forEach((id,i)=>{const d=TOWERS[id],col=i%2,row=Math.floor(i/2),x=1122+col*99,y=105+row*92;const card=this.add.rectangle(x,y,88,78,0x315e4a).setStrokeStyle(3,d.color).setDepth(22).setInteractive();this.add.text(x,y-15,d.frame,{fontSize:'25px'}).setOrigin(.5).setDepth(23);this.add.text(x,y+12,d.name.split(' ')[0],{fontSize:'11px',fontStyle:'bold',color:'#fff'}).setOrigin(.5).setDepth(23);this.add.text(x,y+30,`🪙${d.cost}`,{fontSize:'11px',color:'#ffe37a'}).setOrigin(.5).setDepth(23);card.on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();SoundManager.tone('click');this.choose(id)})});
    this.waveBtn=this.add.text(1171,590,`▶ ${tr('start')}`,{fontSize:'15px',fontStyle:'bold',color:'#382913',backgroundColor:'#ffd052',padding:{x:12,y:11}}).setOrigin(.5).setDepth(24).setInteractive().on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();this.startWave()});
    this.add.text(1171,630,'GAME SPEED',{fontSize:'11px',color:'#a9d797'}).setOrigin(.5).setDepth(23);
    [1,2,3].forEach((s,i)=>{const b=this.add.text(1120+i*52,665,`×${s}`,{fontSize:'16px',fontStyle:'bold',color:s===1?'#263015':'#fff',backgroundColor:s===1?'#d9f064':'#315947',padding:{x:9,y:7}}).setOrigin(.5).setDepth(24).setInteractive();this.speedButtons.push(b);b.on('pointerdown',()=>this.setSpeed(s))});
    this.updateHud();
  }

  updateHud(){this.hud?.setText(`❤️ ${this.lives}     🪙 ${this.gold}     WAVE ${Math.max(0,this.wave+1)}/${WAVES.length}     ⚔ ${this.kills}`)}

  selectTower(t:Tower){
    this.cancelPlacement();this.selectedTower=t;this.panel?.destroy();
    const bg=this.add.rectangle(535,657,1040,116,0x142f27,.98).setStrokeStyle(4,t.level>=6?0x8df06b:t.data.color);
    const title=this.add.text(35,625,`${t.data.frame} ${t.data.name}  •  LV ${t.level}`,{fontSize:'20px',fontStyle:'bold',color:'#fff'});
    const stats=this.add.text(35,662,`DMG ${Math.round(t.data.damage*t.damageBonus)}   RANGE ${Math.round(t.range)}   RATE ${(t.data.rate*t.rateBonus).toFixed(2)}/s`,{fontSize:'15px',color:'#d9f1e2'});
    const modes:TargetMode[]=['FIRST','LAST','STRONGEST','WEAKEST','CLOSEST'];
    const target=this.add.text(430,657,`🎯 ${t.mode}`,{fontSize:'16px',color:'#fff',backgroundColor:'#365d4b',padding:{x:11,y:9}}).setOrigin(.5).setInteractive();
    target.on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();t.mode=modes[(modes.indexOf(t.mode)+1)%modes.length];target.setText(`🎯 ${t.mode}`)});
    const cost=Math.round(t.data.cost*(.82+.34*t.level)),maxed=t.level>=6;
    const upgrade=this.add.text(650,657,maxed?'★ MAX LEVEL ★':`⬆ UPGRADE ${cost}g`,{fontSize:'16px',fontStyle:'bold',color:maxed?'#17341e':'#34250e',backgroundColor:maxed?'#8df06b':'#efb83f',padding:{x:12,y:10}}).setOrigin(.5);
    if(!maxed)upgrade.setInteractive().on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();if(this.gold>=cost){this.gold-=t.upgrade();SoundManager.tone('place');this.updateHud();this.selectTower(t)}});
    const sell=this.add.text(850,657,`SELL +${Math.floor(t.spent*.7)}g`,{fontSize:'16px',color:'#fff',backgroundColor:'#a94f47',padding:{x:12,y:10}}).setOrigin(.5).setInteractive();
    sell.on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();this.gold+=Math.floor(t.spent*.7);this.towers.splice(this.towers.indexOf(t),1);t.destroy();this.panel?.destroy();this.updateHud()});
    const close=this.add.text(1020,620,'✕',{fontSize:'20px',color:'#fff'}).setOrigin(.5).setInteractive().on('pointerdown',(p:Phaser.Input.Pointer)=>{p.event.stopPropagation();this.panel?.destroy()});
    this.panel=this.add.container(0,0,[bg,title,stats,target,upgrade,sell,close]).setDepth(50);
  }
}
