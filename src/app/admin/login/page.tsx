import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { Wordmark } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <div className="grain relative hidden overflow-hidden lg:block">
        <Photo src="/images/cocoya/interior/bar-lanterns.jpg" alt="" fill preload sizes="55vw" className="object-cover object-[50%_55%]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-espresso via-espresso/60 to-transparent" />
        <div className="absolute bottom-12 left-12 max-w-md text-foam">
          <p className="font-display text-4xl leading-tight font-light">
            Every guest has a story. <em className="text-gold">Listen closely.</em>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to website
          </Link>
          <Wordmark className="text-foam" />
          <h1 className="font-display mt-10 text-4xl font-light tracking-tight">Feedback dashboard</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sign in with an administrator account to view and manage guest feedback.
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
              <LoginGate searchParams={searchParams} />
            </Suspense>
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" /> Access is restricted to authorised café staff.
          </p>
        </div>
      </div>
    </main>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed">
        <p className="flex items-center gap-2 font-semibold text-primary">
          <Database className="size-4" /> Database not connected yet
        </p>
        <p className="mt-2 text-muted-foreground">
          Add <code className="text-foreground">SUPABASE_URL</code>, <code className="text-foreground">SUPABASE_PUBLISHABLE_KEY</code>{" "}
          and <code className="text-foreground">SUPABASE_SECRET_KEY</code> to your environment, run the migration in{" "}
          <code className="text-foreground">supabase/migrations</code>, then create an admin user. The README walks through
          each step.
        </p>
      </div>
    );
  }

  return <LoginForm next={next} />;
}
