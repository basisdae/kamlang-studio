/**
 * Shared design tokens for customer /order and store /orders.
 * Scoped via [data-order-surface] — does not override BI globals.
 */

export const ORDER_THEME_CSS = `
[data-order-surface] {
  --order-bg: #f3f3f0;
  --order-card: #ffffff;
  --order-card-elevated: #ffffff;
  --order-text: #1c1c1a;
  --order-text-muted: #6f6f6a;
  --order-border: #e2e2dc;
  --order-accent: #e7f65b;
  --order-accent-hover: #ddea4f;
  --order-accent-ink: #1c1c1a;
  --order-success: #3d8f5c;
  --order-success-soft: #e8f3ec;
  --order-warning: #c48a1a;
  --order-warning-soft: #f7f0e2;
  --order-error: #c44b4b;
  --order-error-soft: #f8eaea;
  --order-disabled: #b8b8b2;
  --order-disabled-bg: #ecece8;
  --order-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 4px 12px rgb(0 0 0 / 0.04);
  --order-radius: 1rem;
  --order-radius-sm: 0.75rem;
  --order-radius-lg: 1.25rem;
  --order-space-1: 0.25rem;
  --order-space-2: 0.5rem;
  --order-space-3: 0.75rem;
  --order-space-4: 1rem;
  --order-space-5: 1.25rem;
  --order-space-6: 1.5rem;
  --order-highlight: var(--order-accent);
  --order-overlay: rgb(0 0 0 / 0.4);
  --order-hero: #e8ebdf;
  color: var(--order-text);
  background: var(--order-bg);
}

[data-order-surface][data-theme="dark"] {
  --order-bg: #141514;
  --order-card: #1e1f1d;
  --order-card-elevated: #262724;
  --order-text: #f2f2ee;
  --order-text-muted: #9a9a93;
  --order-border: #32332f;
  --order-accent: #e7f65b;
  --order-accent-hover: #f0fa7a;
  --order-accent-ink: #1c1c1a;
  --order-success: #6bc48a;
  --order-success-soft: #1a2e22;
  --order-warning: #e0b35a;
  --order-warning-soft: #2e2818;
  --order-error: #e07878;
  --order-error-soft: #2e1a1a;
  --order-disabled: #6a6a64;
  --order-disabled-bg: #2a2b28;
  --order-shadow: 0 1px 2px rgb(0 0 0 / 0.35), 0 8px 20px rgb(0 0 0 / 0.28);
  --order-overlay: rgb(0 0 0 / 0.55);
  --order-hero: #22241e;
}
`;
