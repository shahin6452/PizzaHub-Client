"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    UserRound,
    Store,
    Camera,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { clearAuthTokenCache } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [googleBusy, setGoogleBusy] = useState(false);
    const [error, setError] = useState("");

    const isSignup = mode === "sign-up";

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            if (isSignup) {
                if (profileFile && profileFile.size > 5 * 1024 * 1024) {
                    throw new Error("Profile image must be 5 MB or smaller.");
                }

                const result = await authClient.signUp.email({
                    name,
                    email,
                    password,
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                // Clear any previous user's cached authentication token.
                clearAuthTokenCache();

                await api("/api/users/choose-role", {
                    method: "POST",
                    body: JSON.stringify({ role }),
                });

                if (profileFile) {
                    try {
                        const form = new FormData();
                        form.append("image", profileFile);

                        const uploaded = await api<{ url: string }>(
                            "/api/uploads/profile-image",
                            {
                                method: "POST",
                                body: form,
                            }
                        );

                        const updated = await authClient.updateUser({
                            image: uploaded.url,
                        });

                        if (updated.error) {
                            throw new Error(updated.error.message);
                        }
                    } catch {
                        toast.warning(
                            "Your account was created, but the profile image could not be uploaded. You can add it later in Profile Settings."
                        );
                    }
                }

                toast.success("Account created successfully!");
            } else {
                clearAuthTokenCache();
                const result = await authClient.signIn.email({
                    email,
                    password,
                });

                if (result.error) {
                    throw new Error(result.error.message);
                }

                toast.success("Welcome back! Login successful.");
            }

            router.replace("/dashboard");
            router.refresh();
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to authenticate";

            setError(message);
            toast.error(message);
        } finally {
            setBusy(false);
        }
    }

    async function google() {
        setError("");
        setGoogleBusy(true);

        try {
            const callbackURL = isSignup
                ? `${window.location.origin}/auth/complete?role=${role}`
                : `${window.location.origin}/dashboard`;

            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL,
            });

            if (result.error) {
                throw new Error(result.error.message || "Google sign-in failed");
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Google sign-in failed";

            setError(message);
            toast.error(message);
            setGoogleBusy(false);
        }
    }

    return (
        <form className="auth-form" onSubmit={submit}>
            {isSignup && (
                <label>
                    Full name
                    <div className="field-wrap">
                        <UserRound />
                        <input
                            required
                            minLength={2}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                        />
                    </div>
                </label>
            )}

            <label>
                Email address
                <div className="field-wrap">
                    <Mail />
                    <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                    />
                </div>
            </label>

            <label>
                Password
                <div className="field-wrap">
                    <LockKeyhole />
                    <input
                        required
                        minLength={6}
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        pattern="^(?=.*[a-z])(?=.*[A-Z]).{6,}$"
                        title="Use at least 6 characters, including one uppercase and one lowercase letter."
                    />
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                    >
                        {show ? <EyeOff /> : <Eye />}
                    </button>
                </div>
            </label>

            {isSignup && (
                <>
                    <label>
                        Profile image <span className="muted">(optional)</span>
                        <div className="signup-image-field">
                            <Camera size={16} />
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(e) =>
                                    setProfileFile(e.target.files?.[0] || null)
                                }
                            />
                        </div>
                        <small className="form-hint">
                            JPG, PNG or WEBP · Maximum 5 MB
                        </small>
                    </label>

                    <label>
                        Account type
                        <div className="role-choice">
                            <button
                                type="button"
                                className={role === "customer" ? "role-selected" : ""}
                                onClick={() => setRole("customer")}
                            >
                                <UserRound /> Customer
                            </button>

                            <button
                                type="button"
                                className={role === "vendor" ? "role-selected" : ""}
                                onClick={() => setRole("vendor")}
                            >
                                <Store /> Vendor
                            </button>
                        </div>
                    </label>

                    <p className="form-hint">
                        Admin accounts are created securely by the platform administrator.
                    </p>
                </>
            )}

            {error && <p className="form-error">{error}</p>}

            <Button
                type="submit"
                size="lg"
                className="auth-shadcn-btn"
                disabled={busy || googleBusy}
            >
                {busy
                    ? "Please wait…"
                    : isSignup
                        ? "Create account"
                        : "Sign in"}
            </Button>

            <div className="auth-divider">
                <span>or continue with</span>
            </div>

            <Button
                variant="outline"
                size="lg"
                className="auth-shadcn-btn"
                type="button"
                onClick={google}
                disabled={busy || googleBusy}
            >
                <span className="google-g">G</span>
                {googleBusy ? "Connecting…" : "Continue with Google"}
            </Button>

            <p className="auth-switch">
                {isSignup
                    ? "Already have an account?"
                    : "New to PizzaHub?"}{" "}
                <Link href={isSignup ? "/sign-in" : "/sign-up"}>
                    {isSignup ? "Sign in" : "Create an account"}
                </Link>
            </p>
        </form>
    );
}