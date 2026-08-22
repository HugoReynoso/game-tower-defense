export type EnemyId='slime'|'runner'|'beetle'|'boss';export type TowerId='archer'|'cannon'|'frost';export type TargetMode='FIRST'|'LAST'|'STRONGEST'|'WEAKEST'|'CLOSEST';
export interface EnemyData{hp:number;speed:number;reward:number;lifeDamage:number;armor:number;frame:string;scale:number}
export interface TowerData{name:string;cost:number;damage:number;range:number;rate:number;projectileSpeed:number;splash:number;frame:string;projectile:string;color:number;damageType:'physical'|'magic'}
