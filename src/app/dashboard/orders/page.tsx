"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { Check, Clock3, Eye, MapPin, Star, X } from "lucide-react";
import { toast } from "sonner";
import { imageUrl, money } from "@/lib/utils";

function Timeline({ status }: { status: string }) {
  const final = status === "accepted" || status === "rejected" || status === "cancelled";
  return <div className="order-timeline"><span className="timeline-step done"><i><Check size={10}/></i><small>Requested</small></span><span className={`timeline-line ${final ? "done" : ""}`}/><span className={`timeline-step ${final ? "done" : "current"} ${status === "rejected" || status === "cancelled" ? "timeline-stop" : ""}`}><i>{status === "rejected" || status === "cancelled" ? <X size={10}/> : final ? <Check size={10}/> : <Clock3 size={10}/>}</i><small>{status === "accepted" ? "Accepted" : status === "rejected" ? "Rejected" : status === "cancelled" ? "Cancelled" : "Awaiting"}</small></span></div>;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function OrdersPage() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Order | null>(null);
  const [details, setDetails] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const path = role === "vendor" ? "/api/vendor/orders" : "/api/orders/my";
      const r = await api<{ orders: Order[] }>(path);
      setOrders(r.orders || []);
      setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load orders"); }
  }
  useEffect(() => { if (role) load(); }, [role]);

  async function action(id: string, status: string) {
    try {
      const path = role === "vendor" ? `/api/vendor/orders/${id}/status` : `/api/orders/${id}/cancel`;
      await api(path, { method: "PATCH", body: JSON.stringify(role === "vendor" ? { status } : {}) });
      toast.success(role === "vendor" ? `Order ${status}` : "Order cancelled");
      if (details?._id === id) setDetails(null);
      await load();
    } catch (e) { const message=e instanceof Error?e.message:"Action failed";setError(message);toast.error(message); }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault(); if (!review) return; setBusy(true); setError("");
    try {
      await api(`/api/reviews/${review.itemId}`, { method: "POST", body: JSON.stringify({ rating, comment }) });
      setReview(null); setComment(""); setNotice("Thanks! Your review has been submitted."); toast.success("Review submitted");
    } catch (e) { const message=e instanceof Error?e.message:"Could not submit review";setError(message);toast.error(message); }
    finally { setBusy(false); }
  }

  return <>
    <div className="dashboard-heading"><div><span className="section-kicker">ORDER ACTIVITY</span><h1>{role === "vendor" ? "Customer " : "My "}orders.</h1><p>{role === "vendor" ? "Review incoming orders and respond to each request." : "Follow your order requests and manage pending deliveries."}</p></div></div>
    {error && <p className="form-error">{error}</p>}{notice && <p className="success-text">{notice}</p>}
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Order</th><th>Pizza</th><th>{role === "vendor" ? "Customer" : "Restaurant"}</th><th>Delivery date</th><th>Status</th><th>Order timeline</th><th>Actions</th></tr></thead><tbody>
      {orders.length ? orders.map(o => <tr key={o._id}>
        <td>#{o._id.slice(-6)}</td>
        <td><span style={{display:"flex",alignItems:"center",minWidth:145}}><img className="order-row-thumb" src={imageUrl(o.itemImage)} alt=""/>{o.itemName}</span></td>
        <td>{role === "vendor" ? o.customerName : o.vendorName}</td>
        <td>{formatDate(o.deliveryDate)}</td>
        <td><span className={`status status-${o.status}`}>{o.status}</span></td>
        <td><Timeline status={o.status}/></td>
        <td className="action-cell"><button onClick={()=>setDetails(o)}><Eye size={13}/> Details</button>{role === "vendor" && o.status === "pending" ? <><button onClick={()=>action(o._id,"accepted")}>Accept</button><button onClick={()=>action(o._id,"rejected")}>Reject</button></> : role !== "vendor" && o.status === "pending" ? <button onClick={()=>action(o._id,"cancelled")}>Cancel</button> : role !== "vendor" && o.status === "accepted" ? <button onClick={()=>{setReview(o);setRating(5)}}><Star size={13}/> Review</button> : null}</td>
      </tr>) : <tr><td colSpan={7} className="table-empty">No orders to show yet.</td></tr>}
    </tbody></table></div></section>

    {details && <div className="modal-backdrop" onClick={()=>setDetails(null)}><section className="panel order-details-modal" onClick={e=>e.stopPropagation()}>
      <button type="button" className="modal-close" onClick={()=>setDetails(null)} aria-label="Close details"><X/></button>
      <span className="section-kicker">ORDER DETAILS · #{details._id.slice(-6)}</span><h2>{details.itemName}</h2>
      {details.itemImage && <img className="order-details-image" src={imageUrl(details.itemImage)} alt={details.itemName}/>}
      <div className="order-detail-grid">
        <div><small>{role === "vendor" ? "Customer" : "Restaurant"}</small><strong>{role === "vendor" ? details.customerName || "Customer" : details.vendorName || "Restaurant"}</strong></div>
        <div><small>Order status</small><strong className={`status status-${details.status}`}>{details.status}</strong></div>
        <div><small>Delivery date</small><strong>{formatDate(details.deliveryDate)}</strong></div>
        <div><small>Request date</small><strong>{formatDate(details.createdAt)}</strong></div>
        <div><small>Item price</small><strong>{details.itemPrice === undefined ? "—" : money(details.itemPrice)}</strong></div>
        <div><small>Delivery address</small><strong><MapPin size={12} style={{display:"inline",verticalAlign:"middle"}}/> {details.deliveryAddress}</strong></div>
      </div>
      <div className="order-detail-message"><small>Customer message / special instructions</small><p>{details.message?.trim() || "No additional instructions."}</p></div>
      {role === "vendor" && details.status === "pending" && <div className="form-actions"><button className="btn btn-primary" onClick={()=>action(details._id,"accepted")}>Accept order</button><button className="btn btn-outline" onClick={()=>action(details._id,"rejected")}>Reject order</button></div>}
      {role !== "vendor" && details.status === "pending" && <button className="btn btn-outline" onClick={()=>action(details._id,"cancelled")}>Cancel pending order</button>}
      {role !== "vendor" && details.status === "accepted" && <button className="btn btn-primary" onClick={()=>{setReview(details);setDetails(null);setRating(5)}}><Star size={15}/> Write a review</button>}
    </section></div>}

    {review && <div className="modal-backdrop"><form className="panel review-modal" onSubmit={submitReview}><button type="button" className="modal-close" onClick={()=>setReview(null)}><X/></button><span className="section-kicker">SHARE YOUR EXPERIENCE</span><h2>Rate {review.itemName}</h2><div className="rating-picker">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?"active":""} onClick={()=>setRating(n)}><Star fill="currentColor"/></button>)}</div><label>Your review<textarea required minLength={3} maxLength={700} rows={4} value={comment} onChange={e=>setComment(e.target.value)} placeholder="What did you think of this pizza?"/></label><button className="btn btn-primary btn-full" disabled={busy}>{busy?"Submitting…":"Submit review"}</button></form></div>}
  </>;
}
