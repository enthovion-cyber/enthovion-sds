const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

export const isRTL = (locale: string): boolean => RTL_LANGUAGES.includes(locale);

export const getDir = (locale: string): 'rtl' | 'ltr' => (isRTL(locale) ? 'rtl' : 'ltr');

/** Returns Tailwind class that works for both LTR and RTL */
export const marginStart = (size: string) => `ms-${size}`;
export const paddingStart = (size: string) => `ps-${size}`;

/** Flip a pixel value for RTL */
export const flipForRTL = (value: string, locale: string): string =>
  isRTL(locale) ? `rtl:${value}` : value;

/** Arabic numeral display */
export const toArabicNumerals = (n: number): string =>
  n.toString().replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
