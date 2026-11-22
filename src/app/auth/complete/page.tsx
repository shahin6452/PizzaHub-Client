
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

export default function AuthComplete() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [error, setError] = useState("");
    const processed = useRef(false);

    useEffect(() => {
        if (isPending || processed.current) return;

        if (!session) {
            processed.current = true;
            router.replace("/sign-in");
            return;
        }

        processed.current = true;

        async function completeAuth() {
            try {
                const params = new URLSearchParams(window.location.search);
                const isSignup = params.has("role");

                const requestedRole =
                    params.get("role") === "vendor" ? "vendor" : "customer";

                if (isSignup) {
                    await api("/api/users/choose-role", {
                        method: "POST",
                        body: JSON.stringify({ role: requestedRole }),
                    });

                    toast.success("Account created successfully with Google!");
                } else {
                    toast.success("Welcome back! Google login successful.");
                }

                const user = session.user as typeof session.user & {
                    role?: string;
                };

                const role = isSignup
                    ? requestedRole
                    : user.role || "customer";

                const dashboard =
                    role === "admin"
                        ? "/dashboard/admin"
                        : role === "vendor"
                            ? "/dashboard/vendor"
                            : "/dashboard/customer";

                router.replace(dashboard);
                router.refresh();
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Could not finish account setup";

                setError(message);
                toast.error(message);
                processed.current = false;
            }
        }

        completeAuth();
    }, [isPending, session, router]);

    return (
        <main className="container page-shell">
            <div className="loading-block">
                {error || "Finishing your PizzaHub account…"}
            </div>
        </main>
    );
}
