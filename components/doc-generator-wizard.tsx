"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, FileText } from "lucide-react";

type DocType = "Capability Statement" | "Past Performance Narrative" | "Teaming Agreement Draft" | "Cover Letter";

export function DocGeneratorWizard() {
  const [docType, setDocType] = useState<DocType>("Capability Statement");
  const [companyName, setCompanyName] = useState("Arlington Defense Solutions LLC");
  const [role, setRole] = useState("SDVOSB");
  const [capabilities, setCapabilities] = useState("Cybersecurity, Cloud Migration, DevSecOps");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [mocked, setMocked] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          company: {
            name: companyName,
            role,
            capabilities: capabilities.split(",").map((s) => s.trim()).filter(Boolean),
            pastPerformance: 12,
            bio: `${companyName} is a ${role} providing federal services.`,
          },
          context,
        }),
      });
      const json = await res.json();
      setOutput(json.content || "");
      setMocked(Boolean(json.mocked));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" />Generate Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Document Type</Label>
            <Select value={docType} onChange={(e) => setDocType(e.target.value as DocType)}>
              <option>Capability Statement</option>
              <option>Past Performance Narrative</option>
              <option>Teaming Agreement Draft</option>
              <option>Cover Letter</option>
            </Select>
          </div>
          <div>
            <Label>Company Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>SDVOSB</option>
              <option>VOSB</option>
              <option>Prime</option>
            </Select>
          </div>
          <div>
            <Label>Capabilities (comma-separated)</Label>
            <Input value={capabilities} onChange={(e) => setCapabilities(e.target.value)} />
          </div>
          <div>
            <Label>Additional Context (optional)</Label>
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Targeting VA EHRM opportunity, 8(a) JV with Prime X..." rows={3} />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Output {mocked && <Badge variant="warning">Mocked</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!output && <div className="text-sm text-muted-foreground">Output will appear here.</div>}
          {output && (
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans max-h-[500px] overflow-y-auto">{output}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
