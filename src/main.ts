import Phaser from 'phaser';
import './style.css';
import {BootScene} from './game/scenes/BootScene';
import {MenuScene} from './game/scenes/MenuScene';
import {BalancedMapSelectScene} from './game/scenes/BalancedMapSelectScene';
import {SettingsScene} from './game/scenes/SettingsScene';
import {CampaignGameScene} from './game/scenes/CampaignGameScene';

new Phaser.Game({
  type:Phaser.AUTO,
  parent:'app',
  backgroundColor:'#10291f',
  dom:{createContainer:true},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:1280,height:720,fullscreenTarget:'app'},
  scene:[BootScene,MenuScene,BalancedMapSelectScene,SettingsScene,CampaignGameScene],
  render:{antialias:true,roundPixels:false},
});
