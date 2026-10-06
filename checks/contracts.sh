#!/bin/sh
set -eu
: "${CORE_DIR:?reviewed public core checkout required}"
source_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
work=$(mktemp -d "${TMPDIR:-/tmp}/react-contracts.XXXXXXXX")
trap 'rm -rf -- "$work"' EXIT HUP INT TERM
cat > "$work/react83_contract_test.go" <<'GO'
package main
import (
 "bytes"
 "context"
 "crypto/sha256"
 "encoding/hex"
 "encoding/json"
 "errors"
 "os"
 "path/filepath"
 "strings"
 "testing"
 "github.com/tplAIter/tplaiter/internal/blockexport"
 "github.com/tplAIter/tplaiter/internal/exports"
 "github.com/tplAIter/tplaiter/internal/gen"
 "github.com/tplAIter/tplaiter/internal/manifest"
 "github.com/tplAIter/tplaiter/internal/operationtrust"
 "github.com/tplAIter/tplaiter/internal/settings"
)
func TestReact83Contracts(t *testing.T) {
 root:=os.Getenv("REACT_SOURCE")
 read:=func(p string)[]byte{t.Helper();b,e:=os.ReadFile(filepath.Join(root,p));if e!=nil{t.Fatal(e)};return b}
 m:=read("template.manifest.yaml");contract:=read("template.contract.json")
 if _,e:=operationtrust.DecodeNativeContract(contract,m);e!=nil{t.Fatal(e)}
 changed:=append([]byte(nil),m...);changed=append(changed,' ')
 if _,e:=operationtrust.DecodeNativeContract(contract,changed);e==nil{t.Fatal("tampered manifest accepted")}
 for _,name:=range []string{"ui","data","router","packages","spa-build","skills"}{
  raw:=read("exports/react-"+name+".payload.json");p,e:=exports.ParseExportPayload(raw);if e!=nil{t.Fatal(name,e)}
  for _,f:=range p.Files{sum:=sha256.Sum256(read(f.SourcePath));if f.ContentSHA256!="sha256:"+hex.EncodeToString(sum[:]){t.Fatal("file pin",f.SourcePath)}}
  for _,b:=range p.Blocks{sum:=sha256.Sum256(read(b.SourcePath));if b.ContentSHA256!="sha256:"+hex.EncodeToString(sum[:]){t.Fatal("block descriptor pin",b.SourcePath)}}
  var fields map[string]any;if e:=json.Unmarshal(raw,&fields);e!=nil{t.Fatal(e)};fields["authority"]=true;bad,_:=json.Marshal(fields)
  if _,e:=exports.ParseExportPayload(bad);e==nil{t.Fatal("open payload wire accepted")}
 }
 for _,name:=range []string{"ui","data","router"}{
  b,e:=blockexport.Parse(read("block-exports/react-"+name+".yaml"));if e!=nil{t.Fatal(e)}
  if _,e:=blockexport.Resolve([]blockexport.BlockExport{b});e!=nil{t.Fatal(e)}
  for _,target:=range b.Targets{for _,block:=range target.Blocks{if len(read(block.Body))==0{t.Fatal("empty body")}}}
 }
}
func TestReact83GeneratorRefusals(t *testing.T){
 root:=os.Getenv("REACT_SOURCE");out:=filepath.Join(t.TempDir(),"render")
 var report bytes.Buffer
 if e:=runWithPreflight(root,out,"",true,true,&report,&report);e!=nil{t.Fatal(e)}
 tpl,e:=manifest.LoadTemplate(filepath.Join(root,"template.manifest.yaml"));if e!=nil{t.Fatal(e)}
 if len(tpl.Generators)!=5{t.Fatal("five generators required")}
 dirs,e:=os.ReadDir(out);if e!=nil{t.Fatal(e)};if len(dirs)!=1{t.Fatal("one real default render required")};fixture:=filepath.Join(out,dirs[0].Name())
 before,e:=fixtureSnapshot(fixture);if e!=nil{t.Fatal(e)}
 opts:=gen.Options{ProjectRoot:fixture,GeneratorsDir:root,Values:settings.Values{},NoBuild:true,Runner:noExecution{}}
 for _,kind:=range []string{"component","page","route","feature","api"}{
  _,e:=gen.Generate(context.Background(),tpl,kind,"123bad",opts)
  if e==nil||errors.Is(e,gen.ErrExecutionUnavailable){t.Fatal("invalid name reached execution",kind,e)}
 }
 for _,kind:=range []string{"component","page","route","feature","api"}{
  original,e:=gen.Lookup(tpl,kind);if e!=nil{t.Fatal(e)};malformed:=*original
  if malformed.Snippet!=""{malformed.Target="../../escape.tsx"}else{malformed.Targets=append([]manifest.Target(nil),original.Targets...);malformed.Targets[0].Target="../../escape.tsx"}
  if e:=confinedGeneratorPaths(&malformed,"SafeName",opts);e==nil{t.Fatal("malformed target accepted",kind)}
 }
 after,e:=fixtureSnapshot(fixture);if e!=nil{t.Fatal(e)};if len(before)!=len(after){t.Fatal("refusal wrote files")};for p,sum:=range before{if after[p]!=sum{t.Fatal("refusal changed fixture",p)}}
 route:=filepath.Join(fixture,"src/app/routes.tsx");original,e:=os.ReadFile(route);if e!=nil{t.Fatal(e)}
 if e:=os.WriteFile(route,[]byte(strings.ReplaceAll(string(original),"CODEGEN:ROUTES","REMOVED:ROUTES")),0600);e!=nil{t.Fatal(e)}
 negative,e:=fixtureSnapshot(fixture);if e!=nil{t.Fatal(e)}
 _,e=gen.Generate(context.Background(),tpl,"route","SafeRoute",opts)
 if e==nil||errors.Is(e,gen.ErrExecutionUnavailable){t.Fatal("missing anchor reached execution",e)}
 after,e=fixtureSnapshot(fixture);if e!=nil{t.Fatal(e)};if len(negative)!=len(after){t.Fatal("missing anchor wrote files")};for p,sum:=range negative{if after[p]!=sum{t.Fatal("missing anchor changed fixture",p)}}
}
GO
cat > "$work/react83_route_namespace_test.go" <<'GO'
package gen
import("os";"path/filepath";"strings";"testing";"github.com/tplAIter/tplaiter/internal/manifest";"github.com/tplAIter/tplaiter/internal/settings")
func TestReact83RouteNamespace(t *testing.T){root:=os.Getenv("REACT_ROUTE_ROOT");routes,e:=os.ReadFile(filepath.Join(root,"react-files/src/app/routes.tsx"));if e!=nil{t.Fatal(e)};if !strings.Contains(string(routes),"path: 'items'"){t.Fatal("built-in CRUD route missing")};for _,name:=range []string{"Items","Reports"}{ctx,e:=newContext(name,settings.Values{},manifest.ProjectInfo{});if e!=nil{t.Fatal(e)};ctx.Marker="// gen:route:"+ctx.Name.Snake;body,e:=renderTemplateFile(filepath.Join(root,"react-generators/route_wiring.tsx.tmpl"),ctx);if e!=nil{t.Fatal(e)};if !strings.Contains(string(body),"path: 'generated/"+ctx.Name.Kebab+"'"){t.Fatal("generated route not namespaced",name,string(body))};if strings.Contains(string(body),"path: 'items'"){t.Fatal("generated Items shadows builtin")};if strings.Count(string(body),ctx.Marker)!=1{t.Fatal("marker changed")}}}
GO
python3 -B - "$CORE_DIR" "$work" <<'PYTHON'
import json,sys
from pathlib import Path
core=Path(sys.argv[1]).resolve();work=Path(sys.argv[2])
(work/'overlay.json').write_text(json.dumps({'Replace':{str(core/'cmd/templatecheck/react83_contract_test.go'):str(work/'react83_contract_test.go'),str(core/'internal/gen/react83_route_namespace_test.go'):str(work/'react83_route_namespace_test.go')}}))
PYTHON
cd "$CORE_DIR"
REACT_SOURCE="$source_root" GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local go test -overlay "$work/overlay.json" -count=1 -run '^TestReact83(Contracts|GeneratorRefusals)$' -v ./cmd/templatecheck

REACT_ROUTE_ROOT="$source_root" GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local GOFLAGS=-mod=readonly go test -overlay "$work/overlay.json" -count=1 -run '^TestReact83RouteNamespace$' -v ./internal/gen
