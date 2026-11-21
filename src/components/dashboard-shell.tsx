"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Activity, ClipboardList, Crown, LayoutDashboard, LogOut, MenuSquare, Package, Pizza, Settings, Users, Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";
const menus={vendor:[{href:"/dashboard/vendor",label:"Overview",icon:LayoutDashboard},{href:"/dashboard/menu-items",label:"My menu items",icon:Pizza},{href:"/dashboard/orders",label:"Customer orders",icon:ClipboardList},{href:"/subscription",label:"Subscription",icon:Crown},{href:"/profile",label:"Profile settings",icon:Settings}],customer:[{href:"/dashboard/customer",label:"Overview",icon:LayoutDashboard},{href:"/dashboard/orders",label:"My orders",icon:Package},{href:"/dashboard/customer/favorites",label:"Favorites",icon:Heart},{href:"/profile",label:"Profile settings",icon:Settings}],admin:[{href:"/dashboard/admin",label:"Overview",icon:LayoutDashboard},{href:"/dashboard/admin#users",label:"Manage users",icon:Users},{href:"/dashboard/admin#menu",label:"Manage menu items",icon:MenuSquare},{href:"/dashboard/admin#transactions",label:"Transactions",icon:Activity},{href:"/profile",label:"Profile settings",icon:Settings}]};
export function DashboardShell({children}:{children:React.ReactNode}){const path=usePathname();const router=useRouter();const {data:session,isPending}=authClient.useSession();const user=session?.user as ({name:string;email?:string;image?:string|null;role?:"vendor"|"customer"|"admin";isBlocked?:boolean;businessName?:string}|undefined);const role=user?.role||"customer";const nav=menus[role]||menus.customer;
 useEffect(()=>{
  if(!isPending&&!session)router.replace("/sign-in");
  if(user?.isBlocked)router.replace("/blocked");
  if(user){
   const required=path==="/dashboard/admin"?"admin":path==="/dashboard/vendor"||path==="/dashboard/menu-items"?"vendor":path==="/dashboard/customer"||path.startsWith("/dashboard/customer/")?"customer":null;
   if(required&&user.role!==required)router.replace(`/dashboard/${role}`);
   if(path==="/dashboard/orders"&&role==="admin")router.replace("/dashboard/admin");
  }
 },[isPending,session,user,router,path,role]);
 async function signout(){await authClient.signOut();router.replace("/")}
 if(isPending||!session)return <div className="dashboard-loading"><div className="loader"/>Preparing your workspace…</div>;
 return <div className="dashboard-layout"><aside className="dashboard-sidebar"><Link href="/" className="brand brand-light"><span className="brand-icon"><Pizza/></span>Pizza<span className="brand-accent">Hub</span></Link><div className="sidebar-profile"><div className="profile-avatar">{user?.image?<img src={user.image} alt="Profile"/>:(user?.name?.slice(0,1)||"P")}</div><div><strong>{role==="vendor"?(user?.businessName||user?.name):user?.name}</strong><span>{role} account</span></div></div><p className="sidebar-label">WORKSPACE</p><nav>{nav.map(({href,label,icon:Icon})=><Link key={href} href={href} className={path===href?"side-active":""}><Icon size={18}/>{label}</Link>)}</nav>{role === "vendor" && <div className="sidebar-premium"><Crown/><strong>Unlock Premium</strong><p>Publish unlimited menu items and get featured.</p><Link href="/subscription">Explore plan →</Link></div>}<button className="sidebar-logout" onClick={signout}><LogOut size={17}/> Sign out</button></aside><main className="dashboard-main"><header className="dashboard-topbar"><div><span className="breadcrumb">PizzaHub / Workspace</span><strong>{user?.name||"Welcome"}</strong></div><div className="topbar-actions"><Link href="/profile" className="topbar-user"><span className="avatar">{user?.image?<img src={user.image} alt="Profile"/>:(user?.name?.slice(0,1)||"P")}</span><span>{user?.name}</span></Link></div></header><div className="dashboard-content">{children}</div></main></div>
}
