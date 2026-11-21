"use client";
import Link from "next/link";
import { Heart, MapPin, Star, Crown, ArrowUpRight } from "lucide-react";
import type { Pizza } from "@/lib/types";
import { imageUrl, money } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
export function PizzaCard({ item }: { item: Pizza }) {
 const [saved,setSaved]=useState(false);
 async function toggle(){try{const r=await api<{saved:boolean}>(`/api/favorites/${item._id}`,{method:"POST"});setSaved(r.saved);toast.success(r.saved?"Added to favourites":"Removed from favourites")}catch(e){toast.error(e instanceof Error?e.message:"Sign in as a customer to save favourites") }}
 return <article className="pizza-card"><div className="pizza-image-wrap"><img src={imageUrl(item.images?.[0])} alt={item.itemName} className="pizza-image"/><button className={`favorite-btn ${saved?"is-saved":""}`} onClick={toggle} aria-label="Add to favorites"><Heart size={18} fill={saved?"currentColor":"none"}/></button>{item.isPremiumVendor&&<span className="premium-tag"><Crown size={12}/> Premium</span>}</div><div className="pizza-card-body"><div className="pizza-card-title"><h3>{item.itemName}</h3><strong>{money(item.price)}</strong></div><span className="category-tag">{item.category}</span><p className="pizza-description">{item.description}</p><div className="pizza-meta"><span><MapPin size={14}/>{item.location}</span><span><Star size={14} fill="currentColor"/>{item.rating?.toFixed(1) || "New"} <small>({item.reviewCount || 0})</small></span></div><div className="pizza-card-foot"><span className="vendor-name">{item.vendorName || "Local restaurant"}</span><Link className="card-link" href={`/menu/${item._id}`}>View details <ArrowUpRight size={15}/></Link></div></div></article>
}
