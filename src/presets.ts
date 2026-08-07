import type { LyricLine } from './srtParser';

export interface Preset {
  id: string;
  title: string;
  bpm: number;
  lyrics: LyricLine[];
}

export const PRESETS: Preset[] = [
  {
    id: 'cyber',
    title: '電脳サイバーパルス',
    bpm: 140,
    lyrics: [
      { id: '1', time: 1500,  end: 3000,  text: '電脳の波に' },
      { id: '2', time: 3000,  end: 4500,  text: '乗り越えろ' },
      { id: '3', time: 4500,  end: 6000,  text: 'CYBER' },
      { id: '4', time: 6000,  end: 7500,  text: '光の彼方' },
      { id: '5', time: 7500,  end: 9000,  text: '撃ち抜け' },
      { id: '6', time: 9000,  end: 10500, text: 'FEVER！' },
      { id: '7', time: 10500, end: 12000, text: '加速する鼓動' },
      { id: '8', time: 12000, end: 13500, text: 'BEAT DROP' },
      { id: '9', time: 13500, end: 15000, text: '爆発' },
      { id: '10', time: 15000, end: 16500, text: '無限のコンボ' },
      { id: '11', time: 16500, end: 18000, text: 'OVERDRIVE' },
      { id: '12', time: 18000, end: 19500, text: '夜を貫く弾丸' },
      { id: '13', time: 19500, end: 21000, text: 'AMULISH' },
      { id: '14', time: 21000, end: 22500, text: '疾風のリズム' },
      { id: '15', time: 22500, end: 24000, text: '終わりなき戦い' },
    ],
  },
  {
    id: 'voyage',
    title: '星海ヴォイジャー',
    bpm: 120,
    lyrics: [
      { id: '1', time: 2000,  end: 4000,  text: '星の海を越えて' },
      { id: '2', time: 4000,  end: 6000,  text: 'VOYAGE' },
      { id: '3', time: 6000,  end: 8000,  text: 'サテライト' },
      { id: '4', time: 8000,  end: 10000, text: '彼方へ' },
      { id: '5', time: 10000, end: 12000, text: '光速の旅' },
      { id: '6', time: 12000, end: 14000, text: 'NOVA' },
      { id: '7', time: 14000, end: 16000, text: '銀河の果て' },
      { id: '8', time: 16000, end: 18000, text: '夢の軌跡' },
      { id: '9', time: 18000, end: 20000, text: 'STAR' },
      { id: '10', time: 20000, end: 22000, text: 'BLAST OFF' },
    ],
  },
  {
    id: 'groove',
    title: 'ネオン・グルーヴ',
    bpm: 128,
    lyrics: [
      { id: '1', time: 1000,  end: 2500,  text: 'GROOVE' },
      { id: '2', time: 2500,  end: 4000,  text: 'ネオンの街' },
      { id: '3', time: 4000,  end: 5500,  text: '踊り続けろ' },
      { id: '4', time: 5500,  end: 7000,  text: 'BOUNCE' },
      { id: '5', time: 7000,  end: 8500,  text: '夜は終わらない' },
      { id: '6', time: 8500,  end: 10000, text: 'FEVER ZONE' },
      { id: '7', time: 10000, end: 11500, text: 'リズムに溺れろ' },
      { id: '8', time: 11500, end: 13000, text: 'DROP IT' },
      { id: '9', time: 13000, end: 14500, text: '炸裂' },
      { id: '10', time: 14500, end: 16000, text: 'AMULISH!' },
    ],
  },
];
