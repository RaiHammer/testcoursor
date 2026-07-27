#!/usr/bin/env bash
# Run widget unit tests and JS syntax checks across projects/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAILED=0

run_check() {
  local label="$1"
  shift
  echo "→ $label"
  if "$@"; then
    echo "  OK"
  else
    echo "  FAIL"
    FAILED=1
  fi
}

# --- df_reviews_slider ---
REVIEWS="$ROOT/projects/df_reviews_slider"
if [[ -f "$REVIEWS/widget/snippet.js" ]]; then
  run_check "reviews: node --check snippet.js" node --check "$REVIEWS/widget/snippet.js"
  if [[ -d "$REVIEWS/widget/tests" ]]; then
    for t in settings.test.js settings-form.test.js layouts.test.js marquee.test.js; do
      [[ -f "$REVIEWS/widget/tests/$t" ]] && \
        run_check "reviews: $t" node "$REVIEWS/widget/tests/$t" || true
    done
  fi
fi

# --- df_quick_search ---
QS="$ROOT/projects/df_quick_search"
if [[ -f "$QS/widget/snippet.js" ]]; then
  run_check "quick-search: node --check snippet.js" node --check "$QS/widget/snippet.js"
  if [[ -d "$QS/widget/tests" ]]; then
    for t in settings.test.js fetch.test.js categories.test.js; do
      [[ -f "$QS/widget/tests/$t" ]] && \
        run_check "quick-search: $t" node "$QS/widget/tests/$t" || true
    done
  fi
fi

# --- df_reviews_slider_gen2 ---
GEN2="$ROOT/projects/df_reviews_slider_gen2"
if [[ -f "$GEN2/widget/snippet.js" ]]; then
  run_check "reviews-gen2: node --check snippet.js" node --check "$GEN2/widget/snippet.js"
fi

echo "---"
if [[ "$FAILED" -eq 0 ]]; then
  echo "All widget checks passed."
  exit 0
else
  echo "Some widget checks failed."
  exit 1
fi
