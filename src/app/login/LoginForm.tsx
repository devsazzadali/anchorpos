"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('admin@databyte.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = getSupabaseClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to POS system.",
        className: "bg-surface-800 border-surface-700 text-white",
      });

      // Force router refresh to update server components middleware state
      router.refresh();
      router.push('/home');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Invalid credentials. You can also use Quick Demo Sign-In below.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    document.cookie = 'pos_demo_auth=true; path=/; max-age=604800; SameSite=Lax';
    toast({
      title: "Demo Mode Activated",
      description: "Signed in as Administrator. All modules unlocked.",
      className: "bg-surface-800 border-surface-700 text-white",
    });
    router.refresh();
    router.push('/home');
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-surface-300">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@databyte.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-surface-900/50 border-surface-700 focus-visible:ring-brand-500 h-11 text-white"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-surface-300">Password</Label>
            <a href="#" className="text-sm text-brand-400 hover:text-brand-300">Forgot password?</a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-surface-900/50 border-surface-700 focus-visible:ring-brand-500 h-11 text-white"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-11 bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-glow transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-surface-700/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-900 px-3 text-surface-400 font-medium">Or instant access</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full h-11 border-brand-500/40 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-white font-medium transition-all flex items-center justify-center gap-2"
      >
        <span>⚡</span> Quick Demo Sign-In (Admin)
      </Button>
    </div>
  );
}
