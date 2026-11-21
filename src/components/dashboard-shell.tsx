
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    Activity,
    ChevronDown,
    ClipboardList,
    Crown,
    LayoutDashboard,
    LogOut,
    MenuSquare,
    Package,
    Pizza,
    Settings,
    Users,
    Heart,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const menus = {
    vendor: [
        { href: "/dashboard/vendor", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/menu-items", label: "My menu items", icon: Pizza },
        { href: "/dashboard/orders", label: "Customer orders", icon: ClipboardList },
        { href: "/subscription", label: "Subscription", icon: Crown },
        { href: "/profile", label: "Profile settings", icon: Settings },
    ],
    customer: [
        { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/orders", label: "My orders", icon: Package },
        { href: "/dashboard/customer/favorites", label: "Favorites", icon: Heart },
        { href: "/profile", label: "Profile settings", icon: Settings },
    ],
    admin: [
        { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/admin#users", label: "Manage users", icon: Users },
        { href: "/dashboard/admin#menu", label: "Manage menu items", icon: MenuSquare },
        { href: "/dashboard/admin#transactions", label: "Transactions", icon: Activity },
        { href: "/profile", label: "Profile settings", icon: Settings },
    ],
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const path = usePathname();
    const router = useRouter();

    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const { data: session, isPending } = authClient.useSession();

    const user = session?.user as ({
        name: string;
        email?: string;
        image?: string | null;
        role?: "vendor" | "customer" | "admin";
        isBlocked?: boolean;
        businessName?: string;
    } | undefined);

    const role = user?.role || "customer";
    const nav = menus[role] || menus.customer;

    const dashboardHref =
        role === "admin"
            ? "/dashboard/admin"
            : role === "vendor"
                ? "/dashboard/vendor"
                : "/dashboard/customer";

    const accountName =
        role === "vendor"
            ? user?.businessName || user?.name
            : user?.name;

    useEffect(() => {
        if (!isPending && !session) router.replace("/sign-in");

        if (user?.isBlocked) router.replace("/blocked");

        if (user) {
            const required =
                path === "/dashboard/admin"
                    ? "admin"
                    : path === "/dashboard/vendor" || path === "/dashboard/menu-items"
                        ? "vendor"
                        : path === "/dashboard/customer" ||
                            path.startsWith("/dashboard/customer/")
                            ? "customer"
                            : null;

            if (required && user.role !== required) {
                router.replace(`/dashboard/${role}`);
            }

            if (path === "/dashboard/orders" && role === "admin") {
                router.replace("/dashboard/admin");
            }
        }
    }, [isPending, session, user, router, path, role]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setProfileOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setProfileOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function signout() {
        setProfileOpen(false);
        await authClient.signOut();
        router.replace("/");
    }

    if (isPending || !session) {
        return (
            <div className="dashboard-loading">
                <div className="loader" />
                Preparing your workspace…
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <Link href="/" className="brand brand-light">
                    <span className="brand-icon">
                        <Pizza />
                    </span>
                    Pizza<span className="brand-accent">Hub</span>
                </Link>

                <div className="sidebar-profile">
                    <div className="profile-avatar">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" />
                        ) : (
                            user?.name?.slice(0, 1) || "P"
                        )}
                    </div>

                    <div>
                        <strong>{accountName}</strong>
                        <span>{role} account</span>
                    </div>
                </div>

                <p className="sidebar-label">WORKSPACE</p>

                <nav>
                    {nav.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={path === href ? "side-active" : ""}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </nav>

                {role === "vendor" && (
                    <div className="sidebar-premium">
                        <Crown />
                        <strong>Unlock Premium</strong>
                        <p>Publish unlimited menu items and get featured.</p>
                        <Link href="/subscription">Explore plan →</Link>
                    </div>
                )}

                <button className="sidebar-logout" onClick={signout}>
                    <LogOut size={17} />
                    Sign out
                </button>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div>
                        <span className="breadcrumb">PizzaHub / Workspace</span>
                        <strong>{user?.name || "Welcome"}</strong>
                    </div>

                    <div className="topbar-actions">
                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen((previous) => !previous)}
                                aria-expanded={profileOpen}
                                aria-haspopup="true"
                                className="topbar-user flex items-center gap-2 cursor-pointer"
                            >
                                <span className="avatar">
                                    {user?.image ? (
                                        <img src={user.image} alt="Profile" />
                                    ) : (
                                        user?.name?.slice(0, 1) || "P"
                                    )}
                                </span>

                                <span>{accountName}</span>

                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
                                    <div className="border-b border-black/10 px-4 py-3">
                                        <strong className="block text-sm font-semibold text-gray-900">
                                            {accountName}
                                        </strong>
                                        <span className="text-xs capitalize text-gray-500">
                                            {role} Account
                                        </span>
                                    </div>

                                    <div className="p-2">
                                        <Link
                                            href={dashboardHref}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-amber-50"
                                        >
                                            <LayoutDashboard size={17} />
                                            Dashboard
                                        </Link>

                                        <Link
                                            href="/profile"
                                            onClick={() => setProfileOpen(false)}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-amber-50"
                                        >
                                            <Settings size={17} />
                                            Profile settings
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={signout}
                                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-800 transition hover:bg-red-50 hover:text-red-600"
                                        >
                                            <LogOut size={17} />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">{children}</div>
            </main>
        </div>
    );
}
