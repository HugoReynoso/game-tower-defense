import {PreferenceStore} from './Preferences';

export class SoundManager{
  static context:AudioContext|null=null;
  static musicGain:GainNode|null=null;
  static musicStarted=false;
  static gameTrack:HTMLAudioElement|null=null;
  static timer=0;

  static ensure(){
    this.context??=new AudioContext();
    if(this.context.state==='suspended')this.context.resume().catch(()=>undefined);
    return this.context;
  }

  static tone(kind:'click'|'place'|'wave'|'pause'|'shot'='click'){
    const p=PreferenceStore.load();this.startMusic();if(p.mute||p.sfx<=0)return;
    try{
      const c=this.ensure(),o=c.createOscillator(),gain=c.createGain();
      const values={click:[520,.045],place:[260,.09],wave:[660,.16],pause:[180,.12],shot:[380,.035]}[kind];
      o.type=kind==='wave'?'triangle':'sine';o.frequency.setValueAtTime(values[0],c.currentTime);o.frequency.exponentialRampToValueAtTime(values[0]*1.35,c.currentTime+values[1]);
      gain.gain.setValueAtTime(.08*p.sfx,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+values[1]);
      o.connect(gain).connect(c.destination);o.start();o.stop(c.currentTime+values[1]);
    }catch{}
  }

  static startGameMusic(){
    this.stopSynthMusic();
    if(!this.gameTrack){
      this.gameTrack=new Audio('assets/hopeful-documentary.mp3');this.gameTrack.loop=true;this.gameTrack.preload='auto';
      this.gameTrack.dataset.gameMusic='true';this.gameTrack.style.display='none';document.body.appendChild(this.gameTrack);
    }
    this.refreshMusic();this.gameTrack.play().catch(()=>undefined);
  }

  static stopGameMusic(){
    if(!this.gameTrack)return;
    this.gameTrack.pause();this.gameTrack.currentTime=0;this.gameTrack.remove();this.gameTrack=null;
  }

  static startMusic(){
    if(this.gameTrack){this.refreshMusic();this.gameTrack.play().catch(()=>undefined);return}
    if(this.musicStarted){this.refreshMusic();return}
    try{
      const c=this.ensure();this.musicGain=c.createGain();this.musicGain.connect(c.destination);this.musicStarted=true;this.refreshMusic();
      const notes=[220,261.63,329.63,293.66,246.94,329.63,392,293.66];let step=0;
      const play=()=>{
        if(!this.musicStarted)return;
        const p=PreferenceStore.load();
        if(!p.mute&&p.music>0&&this.musicGain){
          const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=notes[step++%notes.length];
          g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.045,c.currentTime+.08);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.7);
          o.connect(g).connect(this.musicGain);o.start();o.stop(c.currentTime+.75);
        }
        this.timer=window.setTimeout(play,760);
      };
      play();
    }catch{}
  }

  static stopSynthMusic(){
    this.musicStarted=false;window.clearTimeout(this.timer);this.musicGain?.disconnect();this.musicGain=null;
  }

  static refreshMusic(){
    const p=PreferenceStore.load(),volume=p.mute?0:p.music;
    if(this.musicGain&&this.context)this.musicGain.gain.setTargetAtTime(volume*.55,this.context.currentTime,.08);
    if(this.gameTrack){this.gameTrack.muted=p.mute;this.gameTrack.volume=Math.min(1,volume*.8)}
  }
}
