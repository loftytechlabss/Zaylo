import { darkTheme, lightTheme, Theme } from './theme';

export { darkTheme, lightTheme };
export type { Theme };

// Backwards-compatible export
export const colors = darkTheme;
