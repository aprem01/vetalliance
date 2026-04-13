import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Award, PlayCircle } from "lucide-react";

const PATHS = [
  { title: "SDVOSB Certification Fundamentals", desc: "VetCert application, ownership/control tests, and re-certification cadence.", modules: 8, progress: 62, badge: "Starter" },
  { title: "Winning Your First Federal Contract", desc: "SAM.gov registration, capability statement, and first bid strategy.", modules: 12, progress: 30, badge: "Starter" },
  { title: "FAR / DFARS Deep Dive", desc: "FAR 19.14, subcontracting limits, CMMC 2.0, and supply chain clauses.", modules: 14, progress: 0, badge: "Advanced" },
  { title: "Teaming & Joint Ventures", desc: "Mentor-Protégé program, SBA JV approvals, and profit-split modeling.", modules: 9, progress: 0, badge: "Advanced" },
  { title: "Proposal Writing for Feds", desc: "Shipley process, Section L/M alignment, and evaluator-centric writing.", modules: 11, progress: 15, badge: "Core" },
  { title: "Past Performance Strategy", desc: "CPARS management, building PP from subcontracts, narrative frameworks.", modules: 6, progress: 0, badge: "Core" },
];

export default function EducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Education</h1>
        <p className="text-sm text-muted-foreground">Learning paths designed by veteran PMPs and former COs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PATHS.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <GraduationCap className="h-5 w-5 text-gold-400" />
                <Badge variant="secondary">{p.badge}</Badge>
              </div>
              <CardTitle className="text-base mt-2">{p.title}</CardTitle>
              <CardDescription>{p.desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span><BookOpen className="h-3 w-3 inline mr-1" />{p.modules} modules</span>
                <span>{p.progress}%</span>
              </div>
              <Progress value={p.progress} />
              <Button variant="outline" className="w-full" size="sm">
                <PlayCircle className="h-3 w-3" /> {p.progress > 0 ? "Continue" : "Start"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Award className="h-4 w-4 text-gold-400" />Certifications Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Badge variant="success">VetAlliance 101</Badge>
            <Badge variant="secondary">FAR 19.14 Basics (in progress)</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
