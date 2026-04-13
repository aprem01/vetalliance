import { DocGeneratorWizard } from "@/components/doc-generator-wizard";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Document Generator</h1>
        <p className="text-sm text-muted-foreground">Capability statements, past performance narratives, and teaming agreements — drafted by Claude.</p>
      </div>
      <DocGeneratorWizard />
    </div>
  );
}
