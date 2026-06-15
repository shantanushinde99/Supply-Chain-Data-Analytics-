"use client";

import { useState, useEffect } from "react";
import { queryExplore, fetchExploreFilters, generateExploreStory } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, Loader2, Award, AlertTriangle, ArrowLeftRight, Activity, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Explore() {
  const [filters, setFilters] = useState<any>(null);
  
  // Selection States
  const [selectedMetric, setSelectedMetric] = useState("Revenue generated");
  const [selectedDimension, setSelectedDimension] = useState("Supplier name");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState("All");
  
  // Data States
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<any>(null);
  const [storyLoading, setStoryLoading] = useState(false);

  useEffect(() => {
    fetchExploreFilters().then(setFilters).catch(console.error);
  }, []);

  const fetchChartData = async () => {
    if (!filters) return;
    setLoading(true);
    setStory(null); // Clear story when data changes
    const reqData = {
      metric: selectedMetric,
      dimension: selectedDimension,
      suppliers: selectedSupplier !== "All" ? [selectedSupplier] : null,
      regions: selectedRegion !== "All" ? [selectedRegion] : null,
      products: selectedProduct !== "All" ? [selectedProduct] : null
    };
    try {
      const res = await queryExplore(reqData);
      setData(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [selectedMetric, selectedDimension, selectedSupplier, selectedRegion, selectedProduct, filters]);

  const handleGenerateStory = async () => {
    setStoryLoading(true);
    setStory(null);
    const reqData = {
      metric: selectedMetric,
      dimension: selectedDimension,
      suppliers: selectedSupplier !== "All" ? [selectedSupplier] : null,
      regions: selectedRegion !== "All" ? [selectedRegion] : null,
      products: selectedProduct !== "All" ? [selectedProduct] : null
    };
    try {
      const res = await generateExploreStory(reqData);
      setStory(res.story || { error: "No story could be generated." });
    } catch (e) {
      setStory({ error: "Failed to generate data story." });
    } finally {
      setStoryLoading(false);
    }
  };

  if (!filters) return <div className="p-8 text-neutral-400 animate-pulse">Loading filters...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Exploration</h1>
          <p className="text-neutral-400 mt-1">Slice and cross-filter your supply chain data.</p>
        </div>
        <button
          onClick={handleGenerateStory}
          disabled={storyLoading || data.length === 0}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {storyLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {storyLoading ? "Analyzing Data..." : "Generate AI Story"}
        </button>
      </div>

      <Card className="bg-neutral-900/80 border-neutral-800">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Metric</label>
            <select 
              className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value)}
            >
              {filters.metrics.map((m: string) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Group By</label>
            <select 
              className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedDimension}
              onChange={e => setSelectedDimension(e.target.value)}
            >
              {filters.dimensions.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Supplier</label>
            <select 
              className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
            >
              <option value="All">All Suppliers</option>
              {filters.suppliers.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Location</label>
            <select 
              className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
            >
              <option value="All">All Locations</option>
              {filters.regions.map((r: string) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Product Type</label>
            <select 
              className="bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-neutral-200 outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
            >
              <option value="All">All Products</option>
              {filters.products.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`transition-all duration-500 ${story ? 'col-span-1 lg:col-span-3' : 'col-span-1 lg:col-span-3'}`}>
          <CardHeader>
            <CardTitle>{selectedMetric} by {selectedDimension}</CardTitle>
          </CardHeader>
          <CardContent className="h-96">
            {loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
                <Loader2 className="animate-spin w-8 h-8" />
                <p>Crunching numbers...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                <p>No data found for this combination of filters.</p>
                <p className="text-sm">Try adjusting your slicers.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey={selectedDimension} stroke="#888" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                  <YAxis stroke="#888" tickLine={false} axisLine={false} tick={{fontSize: 12}} tickFormatter={(value) => new Intl.NumberFormat('en-US', {notation: "compact"}).format(value)} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px'}}
                    formatter={(value: any) => new Intl.NumberFormat('en-US').format(value)} 
                  />
                  <Bar dataKey={selectedMetric} fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <AnimatePresence>
          {story && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="col-span-1 lg:col-span-3"
            >
              <Card className="bg-neutral-900 border-indigo-900/50 shadow-lg shadow-indigo-900/20">
                <CardContent className="p-6">
                  {story.error ? (
                    <div className="text-red-400 p-4 bg-red-950/20 rounded-lg border border-red-900/50">
                      {story.headline && <h3 className="font-bold mb-2">{story.headline}</h3>}
                      {story.error}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex gap-4 items-start pb-6 border-b border-neutral-800">
                        <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400 mt-1">
                          <Sparkles size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                            {story.headline}
                          </h2>
                          <div className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
                            AI Executive Summary
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                          <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Award size={16} /> <span className="text-xs font-semibold uppercase">Top Performer</span>
                          </div>
                          <div className="text-lg font-bold text-white">{story.best_performer?.name}</div>
                          <div className="text-2xl font-black text-emerald-400">{story.best_performer?.value}</div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                          <div className="flex items-center gap-2 text-rose-400 mb-2">
                            <AlertTriangle size={16} /> <span className="text-xs font-semibold uppercase">Lowest Performer</span>
                          </div>
                          <div className="text-lg font-bold text-white">{story.worst_performer?.name}</div>
                          <div className="text-2xl font-black text-rose-400">{story.worst_performer?.value}</div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                          <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <ArrowLeftRight size={16} /> <span className="text-xs font-semibold uppercase">Performance Gap</span>
                          </div>
                          <div className="text-sm text-neutral-400 mb-1">Difference between Top & Bottom</div>
                          <div className="text-2xl font-black text-blue-400">{story.gap}</div>
                        </div>

                        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                          <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <Activity size={16} /> <span className="text-xs font-semibold uppercase">Metric Average</span>
                          </div>
                          <div className="text-sm text-neutral-400 mb-1">Across filtered group</div>
                          <div className="text-2xl font-black text-indigo-400">{story.average}</div>
                        </div>
                      </div>

                      <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-900/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/20 rounded-full text-indigo-400">
                            <Lightbulb size={20} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Recommended Action</div>
                            <div className="text-white font-medium text-base">{story.action}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
