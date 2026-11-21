"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";import { ArrowLeft } from "lucide-react";
export default function PaymentCancel(){const router=useRouter();const {data:session,isPending}=authClient.useSession();const role=(session?.user as {role?:string}|undefined)?.role;useEffect(()=>{if(!isPending&&!session)router.replace("/sign-in");else if(role&&role!=="vendor")router.replace(`/dashboard/${role}`)},[isPending,session,router,role]);if(isPending||!session||role!=="vendor")return <main className="container page-shell"><div className="loading-block">Checking account…</div></main>;return <main className="container page-shell"><div className="payment-result"><span className="payment-result-icon cancel">×</span><span className="section-kicker">CHECKOUT CANCELLED</span><h1>No worries. <em>Take your time.</em></h1><p>Your subscription has not been changed. You can return to Premium whenever you are ready.</p><Link className="btn btn-primary" href="/subscription"><ArrowLeft size={16}/> Back to plans</Link></div></main>}
