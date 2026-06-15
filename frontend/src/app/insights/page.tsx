"use client";

import { useState, useEffect } from "react";
import { fetchInsights } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertOctagon, Target } from "lucide-react";

export default function Insights() {
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetchInsights().then(setInsights).catch(console.error);
  }, []);

  if (!insights) return <div className="text-neutral-500 animate-pulse">Generating AI business insights...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Generated Insights</h1>
        <p className="text-neutral-400 mt-1">Deterministic business opportunities and risks based on data patterns.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Section icon={TrendingUp} title="Key Findings" items={insights.key_findings} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
          <Section icon={Target} title="Opportunities" items={insights.opportunities} color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
        </div>
        <div className="space-y-6">
          <Section icon={AlertOctagon} title="Supply Chain Risks" items={insights.risks} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
          <Section icon={Lightbulb} title="Executive Recommendations" items={insights.recommendations} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, items, color, bg, border }: any) {
  if (!items || items.length === 0) return null;
  return (
    <Card className={`${bg} ${border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`w-5 h-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item: any, i: number) => (
          <div key={i} className="space-y-1">
            <h4 className="font-semibold text-neutral-200">{item.title}</h4>
            <p className="text-sm text-neutral-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
