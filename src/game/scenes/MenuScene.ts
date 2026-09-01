import Phaser from 'phaser';
import {SaveManager,type Profile} from '../SaveManager';
import {tr} from '../I18n';
import {SoundManager} from '../SoundManager';

export class MenuScene extends Phaser.Scene{
  profile:Profile|null=null;
  constructor(){super('menu')}

  create(){
    this.profile=SaveManager.load();
    this.add.image(640,360,'homeBackground').setDisplaySize(1280,720);
    const shade=this.add.graphics();
    shade.fillStyle(0x061b17,.12).fillRect(0,0,1280,720);
    shade.fillGradientStyle(0x071b16,0x071b16,0x061713,0x061713,0,.92,.04,.98).fillRect(680,0,600,720);
    shade.fillStyle(0x061914,.82).fillRoundedRect(744,22,500,676,34);
    shade.lineStyle(2,0xa4f0c9,.34).strokeRoundedRect(744,22,500,676,34);
    shade.fillStyle(0xffffff,.055).fillRoundedRect(762,40,464,124,25);
    shade.lineStyle(1,0xffffff,.09).strokeRoundedRect(762,40,464,124,25);
    shade.fillStyle(0x8de6bb,.13).fillRoundedRect(786,181,416,46,16);
    shade.lineStyle(1,0x8de6bb,.35).strokeRoundedRect(786,181,416,46,16);
    this.add.text(994,78,'GREEN VALLEY',{fontSize:'42px',fontStyle:'bold',color:'#fff3b2',stroke:'#18382b',strokeThickness:7,shadow:{offsetX:0,offsetY:5,color:'#061713',blur:7,fill:true}}).setOrigin(.5);
    this.add.text(994,119,'G U A R D I A N S',{fontSize:'17px',fontStyle:'bold',color:'#8de6bb'}).setOrigin(.5);
    this.add.text(994,147,'DEFEND  •  UPGRADE  •  SURVIVE',{fontSize:'10px',fontStyle:'bold',color:'#c5e9d8'}).setOrigin(.5);
    this.add.text(994,204,'6 REALMS     40 WAVES     10 GUARDIANS',{fontSize:'11px',fontStyle:'bold',color:'#dffff0'}).setOrigin(.5);
    if(!this.profile)this.welcome();else this.menu();
  }

  button(y:number,label:string,fn:()=>void,color=0xffcf58){
    const art=this.add.graphics();
    art.fillStyle(0x020c09,.58).fillRoundedRect(-184,-25,368,58,18);
    art.fillStyle(color,.97).fillRoundedRect(-184,-30,368,58,18);
    art.lineStyle(2,0xffffff,.55).strokeRoundedRect(-184,-30,368,58,18);
    art.fillStyle(0xffffff,.2).fillRoundedRect(-168,-22,336,7,4);
    const text=this.add.text(0,-1,label,{fontSize:'19px',fontStyle:'bold',color:'#203326'}).setOrigin(.5);
    const button=this.add.container(994,y,[art,text]).setSize(368,58).setInteractive({useHandCursor:true});
    button.on('pointerover',()=>{button.setScale(1.025);text.setColor('#10241a')})
      .on('pointerout',()=>{button.setScale(1);text.setColor('#203326')})
      .on('pointerdown',()=>{button.setScale(.985);SoundManager.tone('click');fn()});
  }

  welcome(){
    this.add.text(994,259,'CREATE YOUR GUARDIAN',{fontSize:'17px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
    this.add.text(994,287,'Choose a name for your campaign',{fontSize:'13px',color:'#9fcbbb'}).setOrigin(.5);
    const el=document.createElement('input');
    el.maxLength=15;el.placeholder='3–15 characters';
    Object.assign(el.style,{font:'600 20px Fredoka',padding:'13px',width:'286px',borderRadius:'13px',border:'2px solid #8de6bb',background:'rgba(7,27,22,.92)',color:'#fff',outline:'none',textAlign:'center',boxShadow:'0 8px 24px rgba(0,0,0,.3)'});
    const dom=this.add.dom(994,348,el);
    this.button(435,'ENTER THE VALLEY',()=>{const n=el.value.trim();if(n.length<3){el.style.borderColor='#ff6b6b';return}this.profile=SaveManager.create(n);dom.destroy();this.scene.restart()});
    this.add.text(994,510,'YOUR CAMPAIGN IS SAVED ON THIS DEVICE',{fontSize:'11px',fontStyle:'bold',color:'#79b99d'}).setOrigin(.5);
  }

  menu(){
    const card=this.add.graphics();
    card.fillStyle(0xffffff,.055).fillRoundedRect(810,242,368,56,16);
    card.lineStyle(1,0x8de6bb,.28).strokeRoundedRect(810,242,368,56,16);
    this.add.text(834,260,this.profile!.nickname.toUpperCase(),{fontSize:'15px',fontStyle:'bold',color:'#ffffff'}).setOrigin(0,.5);
    this.add.text(1154,260,`LV ${this.profile!.level}  •  ${this.profile!.xp} XP`,{fontSize:'12px',fontStyle:'bold',color:'#8de6bb'}).setOrigin(1,.5);
    this.add.text(834,281,`${this.profile!.victories} VICTORIES  •  ${this.profile!.totalKills} KILLS`,{fontSize:'10px',color:'#9fcbbb'}).setOrigin(0,.5);
    this.button(342,`▶  ${tr('play')}`,()=>this.scene.start('map-select'));
    this.button(410,`🏰  ${tr('towers')}`,()=>this.toast('10 guardians unlocked'),0x8fdd68);
    this.button(478,`⭐  ${tr('profile')}`,()=>this.toast(`Victories ${this.profile!.victories}  •  Kills ${this.profile!.totalKills}`),0x69cbe7);
    this.button(546,`⚙  ${tr('settings')}`,()=>this.scene.start('settings'),0xc3a7ec);
    this.add.text(994,608,'CAMPAIGN PROGRESS',{fontSize:'10px',fontStyle:'bold',color:'#a9cbbb'}).setOrigin(.5);
    this.add.rectangle(994,632,368,10,0x102c22).setStrokeStyle(1,0x6cb795);
    const progress=Math.min(1,this.profile!.highestWave/40);
    this.add.rectangle(810,632,368*progress,10,0x8de6bb).setOrigin(0,.5);
    this.add.text(994,657,`BEST WAVE ${this.profile!.highestWave}/40`,{fontSize:'11px',fontStyle:'bold',color:'#d5eee3'}).setOrigin(.5);
  }

  toast(message:string){
    const toast=this.add.text(994,677,message,{fontSize:'13px',align:'center',color:'#fff',backgroundColor:'#0b2b22',padding:{x:16,y:8}}).setOrigin(.5).setDepth(20);
    this.time.delayedCall(1800,()=>toast.destroy());
  }
}
