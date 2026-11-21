"use client";
import { useEffect } from "react";import { useRouter } from "next/navigation";import { authClient } from "@/lib/auth-client";
export default function DashboardIndex(){const router=useRouter();const {data}=authClient.useSession();const role=(data?.user as {role?:string}|undefined)?.role;useEffect(()=>{if(role)router.replace(`/dashboard/${role}`)},[role,router]);return <div className="loading-block">Opening your dashboard…</div>}
