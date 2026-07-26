/**
 * Tangtao order surface tokens — Red / White / Gray / Stainless.
 * Scoped via [data-order-surface] — does not override BI globals.
 * Lemon is not a brand accent here.
 */

export const ORDER_THEME_CSS = `
[data-order-surface] {
  --order-bg: #f4f3ef;
  --order-card: #ffffff;
  --order-card-elevated: #ffffff;
  --order-text: #272727;
  --order-text-muted: #6b6b6b;
  --order-border: #e0dfdb;
  --order-stainless: #a9aaac;
  --order-accent: #d71920;
  --order-accent-hover: #a90f16;
  --order-accent-ink: #ffffff;
  --order-accent-soft: #fce8e9;
  --order-success: #2f9e5b;
  --order-success-soft: #e6f6ec;
  --order-warning: #d4890b;
  --order-warning-soft: #f8efd9;
  --order-error: #b42318;
  --order-error-soft: #fdecea;
  --order-disabled: #9a9a9a;
  --order-disabled-bg: #ecebe7;
  --order-shadow: 0 1px 2px rgb(0 0 0 / 0.05), 0 4px 12px rgb(0 0 0 / 0.04);
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
  --order-overlay: rgb(0 0 0 / 0.45);
  --order-hero: #ebeae6;
  color: var(--order-text);
  background: var(--order-bg);
}

[data-order-surface][data-theme="dark"] {
  --order-bg: #141414;
  --order-card: #1f1f1f;
  --order-card-elevated: #2a2a2a;
  --order-text: #f5f5f5;
  --order-text-muted: #a3a3a3;
  --order-border: #3a3a3a;
  --order-stainless: #8e8f91;
  --order-accent: #d71920;
  --order-accent-hover: #ef2a32;
  --order-accent-ink: #ffffff;
  --order-accent-soft: #3a1518;
  --order-success: #4caf74;
  --order-success-soft: #163222;
  --order-warning: #e0a33a;
  --order-warning-soft: #33260f;
  --order-error: #f07070;
  --order-error-soft: #3a1717;
  --order-disabled: #6e6e6e;
  --order-disabled-bg: #2a2a2a;
  --order-shadow: 0 1px 2px rgb(0 0 0 / 0.4), 0 8px 20px rgb(0 0 0 / 0.3);
  --order-overlay: rgb(0 0 0 / 0.6);
  --order-hero: #222222;
}
`;
