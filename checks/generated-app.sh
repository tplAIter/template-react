#!/bin/sh
set -eu
: "${APP_ROOT:?existing generated application with separately approved package/runtime closure required}"
cd "$APP_ROOT"
test -f bun.lock || { echo 'LOCK_MISSING: producer-created bun.lock required' >&2; exit 2; }
test -d node_modules || { echo 'PACKAGE_CLOSURE_MISSING: this checker does not install packages' >&2; exit 2; }
# Explicit author execution only; no native action/tool/source grant is inferred.
bun run typecheck
bun run test
bun run lint
bun run build
