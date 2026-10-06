# Five generators

| Kind | Prepared outputs | Registration |
| --- | --- | --- |
| component | named TSX component and labelled behavior test | import where needed |
| page | named standalone page and heading test | no implicit route |
| route | named route page | URL /generated/<normalized-name>; lazy route inserted once before CODEGEN:ROUTES |
| feature | model, cancellable list API/hook, loading/error/empty panel and test | explicitly compose into a page |
| api | decoded collection operation and transport test | explicit public backend contract |

Names use the core's actual normalized identifier grammar. Paths/snippets stay within their declared roots. The route insertion consumes exactly one unchanged gen.Context.Marker and retains the original anchor. Two names prepare independently; repeat/normalized-repeat, malformed names and missing anchor must refuse before writes. Runtime ownership/transaction/idempotency and actual CLI/MCP generation require ordinary installed acceptance, not author preflight alone.

Run checks/native-generators.sh against a reviewed public core checkout. It performs default render plus the core's existing generator preflight for all five kinds. No custom materializer, hook, formatter or build process is invoked. Generated-language compilation awaits the approved complete package/runtime closure.

The generated-route namespace is reserved for generator outputs. Items generates /generated/items and leaves the built-in /items CRUD route intact. The actual core snippet-renderer counter covers Items and Reports, retains the marker once and checks the built-in route before rendering. Author snippet preparation is not installed generation or runtime navigation proof.
