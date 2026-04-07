import { OpsLayout } from "@/components/ops/OpsLayout";
import { mockReports, type ReportConfig } from "@/data/trustDisputesMockData";
import { cn } from "@/lib/utils";
import { BarChart3, FileText, Download, RefreshCw, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const categoryColors: Record<string, string> = {
  auctions: "bg-blue-100 text-blue-800",
  logistics: "bg-orange-100 text-orange-800",
  finance: "bg-green-100 text-green-800",
  entities: "bg-purple-100 text-purple-800",
  documentation: "bg-teal-100 text-teal-800",
  trust: "bg-red-100 text-red-800",
  platform: "bg-indigo-100 text-indigo-800",
};

const frequencyColors: Record<string, string> = {
  daily: "bg-blue-100 text-blue-800",
  weekly: "bg-purple-100 text-purple-800",
  monthly: "bg-teal-100 text-teal-800",
  on_demand: "bg-muted text-muted-foreground",
};

const formatIcons: Record<string, typeof BarChart3> = {
  table: FileText,
  chart: PieChart,
  mixed: TrendingUp,
};

export default function OpsReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categories = ["all", ...new Set(mockReports.map(r => r.category))];

  const filtered = selectedCategory === "all" ? mockReports : mockReports.filter(r => r.category === selectedCategory);

  return (
    <OpsLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and download operational reports across all modules</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-accent"
              )}
            >
              {cat === "all" ? "All Reports" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((report) => {
            const Icon = formatIcons[report.format] || BarChart3;
            return (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">{report.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", categoryColors[report.category])}>
                      {report.category}
                    </span>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", frequencyColors[report.frequency])}>
                      {report.frequency.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">Last generated: {report.last_generated}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                      <RefreshCw className="h-3 w-3" /> Generate
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
                      <Download className="h-3 w-3" /> CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </OpsLayout>
  );
}
