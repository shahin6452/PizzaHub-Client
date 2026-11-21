"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Save, Store, UserRound } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const account = session?.user as { role?: string; isBlocked?: boolean; image?: string | null } | undefined;
  const role = account?.role;
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
    if (account?.isBlocked) router.replace("/blocked");
    if (session) {
      setName(session.user.name || "");
      if (role === "vendor") {
        api<{ profile: Record<string, string> }>("/api/vendor/profile").then((r) => {
          setBusinessName(r.profile.businessName || "");
          setBusinessDescription(r.profile.businessDescription || "");
          setBusinessLocation(r.profile.businessLocation || "");
          setBusinessPhone(r.profile.businessPhone || "");
        }).catch(() => undefined);
      }
    }
  }, [isPending, session, role, router, account?.isBlocked]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try {
      if (file) {
        const form = new FormData(); form.append("image", file);
        const uploaded = await api<{ url: string }>("/api/uploads/profile-image", { method: "POST", body: form });
        const imageUpdate = await authClient.updateUser({ image: uploaded.url });
        if (imageUpdate.error) throw new Error(imageUpdate.error.message || "Unable to update profile image.");
      }
      const updated = await authClient.updateUser({ name: name.trim() });
      if (updated.error) throw new Error(updated.error.message || "Unable to update profile.");
      if (role === "vendor") {
        await api("/api/vendor/profile", { method: "PUT", body: JSON.stringify({ businessName, businessDescription, businessLocation, businessPhone }) });
      }
      setFile(null); setSuccess("Profile updated successfully."); toast.success("Profile updated"); router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update profile.";
      setError(message); toast.error(message);
    } finally { setBusy(false); }
  }

  if (isPending || !session) return <main className="container page-shell"><div className="loading-block">Loading profile…</div></main>;

  return <main className="container page-shell"><div className="profile-page">
    <span className="section-kicker">YOUR DETAILS</span><h1>Profile <em>settings.</em></h1>
    <form className="panel profile-form" onSubmit={save}>
      <div className="profile-photo-editor">
        <div className="profile-large">{account?.image ? <img src={account.image} alt="Profile"/> : <UserRound/>}</div>
        <label className="profile-upload"><Camera size={15}/> Update profile image <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
        <small className="form-hint">Optional · JPG, PNG or WEBP · Max 5 MB</small>
      </div>
      <label>Full name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Email address<input disabled value={session.user.email||""}/></label>
      {role === "vendor" && <>
        <div className="form-section-title"><Store size={17}/> Restaurant information</div>
        <label>Restaurant name<input required value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="Your restaurant name"/></label>
        <label>Restaurant location<input value={businessLocation} onChange={e=>setBusinessLocation(e.target.value)} placeholder="Area, city"/></label>
        <label>Contact phone<input value={businessPhone} onChange={e=>setBusinessPhone(e.target.value)} placeholder="+880…"/></label>
        <label>Restaurant description<textarea rows={3} value={businessDescription} onChange={e=>setBusinessDescription(e.target.value)} placeholder="Tell customers about your kitchen"/></label>
      </>}
      <p className="form-hint">Your account role and subscription plan are managed securely by the platform and cannot be changed here.</p>
      {error && <p className="form-error">{error}</p>}{success && <p className="success-text">{success}</p>}
      <button className="btn btn-primary" disabled={busy}><Save size={16}/>{busy?"Saving…":"Save changes"}</button>
    </form>
  </div></main>;
}
