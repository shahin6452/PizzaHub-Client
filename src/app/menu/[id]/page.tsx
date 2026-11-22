"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Star, ShoppingBag, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { samplePizzas } from "@/lib/data";
import type { Pizza } from "@/lib/types";
import { authClient } from "@/lib/auth-client";
import { imageUrl, money } from "@/lib/utils";

export default function MenuDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending: authPending } = authClient.useSession();
  const account = session?.user as { id?: string; role?: string; isBlocked?: boolean } | undefined;
  const [item, setItem] = useState<Pizza | undefined>(samplePizzas.find(p => p._id === id));
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account?.isBlocked) router.replace("/blocked");
    if (!authPending && !session) router.replace(`/sign-in?callbackURL=${encodeURIComponent(`/menu/${id}`)}`);
  }, [authPending, session, id, router, account?.isBlocked]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    api<{ item: Pizza }>(`/api/menu/${id}`)
      .then(r => {
        setItem(r.item);
        setActiveImage(0);
      })
      .catch(e => {
        setItem(undefined);
        setError(e instanceof Error ? e.message : "Could not load this menu item.");
      })
      .finally(() => setLoading(false));
  }, [id, session]);

  async function order(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedAddress = address.trim();

    if (!trimmedAddress) {
      setError("Please enter your delivery address.");
      return;
    }

    if (trimmedAddress.length > 500) {
      setError("Delivery address cannot exceed 500 characters.");
      return;
    }

    setBusy(true);

    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          itemId: id,
          deliveryDate: date,
          deliveryAddress: trimmedAddress,
          message: message.trim(),
        }),
      });
      router.push("/dashboard/orders?created=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  }

  if (authPending || !session) return <main className="container page-shell"><div className="loading-block">Checking your account…</div></main>;
  if (account?.isBlocked) return <main className="container page-shell"><div className="loading-block">Redirecting…</div></main>;
  if (loading) return <main className="container page-shell"><div className="loading-block">Loading pizza details…</div></main>;
  if (!item) return <main className="container page-shell"><div className="empty-state"><h2>Menu item not found</h2><p>{error || "This item may no longer be available."}</p><Link href="/browse" className="btn btn-primary">Back to menu</Link></div></main>;

  const images = item.images?.length ? item.images : [];
  const reviews = item.reviews || [];
  const canOrder = account?.role === "customer" || (account?.role === "vendor" && account.id !== item.vendorId);

  return <main className="container page-shell">
    <Link href="/browse" className="back-link"><ArrowLeft size={16}/> Back to menu</Link>
    <div className="detail-grid">
      <div className="detail-gallery">
        {images[activeImage] && <img src={imageUrl(images[activeImage])} alt={item.itemName}/>}
        {images.length > 1 && <div className="detail-thumbs">{images.map((src,index)=><button type="button" key={`${src}-${index}`} className={index===activeImage?"active":""} onClick={()=>setActiveImage(index)} aria-label={`View image ${index+1}`}><img src={imageUrl(src)} alt=""/></button>)}</div>}
        <div className="detail-gallery-note"><ShieldCheck/> Only approved and available menu items can be ordered.</div>
      </div>
      <div className="detail-info">
        <span className="category-tag">{item.category}</span><h1>{item.itemName}</h1>
        <div className="detail-meta"><span><Star fill="currentColor"/>{item.rating?.toFixed(1) || "New"} ({item.reviewCount || 0} reviews)</span><span><MapPin/>{item.location}</span></div>
        <strong className="detail-price">{money(item.price)}</strong><p>{item.description}</p>
        <div className="vendor-panel"><span className="vendor-mark">🍕</span><div><strong>{item.vendorInfo?.name || item.vendorName || "Local pizza kitchen"}</strong><small>Restaurant partner · {item.isPremiumVendor ? "Premium vendor" : "Community vendor"}</small>{item.vendorInfo?.description&&<small>{item.vendorInfo.description}</small>}{item.vendorInfo?.location&&<small><MapPin size={12} style={{display:"inline"}}/> {item.vendorInfo.location}</small>}{item.vendorInfo?.phone&&<small>{item.vendorInfo.phone}</small>}</div></div>
        {canOrder ? <form className="order-form" onSubmit={order}>
          <h3>Plan your delivery</h3>
          <label>Delivery date<input required type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={e=>setDate(e.target.value)}/></label>
          <label>Delivery address<textarea required rows={2} maxLength={500} value={address} onChange={e=>setAddress(e.target.value)} placeholder="House, road, area, city"/></label>
          <label>Special instructions <span className="muted">(optional)</span><textarea rows={2} maxLength={1000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Anything the kitchen should know?"/></label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary btn-full" disabled={busy}><ShoppingBag size={17}/>{busy ? "Placing order…" : "Place order · " + money(item.price)}</button>
          <small className="form-hint">No online payment is required for pizza orders in this assignment.</small>
        </form> : <div className="order-form"><h3>Ordering unavailable</h3><p className="form-hint">{account?.role === "admin" ? "Admin accounts cannot place customer orders." : "Restaurant owners cannot order their own menu items."}</p></div>}
      </div>
    </div>
    <section className="detail-reviews"><div className="section-heading"><div><span className="section-kicker">CUSTOMER FEEDBACK</span><h2>Reviews & <em>ratings.</em></h2></div><span className="category-tag">{item.rating?.toFixed(1) || "New"} ★ · {item.reviewCount || 0} reviews</span></div>
      {reviews.length ? <div className="review-list">{reviews.slice().sort((a,b)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()).map((review,index)=><article className="review-item" key={`${review.customerName}-${index}`}><div className="review-item-head"><strong>{review.customerName || "PizzaHub customer"}</strong><span>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span></div><p>{review.comment}</p></article>)}</div> : <p className="empty-reviews">No reviews yet. Customers who have had an accepted order can share their experience.</p>}
    </section>
  </main>;
}