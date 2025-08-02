// src/lib/subtitles/types.ts

// Interfaces para tipado
export interface SubtitleConfig {
  id?: string;
  text: string;
  duration?: number; // en milisegundos
  allowHtml?: boolean;
  position?: SubtitlePosition;
  style?: SubtitleStyle;
  className?: string;
  animation?: AnimationConfig;
}

export interface SubtitlePosition {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  transform?: string;
  zIndex?: number;
}

export interface SubtitleStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  borderRadius?: string;
  padding?: string;
  maxWidth?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify';
  boxShadow?: string;
  backdropFilter?: string;
  textShadow?: string; // Añadido para el estilo MINIMAL
  letterSpacing?: string; // Añadido para el estilo CINEMA
}

export interface AnimationConfig {
  enter: string; // Clase CSS de entrada
  exit: string;  // Clase CSS de salida
  duration: number; // en milisegundos
}

export interface QueuedSubtitle extends SubtitleConfig {
  delay?: number; // en milisegundos
}

// Para guardar la información del subtítulo activo
export interface ActiveSubtitle {
  element: HTMLElement;
  config: SubtitleConfig;
}