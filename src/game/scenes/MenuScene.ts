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
    shade.fillStyle(0x061b17,.16).fillRect(0,0,1280,720);
    shade.fillGradientStyle(0x071b16,0x071b16,0x061713,0x061713,.05,.84,.08,.96).fillRect(690,0,590,720);
    shade.fillStyle(0x071b16,.76).fillRoundedRect(760,34,480,652,34);
    shade.lineStyle(2,0x8de6bb,.38).strokeRoundedRect(760,34,480,652,34);
    shade.fillStyle(0xffffff,.055).fillRoundedRect(775,49,450,72,24);
    shade.fillStyle(0x8de6bb,.16).fillRoundedRect(790,178,420,52,18);
    shade.lineStyle(1,0x8de6bb,.45).strokeRoundedRect(790,178,420,52,18);
    this.add.text(1000,82,'GREEN VALLEY',{fontSize:'43px',fontStyle:'bold',color:'#fff3b2',stroke:'#18382b',strokeThickness:8,shadow:{offsetX:0,offsetY:5,color:'#061713',blur:6,fill:true}}).setOrigin(.5);
    this.add.text(1000,126,'G U A R D I A N S',{fontSize:'17px',fontStyle:'bold',color:'#8de6bb'}).setOrigin(.5);
    this.add.text(1000,157,'DEFEND  •  UPGRADE  •  SURVIVE',{fontSize:'11px',color:'#c5e9d8'}).setOrigin(.5);
    this.add.text(1000,178,'6 REALMS   •   40 WAVES   •   10 GUARDIANS',{fontSize:'12px',fontStyle:'bold',color:'#dffff0'}).setOrigin(.5);
    if(!this.profile)this.welcome();else this.menu();
  }

  button(y:number,label:string,fn:()=>void,color=0xffcf58){
    const shadow=this.add.rectangle(1000,y+7,350,60,0x020c09,.62).setOrigin(.5);
    const button=this.add.rectangle(1000,y,350,60,color,.96).setStrokeStyle(3,0xffffff,.58).setInteractive({useHandCursor:true});
    const text=this.add.text(1000,y,label,{fontSize:'21px',fontStyle:'bold',color:'#203326'}).setOrigin(.5);
    button.on('pointerover',()=>{button.setScale(1.035);button.setStrokeStyle(4,0xffffff,.9);shadow.setScale(1.035);text.setScale(1.035)})
      .on('pointerout',()=>{button.setScale(1);button.setStrokeStyle(3,0xffffff,.58);shadow.setScale(1);text.setScale(1)})
      .on('pointerdown',()=>{SoundManager.tone('click');fn()});
  }

  welcome(){
    this.add.text(1000,235,'WELCOME, GUARDIAN',{fontSize:'24px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
    this.add.text(1000,273,'Choose a name for your campaign',{fontSize:'15px',color:'#b8dccc'}).setOrigin(.5);
    const el=document.createElement('input');
    el.maxLength=15;el.placeholder='3–15 characters';
    Object.assign(el.style,{font:'600 20px Fredoka',padding:'13px',width:'286px',borderRadius:'13px',border:'2px solid #8de6bb',background:'rgba(7,27,22,.92)',color:'#fff',outline:'none',textAlign:'center',boxShadow:'0 8px 24px rgba(0,0,0,.3)'});
    const dom=this.add.dom(1000,340,el);
    this.button(425,'ENTER THE VALLEY',()=>{const n=el.value.trim();if(n.length<3){el.style.borderColor='#ff6b6b';return}this.profile=SaveManager.create(n);dom.destroy();this.scene.restart()});
    this.add.text(1000,500,'40 WAVES  •  10 GUARDIANS  •  6 MAPS',{fontSize:'13px',fontStyle:'bold',color:'#8de6bb'}).setOrigin(.5);
  }

  menu(){
    this.add.text(1000,235,`LEVEL ${this.profile!.level}   •   XP ${this.profile!.xp}`,{fontSize:'13px',color:'#8de6bb'}).setOrigin(.5);
    this.button(306,`▶  ${tr('play')}`,()=>this.scene.start('map-select'));
    this.button(378,`🏰  ${tr('towers')}`,()=>this.toast('10 guardians unlocked'),0x8fdd68);
    this.button(450,`⭐  ${tr('profile')}`,()=>this.toast(`Victories ${this.profile!.victories}  •  Kills ${this.profile!.totalKills}`),0x69cbe7);
    this.button(522,`⚙  ${tr('settings')}`,()=>this.scene.start('settings'),0xc3a7ec);
    this.add.text(1000,598,'CAMPAIGN PROGRESS',{fontSize:'11px',fontStyle:'bold',color:'#a9cbbb'}).setOrigin(.5);
    this.add.rectangle(1000,624,350,10,0x17382c).setStrokeStyle(1,0x6cb795);
    const progress=Math.min(1,this.profile!.highestWave/40);
    this.add.rectangle(825,624,350*progress,10,0x8de6bb).setOrigin(0,.5);
    this.add.text(1000,650,`BEST WAVE ${this.profile!.highestWave}/40`,{fontSize:'12px',color:'#d5eee3'}).setOrigin(.5);
  }

  toast(message:string){
    const toast=this.add.text(1000,675,message,{fontSize:'15px',align:'center',color:'#fff',backgroundColor:'#0b2b22',padding:{x:16,y:8}}).setOrigin(.5).setDepth(20);
    this.time.delayedCall(1800,()=>toast.destroy());
  }
}
