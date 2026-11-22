
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
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api";

// Profile image with automatic fallback
function ProfileAvatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string;
  className: string;
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <span className={className}>
      {src && !imageError ? (
        <img
          src={src}
          alt={`${name || "User"} profile`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        name?.trim()?.slice(0, 1).toUpperCase() || "P"
      )}
    </span>
  );
}

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

  const user = session?.user as
    | {
        name: string;
        email?: string;
        image?: string | null;
        role?: "vendor" | "customer" | "admin";
        isBlocked?: boolean;
        businessName?: string;
      }
    | undefined;

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

  // Determine which role can access the current route
  const requiredRole =
    path.startsWith("/dashboard/admin")
      ? "admin"
      : path.startsWith("/dashboard/vendor") ||
          path.startsWith("/dashboard/menu-items")
        ? "vendor"
        : path === "/dashboard/customer" ||
            path.startsWith("/dashboard/customer/")
          ? "customer"
          : null;

  const isUnauthorized =
    !!user &&
    (
      (requiredRole !== null && user.role !== requiredRole) ||
      (path === "/dashboard/orders" && role === "admin")
    );

  // Redirect unauthorized users
  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
      return;
    }

    if (user?.isBlocked) {
      router.replace("/blocked");
      return;
    }

    if (isUnauthorized) {
      router.replace(dashboardHref);
    }
  }, [
    isPending,
    session,
    user,
    isUnauthorized,
    dashboardHref,
    router,
  ]);

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

    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message);
      }

      clearAuthTokenCache();

      toast.success("You have been signed out successfully.");

      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not sign out."
      );
    }
  }

  // IMPORTANT: Never render protected page content before role verification
  if (
    isPending ||
    !session ||
    !user ||
    user.isBlocked ||
    isUnauthorized
  ) {
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
          <ProfileAvatar
            src={user?.image}
            name={user?.name}
            className="profile-avatar"
          />

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
      className={path === href.split("#")[0] ? "side-active" : ""}
      onClick={(event) => {
        const hash = href.split("#")[1];

        if (hash && path === href.split("#")[0]) {
          event.preventDefault();

          window.history.pushState(null, "", href);

          document.getElementById(hash)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
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
                <ProfileAvatar
                  src={user?.image}
                  name={user?.name}
                  className="avatar"
                />

                <span>{accountName}</span>

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    profileOpen ? "rotate-180" : ""
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
