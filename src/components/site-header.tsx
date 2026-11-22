
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Menu,
  Moon,
  Pizza,
  ShoppingBag,
  Sun,
  UserRound,
  X,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearAuthTokenCache } from "@/lib/api";

export function SiteHeader() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const user = session?.user as
    | { name: string; image?: string | null; role?: string }
    | undefined;

  const dashboardUrl = user?.role
    ? `/dashboard/${user.role}`
    : "/dashboard";

  async function logout() {
    try {
      const result = await authClient.signOut();

      if (result.error) {
        throw new Error(result.error.message);
      }

      clearAuthTokenCache();

      setProfileOpen(false);
      setOpen(false);

      toast.success("You have been signed out successfully.");

      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not sign out."
      );
    }
  }

  const links = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse Menu" },
  ];

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <Pizza size={25} />
          </span>
          <span>
            Pizza<span className="brand-accent">Hub</span>
          </span>
        </Link>

        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? "nav-active" : ""}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {!user ? (
            <>
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                Sign in
              </Link>

              <Link
                className="btn btn-primary nav-cta"
                href="/sign-up"
                onClick={() => setOpen(false)}
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="profile-dropdown">
              <button
                className="nav-user"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="avatar">
                  {user.image ? (
                    <img src={user.image} alt="Profile" />
                  ) : (
                    <UserRound size={16} />
                  )}
                </span>

                <span>{user.name}</span>
                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown-menu" role="menu">
                  <div className="profile-menu-heading">
                    <strong>{user.name}</strong>
                    <small>{user.role || "customer"} account</small>
                  </div>

                  <Link
                    href={dashboardUrl}
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      setOpen(false);
                    }}
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <Link
                    href="/profile"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      setOpen(false);
                    }}
                  >
                    <Settings size={16} />
                    Profile settings
                  </Link>

                  <button role="menuitem" onClick={logout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-btn"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {user && user.role !== "admin" && (
            <Link
              className="icon-btn cart-link"
              href="/dashboard/orders"
              aria-label="Orders"
            >
              <ShoppingBag size={18} />
            </Link>
          )}

          <button
            className="mobile-menu icon-btn"
            onClick={() => setOpen(!open)}
            aria-label="Open menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
