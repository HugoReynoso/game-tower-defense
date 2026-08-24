import {SixMapSelectScene} from './SixMapSelectScene';

export class BalancedMapSelectScene extends SixMapSelectScene{
  create(){
    super.create();
    const values=[['120 ❤️  •  575 gold',390],['95 ❤️  •  500 gold',640],['70 ❤️  •  410 gold',890]] as const;
    values.forEach(([label,x])=>{
      this.add.rectangle(x,546,190,22,0x24483a).setDepth(8);
      this.add.text(x,546,label,{fontSize:'13px',color:'#d8eadf'}).setOrigin(.5).setDepth(9);
    });
  }
}
