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
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2 relative group">
          <Label htmlFor="email" className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@databyte.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-black/40 border-white/10 focus-visible:ring-brand-500 focus-visible:border-brand-500 h-12 text-white placeholder:text-surface-600 rounded-xl transition-all"
          />
        </div>
        <div className="space-y-2 relative group">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Password</Label>
            <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium">Forgot password?</a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-black/40 border-white/10 focus-visible:ring-brand-500 focus-visible:border-brand-500 h-12 text-white placeholder:text-surface-600 rounded-xl transition-all"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 mt-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 rounded-xl"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Authenticating...
            </>
          ) : (
            "Sign In Securely"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
          <span className="bg-surface-950 px-4 text-surface-500">Or instant access</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full h-12 border-brand-500/30 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 hover:text-white font-semibold transition-all flex items-center justify-center gap-2 rounded-xl backdrop-blur-md"
      >
        <span>⚡</span> Quick Demo Sign-In (Admin)
      </Button>
    </div>
  );
}
