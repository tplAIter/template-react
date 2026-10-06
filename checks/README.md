# Author checks

Use a reviewed public core checkout, Go's existing public offline module cache and external fixture roots. These checks never install packages, invoke native hooks or grant runtime authority.

- manifest-render.sh: actual cmd/templatecheck defaults.
- native-generators.sh: actual default render plus all5 existing generator preparation checks, two names/batch/normalized-repeat and unchanged fixture; execution unavailable is explicitly preparation only.
- contracts.sh: exact native-v1 manifest digest, actual closed payload/block parsers and ordering, actual source pins, negative wire and generator name/missing-anchor/no-effect counters. It adds a temporary Go overlay test file only; the core checkout is not written.
- generated-app.sh: later user-authorized package execution against an existing approved frozen artifact/runtime closure. It refuses missing lock/node_modules; it does not install or claim a native Bun grant.

The mandatory bun.lock was produced by Bun1.4.2 through the approved metadata-only registry boundary; one frozen offline check preserved its exact bytes. All resolved registry protocols, dist integrity values and reported licenses were audited against exact-version metadata. Artifact contents and license files were not fetched or verified. Package execution, browser and installed CLI/MCP qualification remain pending; a passing author checker cannot close P12.
