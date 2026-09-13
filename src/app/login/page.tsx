import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { ShieldCheck, Zap, Globe, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isDemoAuth = cookies().get('pos_demo_auth')?.value === 'true';

  if (user || isDemoAuth) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-black relative overflow-hidden selection:bg-brand-500/30">
      
      {/* 
        LEFT COLUMN: The Introductory Hero Showcase
        Hidden on small screens, expands on LG breakpoints 
      */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 lg:p-20 border-r border-white/5 bg-surface-950 z-10 overflow-hidden">
        {/* Deep mesh gradient specific to the hero section */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-brand-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/30 shadow-glow">
              <ShieldCheck className="w-6 h-6 text-brand-400" />
            </div>
            <span className="text-xl font-display font-extrabold text-white tracking-widest uppercase">
              DATABYTE <span className="text-brand-400">POS</span>
            </span>
          </div>

          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-5xl lg:text-7xl font-display font-black text-white leading-[1.1] tracking-tight">
              Next-Gen <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400">
                Offline-First
              </span> <br />
              Commerce.
            </h1>
            <p className="text-lg text-surface-400 max-w-lg font-medium leading-relaxed">
              Unleash the full potential of your business with military-grade sync, instant local execution, and a stunning terminal interface.
            </p>
          </div>

          <div className="mt-16 space-y-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-4 glass-panel p-4 rounded-2xl w-max">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold">Zero Latency Local-First</p>
                <p className="text-sm text-surface-400">Never wait for a server response</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 glass-panel p-4 rounded-2xl w-max ml-8">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold">Background Cloud Sync</p>
                <p className="text-sm text-surface-400">Automatic Supabase replication</p>
              </div>
            </div>

            <div className="flex items-center gap-4 glass-panel p-4 rounded-2xl w-max ml-16">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold">Enterprise Architecture</p>
                <p className="text-sm text-surface-400">Scalable multi-location management</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-8 mt-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <p className="text-sm text-surface-500 font-medium">© 2026 Corebitsoft</p>
          <div className="flex items-center gap-2 text-sm text-brand-400 font-semibold hover:text-brand-300 transition-colors cursor-pointer group">
            Explore Documentation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 
        RIGHT COLUMN: The Login Form
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative p-6 sm:p-12 z-10">
        {/* Subtle mesh background for the right side */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        <div className="w-full max-w-md animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
          
          {/* Mobile-only branding (Hidden on Desktop) */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-16 h-16 bg-brand-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-brand-500/30 shadow-glow">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mb-2 tracking-tight">
              DATABYTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">POS</span>
            </h1>
            <p className="text-surface-400 font-medium text-sm">
              Sign in to your terminal
            </p>
          </div>

          {/* Desktop Form Header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
            <p className="text-surface-400 font-medium text-sm">
              Enter your credentials to access the terminal.
            </p>
          </div>

          <div className="glass-luxury p-8 sm:p-10 rounded-3xl border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-3xl transform transition-all hover:border-white/10 duration-500">
            <LoginForm />
          </div>
          
          <div className="mt-10 text-center flex items-center justify-center gap-2 text-xs text-surface-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Online & Operational
          </div>
        </div>
      </div>
    </div>
  );
}
