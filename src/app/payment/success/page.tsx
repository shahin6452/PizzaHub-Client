"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";import { CheckCircle2 } from "lucide-react";
export default function PaymentSuccess(){const router=useRouter();const {data:session,isPending}=authClient.useSession();const role=(session?.user as {role?:string}|undefined)?.role;useEffect(()=>{if(!isPending&&!session)router.replace("/sign-in");else if(role&&role!=="vendor")router.replace(`/dashboard/${role}`)},[isPending,session,router,role]);if(isPending||!session||role!=="vendor")return <main className="container page-shell"><div className="loading-block">Checking payment session…</div></main>;return <main className="container page-shell"><div className="payment-result"><span className="payment-result-icon success"><CheckCircle2/></span><span className="section-kicker">PAYMENT RETURNED</span><h1>Thanks for <em>upgrading.</em></h1><p>Stripe has redirected you back. Your Premium plan becomes active only after our server verifies the payment webhook.</p><Link className="btn btn-primary" href="/dashboard/vendor">Go to vendor dashboard</Link></div></main>}
