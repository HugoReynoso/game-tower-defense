# Green Valley Guardians

<p align="center"><strong>Un tower defense fantasy originale, mobile-first e giocabile direttamente nel browser.</strong></p>

<p align="center">
  <a href="https://hugoreynoso.github.io/game-tower-defense/"><strong>🎮 Gioca alla demo</strong></a>
  · <a href="#avvio-locale">Avvio locale</a>
  · <a href="#roadmap">Roadmap</a>
</p>

> La demo è ottimizzata per smartphone e tablet. Durante il gameplay è consigliato l'orientamento landscape.

Su dispositivi mobili l'ingresso in partita richiede automaticamente la modalità fullscreen e l'orientamento landscape quando il browser lo permette. In portrait viene mostrato un invito dedicato a ruotare il dispositivo; il layout supporta inoltre le safe area di iPhone e Android.

## Demo online

**[hugoreynoso.github.io/game-tower-defense](https://hugoreynoso.github.io/game-tower-defense/)**

Ogni push su `main` compila e pubblica automaticamente il gioco con GitHub Actions e GitHub Pages.

## Il gioco

Green Valley Guardians è un tower defense web originale ambientato in una valle fantasy. Costruisci guardiani lungo il percorso, scegli le priorità di bersaglio, migliora o vendi le torri e supera dieci ondate fino all'Armored Beetle King.

Il vertical slice offre una partita completa di circa 5–10 minuti:

- mappa originale **Green Valley**;
- 5 torri difensive, 3 nemici e 1 boss;
- 3 mappe originali disponibili fin dall'inizio;
- 10 wave data-driven;
- gold, vite, ricompense e bonus wave;
- proiettili che viaggiano realmente verso il bersaglio;
- danno ad area, armatura e rallentamento;
- upgrade, vendita e 5 priorità di targeting;
- velocità ×1, ×2 e ×3;
- selezione della difficoltà Easy, Normal o Hard prima della partita;
- selezione mappa predisposta per nuovi reami;
- menu pausa con Resume, Restart e ritorno alla Home;
- impostazioni persistenti per musica, SFX, mute, numeri danno e screen shake;
- interfaccia selezionabile in Italiano, Español o English;
- profilo, XP e statistiche salvati localmente;
- vittoria, sconfitta e pausa;
- interfaccia responsive mobile-first.
- gameplay con mappa dominante e barra verticale dei guardiani;

## Torri

| Torre | Costo | Ruolo | Statistiche base |
| --- | ---: | --- | --- |
| Ranger | 75 | Attacco rapido single-target | 14 danni, 155 range, 1.1 attacchi/s |
| Bombard | 165 | Danno fisico ad area | 46 danni, 135 range, splash 62 |
| Frost Crystal | 120 | Controllo e rallentamento | 10 danni, 145 range, slow 25% |
| Ember Shrine | 145 | Danno magico ad area | 28 danni, splash 28 |
| Storm Totem | 195 | Attacco magico a lunga gittata | 38 danni, 165 range |

Ogni torre può usare `FIRST`, `LAST`, `STRONGEST`, `WEAKEST` o `CLOSEST`. Gli upgrade aumentano progressivamente danno, gittata e cadenza; la vendita restituisce il 70% dell'investimento totale.

## Nemici

| Nemico | HP | Velocità | Premio | Caratteristica |
| --- | ---: | ---: | ---: | --- |
| Purple Slime | 70 | 65 | 5 | Unità base bilanciata |
| Runner Lizard | 45 | 125 | 7 | Rapido ma fragile |
| Armored Beetle | 240 | 45 | 15 | Riduce del 25% il danno fisico |
| Armored Beetle King | 2000 | 32 | 250 | Boss della wave 10 |

## Come si gioca

1. Seleziona una torre dalla barra inferiore.
2. Tocca o clicca una posizione libera.
3. Premi **Start Wave**.
4. Tocca una torre per cambiare targeting, migliorarla o venderla.
5. Usa ×1, ×2 o ×3 per regolare la velocità.

La preview verde indica una posizione valida; quella rossa segnala strada, sovrapposizioni o aree fuori mappa. Prima della partita si selezionano Green Valley e la difficoltà: Easy offre più risorse e nemici meno resistenti, Hard riduce vite e gold e aumenta gli HP nemici.

## Specifiche tecniche

- **Engine:** Phaser 3
- **Linguaggio:** TypeScript
- **Build:** Vite
- **Rendering:** WebGL con fallback Canvas
- **Persistenza:** localStorage con gestione sicura dei dati corrotti
- **Deploy:** GitHub Pages tramite GitHub Actions
- **UI:** HTML5/CSS e oggetti Phaser, senza framework pesanti
- **Target:** smartphone, tablet e desktop moderni

L'architettura separa entità, scene, configurazione e persistenza. Statistiche e wave sono data-driven in `src/game/config.ts`.

```text
src/
├── game/
│   ├── entities/       # Enemy, Tower, Projectile
│   ├── scenes/         # Boot, Menu, Game
│   ├── config.ts       # Torri, nemici, wave, percorso
│   ├── SaveManager.ts  # Profilo locale
│   └── types.ts
├── main.ts
└── style.css
```

## Avvio locale

Prerequisiti: Node.js 20+ e pnpm.

```bash
git clone https://github.com/HugoReynoso/game-tower-defense.git
cd game-tower-defense
pnpm install
pnpm run dev
```

### Build di produzione

```bash
pnpm run build
pnpm run preview
```

La build ottimizzata viene generata in `dist/`.

## Estendere il progetto

### Nuovo nemico

1. Estendi `EnemyId` in `src/game/types.ts`.
2. Inserisci le statistiche in `ENEMIES` dentro `src/game/config.ts`.
3. Registra il frame in `GameScene.createFrames()` oppure carica un PNG in `BootScene`.
4. Aggiungilo a una wave.

### Nuova torre

1. Estendi `TowerId`.
2. Aggiungi la configurazione a `TOWERS`.
3. Inserisci il pulsante nella barra di costruzione.
4. Implementa l'eventuale effetto speciale all'impatto.

### Nuova wave

```ts
[
  { enemy: 'slime', count: 20, interval: 700 },
  { enemy: 'runner', count: 5, interval: 500, delay: 1500 },
]
```

Ogni gruppo supporta `enemy`, `count`, `interval` e `delay`.

### Nuova mappa

Modifica `PATH` in `src/game/config.ts`. Movimento, strada, progresso e validazione del piazzamento usano la stessa polilinea.

### Nuovi sprite

Inserisci i file sotto `public/assets/`, caricali in `BootScene.preload()` e usa la chiave Phaser nella configurazione. Le tavole originali correnti sono `enemies.png` e `projectiles.png`.

## Salvataggio e progressione

Il profilo conserva nickname, livello, XP, eliminazioni, partite, vittorie, wave massima e gold complessivo. La chiave localStorage è `green-valley-profile`.

## Roadmap

- rami di upgrade specializzati;
- Fire, Lightning, Poison e Magic Tower;
- Ghost Wisp, Fire Beast, Swarm Bugs, Healer Mushroom e Stone Golem;
- audio e impostazioni complete;
- modalità Endless;
- nuove mappe fantasy;
- autenticazione e classifiche online con Supabase.

## Originalità e asset

Personaggi, nomi, mappa, interfaccia e asset sono originali. Il progetto usa esclusivamente meccaniche generali del genere tower defense e non contiene sprite, audio, mappe, nomi o codice provenienti da altri giochi.

## Release

**v0.1.0 — Vertical Slice**

- partita completa da 10 wave;
- tre torri e tre famiglie di nemici;
- boss finale;
- profilo e progressione locale;
- deploy web automatico.

Verifica della release:

```bash
pnpm run build
```
