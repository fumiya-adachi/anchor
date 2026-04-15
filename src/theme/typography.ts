/**
 * anchor — タイポグラフィシステム
 * Cormorant Garamond (Serif) for display / Inter (Sans) for body
 */
export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifRegular: 'CormorantGaramond_400Regular',
  serifSemiBold: 'CormorantGaramond_600SemiBold',

  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansLight: 'Inter_300Light',
} as const;

export const typography = {
  // Display (Serif)
  displayLarge: {
    fontFamily: fonts.serif,
    fontSize: 32,
    letterSpacing: 0.5,
    lineHeight: 36,
  },
  displayMedium: {
    fontFamily: fonts.serifRegular,
    fontSize: 24,
    letterSpacing: 0.3,
  },
  brand: {
    fontFamily: fonts.serif,
    fontSize: 28,
    letterSpacing: 2,
  },

  // Body (Sans)
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontFamily: fonts.sans,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 10,
    letterSpacing: 0.3,
  },
} as const;
