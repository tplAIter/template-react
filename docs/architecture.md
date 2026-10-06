# Application boundaries

app owns the root data router, navigation, route error and not-found behavior. components owns labelled presentation; features/items owns models, CRUD operations, forms and mutations. data owns the injected fetch-compatible transport, unknown-to-model decoders and typed failure classes. hooks owns per-load cancellation and stale completion suppression. Production never imports test/fixtures or stores test data as a backend.

API base is an absolute HTTP(S) URL with no userinfo/query/fragment. Requests are confined relative segments, omit credentials and refuse redirects. Caller AbortSignal follows transport and complete bounded body capture. Successful JSON is decoded explicitly; malformed models, duplicates, oversized bodies and unexpected status/content are refused. UI lifetime cleanup aborts resource/mutation requests; old promises cannot replace newer resource state. Retry is an explicit user action, never an automatic duplicate write.

The item backend contract is GET items -> Item[], POST items -> Item, PUT items/:id -> Item, DELETE items/:id ->204. Item is exactly {id:string,title:string,completed:boolean}, unique IDs in lists, bounded printable title/identity. There is no bundled persistence, authentication service or fabricated production response. Forms retain user text on failure, expose/focus an error summary and disable changes while a mutation is pending. CRUD writes are serialized per mounted page.

All templates are independently authored public MIT source. React is a native-v1 root with no dependencies; the separately proposed Next modifier needs actual published React pins and native composition/lifecycle wiring. Package scripts alone cannot grant source or tool authority.

Item identities use one domain for unknown response decoding and update/delete construction:1–128 ASCII letters, digits, underscore or hyphen. Slash, backslash, dot, percent escapes, query/fragment characters, whitespace and non-ASCII identities are refused at the response boundary instead of presenting unusable CRUD controls. Titles retain their separate printable-text contract. API path confinement and credential omission are unchanged.
