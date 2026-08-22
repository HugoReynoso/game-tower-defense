export type Language='it'|'es'|'en';export interface Preferences{language:Language;music:number;sfx:number;mute:boolean;damageNumbers:boolean;screenShake:boolean}
const KEY='green-valley-settings';const defaults:Preferences={language:'it',music:.35,sfx:.65,mute:false,damageNumbers:true,screenShake:true};
export class PreferenceStore{static load():Preferences{try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...defaults}}}static save(v:Preferences){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{}}}
