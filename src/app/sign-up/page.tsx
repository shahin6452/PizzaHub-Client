
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
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
                    <span className="section-kicker">COME ON IN</span>
                    <h1>
                        More pizza.
                        <br />
                        <em>More smiles.</em>
                    </h1>
                    <p>
                        Join the local food community. Order your favourites
                        or bring your restaurant to the neighbourhood.
                    </p>
                    <div className="auth-aside-pizza">🍕</div>
                </div>
            </div>

            <div className="auth-panel">
                <div className="auth-panel-inner">
                    <Link href="/" className="back-link">
                        ← Back to PizzaHub
                    </Link>

                    <span className="section-kicker">GET STARTED</span>
                    <h2>Create your account</h2>
                    <p className="muted">
                        A little profile, a lot of possibilities.
                    </p>

                    <AuthForm mode="sign-up" />
                </div>
            </div>
        </main>
    );
}
