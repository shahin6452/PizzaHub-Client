
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const user = session?.user as ({
        role?: "customer" | "vendor" | "admin";
    } | undefined);

    const dashboardUrl =
        user?.role === "admin"
            ? "/dashboard/admin"
            : user?.role === "vendor"
                ? "/dashboard/vendor"
                : "/dashboard/customer";

    useEffect(() => {
        if (!isPending && session) {
            router.replace(dashboardUrl);
        }
    }, [isPending, session, dashboardUrl, router]);

    if (isPending || session) {
        return (
            <div className="dashboard-loading">
                <div className="loader" />
                Checking your session...
            </div>
        );
    }

    return (
        <main className="auth-page">
            <div className="auth-aside">
                <div className="auth-aside-content">
                    <span className="section-kicker">GOOD TO SEE YOU AGAIN</span>
                    <h1>
                        Your next slice
                        <br />
                        <em>is waiting.</em>
                    </h1>
                    <p>
                        Sign in to keep track of your orders and discover new
                        neighbourhood favourites.
                    </p>
                    <div className="auth-aside-pizza">🍕</div>
                </div>
            </div>

            <div className="auth-panel">
                <div className="auth-panel-inner">
                    <Link href="/" className="back-link">
                        ← Back to PizzaHub
                    </Link>

                    <span className="section-kicker">WELCOME BACK</span>
                    <h2>Sign in to your account</h2>
                    <p className="muted">
                        Pick up where your cravings left off.
                    </p>

                    <AuthForm mode="sign-in" />
                </div>
            </div>
        </main>
    );
}
