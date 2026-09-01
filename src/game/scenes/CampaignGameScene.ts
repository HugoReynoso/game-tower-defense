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
    const themes:Record<MapId,{asset:string,road:number,edge:number,mark:number,tint:number}>={
      'green-valley':{asset:'greenValleyBackground',road:0xb97d4c,edge:0xe7c27b,mark:0x795236,tint:0x79b95d},
      'sunstone-loop':{asset:'sunstoneBackground',road:0xd6a759,edge:0xffdc86,mark:0x9d6d35,tint:0xf0bb5e},
      'moonlit-marsh':{asset:'moonlitBackground',road:0x596767,edge:0x8eb295,mark:0x96b6ae,tint:0x37666a},
      'crystal-cavern':{asset:'crystalBackground',road:0x59627d,edge:0x86e7f0,mark:0x9df6ff,tint:0x4c5ea4},
      'volcano-pass':{asset:'volcanoBackground',road:0x342f35,edge:0xe66739,mark:0xffa04a,tint:0x813127},
      'sky-ruins':{asset:'frostpeakBackground',road:0xb9d4df,edge:0xf5fbff,mark:0xffffff,tint:0xa6d9ec},
    };
    const c=themes[this.mapId];
    const base=this.add.graphics();
    base.fillGradientStyle(0x173b30,0x173b30,0x0d2b23,0x0d2b23).fillRect(0,0,1080,620);
    this.add.image(534,342,c.asset).setDisplaySize(1048,538).setDepth(0);
    const g=this.add.graphics();
    g.fillStyle(c.tint,.09).fillRoundedRect(10,74,1048,538,26);
    g.lineStyle(74,0x101c1a,.38).beginPath().moveTo(PATH[0].x+6,PATH[0].y+8);PATH.slice(1).forEach(p=>g.lineTo(p.x+6,p.y+8));g.strokePath();
    g.lineStyle(64,c.edge).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    g.lineStyle(50,c.road).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    g.lineStyle(2,c.mark,.6).beginPath().moveTo(PATH[0].x,PATH[0].y);PATH.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.strokePath();
    PATH.slice(0,-1).forEach((a,i)=>{const b=PATH[i+1],length=Math.hypot(b.x-a.x,b.y-a.y);for(let d=28;d<length;d+=44){const x=a.x+(b.x-a.x)*d/length,y=a.y+(b.y-a.y)*d/length;if(this.mapId==='crystal-cavern'||this.mapId==='sky-ruins'){g.fillStyle(c.mark,.65).fillCircle(x,y,2.4)}else if(this.mapId==='volcano-pass'){g.lineStyle(2,c.mark,.7).lineBetween(x-4,y-3,x+4,y+3)}else{g.fillStyle(c.mark,.28).fillEllipse(x,y,8,3)}}});
    this.add.text(20,90,'⚑ START',{fontSize:'16px',fontStyle:'bold',color:'#fff',backgroundColor:'#287a4b',padding:{x:9,y:6}}).setDepth(3);
    const last=PATH[PATH.length-1];
    this.add.text(Math.min(960,last.x-80),Math.max(88,last.y-50),'🏰 GATE',{fontSize:'16px',fontStyle:'bold',color:'#fff',backgroundColor:'#9b4939',padding:{x:9,y:6}}).setDepth(3);
  }

  validPlacement(x:number,y:number){
    return x>28&&x<1048&&y>84&&y<602&&this.distanceToPath(x,y)>43&&!this.towers.some(t=>Phaser.Math.Distance.Squared(x,y,t.x,t.y)<2500);
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
