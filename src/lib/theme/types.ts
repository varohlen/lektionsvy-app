export const TEXT_WIDGET_FONT_VARIANTS = ["body", "display"] as const;
export const TEXT_WIDGET_BACKGROUND_VARIANTS = [
  "none",
  "surface",
  "primary",
  "warm",
  "success",
  "danger",
] as const;
export const TEXT_WIDGET_COLOR_VARIANTS = [
  "default",
  "inverse",
  "primary",
  "warm",
  "success",
  "danger",
] as const;

export type TextWidgetFontVariant = (typeof TEXT_WIDGET_FONT_VARIANTS)[number];
export type TextWidgetBackgroundVariant = (typeof TEXT_WIDGET_BACKGROUND_VARIANTS)[number];
export type TextWidgetColorVariant = (typeof TEXT_WIDGET_COLOR_VARIANTS)[number];

export type ThemeConfig = {
  schoolName: string;
  pageTitle: string;
  metaDescription: string;
  logos: {
    light: string;
    dark: string;
    aspectRatio: number;
  };
  textWidget: {
    defaultFont: TextWidgetFontVariant;
    defaultBackground: TextWidgetBackgroundVariant;
    defaultColor: TextWidgetColorVariant;
    fontLabels: Record<TextWidgetFontVariant, string>;
    backgroundLabels: Record<TextWidgetBackgroundVariant, string>;
    colorLabels: Record<TextWidgetColorVariant, string>;
  };
  features: {
    trelson: boolean;
  };
};
