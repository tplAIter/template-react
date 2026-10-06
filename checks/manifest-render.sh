#!/bin/sh
set -eu
: "${CORE_DIR:?reviewed public core checkout required}"
: "${REACT_RENDER_ROOT:?external empty output required}"
source_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
cd "$CORE_DIR"
GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local go run ./cmd/templatecheck --template "$source_root" --output "$REACT_RENDER_ROOT"  --json
