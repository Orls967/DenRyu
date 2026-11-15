import { useMemo } from 'react';
import katex from 'katex';

export function KaTeXFormula({
  latex,
  displayMode = false,
  className = '',
}: {
  latex: string;
  displayMode?: boolean;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return '';
    }
  }, [latex, displayMode]);

  if (!html) {
    return <code className={`font-mono text-xs text-cyan-accent ${className}`}>{latex}</code>;
  }

  return (
    <span
      className={`katex-wrapper overflow-x-auto ${displayMode ? 'block py-1' : 'inline-block'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
