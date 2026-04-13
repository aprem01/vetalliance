"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@vetalliance.io");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!createClient()) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/dashboard");
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-navy-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to VetAlliance</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <div className="text-sm text-red-400">{error}</div>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            New here? <Link href="/signup" className="text-gold-400 hover:underline">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
