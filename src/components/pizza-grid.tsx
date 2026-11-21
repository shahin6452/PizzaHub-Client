"use client";
import { useEffect, useState } from "react";
import { PizzaCard } from "@/components/pizza-card";
import { samplePizzas } from "@/lib/data";
import { api } from "@/lib/api";
import type { Pizza } from "@/lib/types";
export function PizzaGrid({ limit=6, category, search="" }: { limit?: number; category?: string; search?: string }) {
 const [items,setItems]=useState<Pizza[]>(samplePizzas); const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;const params=new URLSearchParams({limit:String(limit)});if(category&&category!=="All")params.set("category",category);if(search)params.set("search",search);api<{items:Pizza[]}>(`/api/menu?${params}`).then(r=>{if(active&&Array.isArray(r.items))setItems(r.items)}).catch(()=>{}).finally(()=>active&&setLoading(false));return()=>{active=false}},[limit,category,search]);
 return <>{loading&&<p className="muted small">Loading fresh picks…</p>}<div className="pizza-grid">{items.slice(0,limit).map(item=><PizzaCard key={item._id} item={item}/>)}</div></>
}
