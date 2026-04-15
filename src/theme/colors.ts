/**
 * anchor — カラーシステム
 * ダークネイビー + シャンパンゴールドのプレミアムテーマ
 */
export const colors = {
  // 背景レイヤー
  bgBase: '#07111f',
  bgDeep: '#0a1729',
  bgSurface: '#0f1e33',
  bgElevated: '#13243c',

  // 境界線
  border: '#1b304d',
  borderSoft: '#172c48',

  // テキスト
  textPrimary: '#e8ecf2',
  textBody: '#b8c4d4',
  textMuted: '#6c7f98',
  textFaint: '#4a5a73',

  // アクセント（シャンパンゴールド）
  accent: '#d4b876',
  accentSoft: '#b89e5e',
  accentDeep: '#8f7840',
  accentGlow: 'rgba(212,184,118,0.12)',
  accentAlpha: (alpha: number) => `rgba(212,184,118,${alpha})`,

  // セカンダリー
  blue: '#6b93c7',
  blueSoft: 'rgba(107,147,199,0.15)',

  // アクション
  like: '#7cb893',
  nope: '#c77a85',
  super: '#8ba8d0',

  // 透過
  white: '#ffffff',
  whiteAlpha: (alpha: number) => `rgba(255,255,255,${alpha})`,
  blackAlpha: (alpha: number) => `rgba(7,17,31,${alpha})`,
} as const;

export type Colors = typeof colors;
