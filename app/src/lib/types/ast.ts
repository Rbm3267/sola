export type SolaASTNodeType = 'path' | 'circle' | 'rect' | 'line' | 'text' | 'g';

export interface SolaASTNode {
  type: SolaASTNodeType;
  /** SVG Attributes like d, cx, cy, fill, stroke, etc. */
  attrs: Record<string, string | number>;
  /** Optional nested children (mostly for <g> groups) */
  children?: SolaASTNode[];
  /** Optional text content for <text> nodes */
  content?: string;
  /** Optional haptic/animation hint for the Sola Engine */
  animationHint?: 'pulse' | 'spin' | 'float' | 'draw' | 'none';
}

export interface SolaAST {
  viewBox: string;
  width?: string | number;
  height?: string | number;
  primitives: SolaASTNode[];
}
