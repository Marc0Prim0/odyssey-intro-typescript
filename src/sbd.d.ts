declare module 'sbd' {
    interface SbdOptions {
      newline_boundaries?: boolean;
      html_boundaries?: boolean;
      sanitize?: boolean;
      allowed_tags?: boolean;
      abbreviations?: string[];
    }
  
    export function sentences(text: string, options?: SbdOptions): string[];
  }