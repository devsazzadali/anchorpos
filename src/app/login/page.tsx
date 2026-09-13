import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { ShieldCheck } from 'lucide-react';

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isDemoAuth = cookies().get('pos_demo_auth')?.value === 'true';

  if (user || isDemoAuth) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden selection:bg-brand-500/30">
      {/* Dynamic Animated Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/30 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-700/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="w-full max-w-lg p-10 glass-luxury rounded-3xl animate-fade-in relative z-10 border border-white/5 shadow-2xl backdrop-blur-3xl transform transition-all hover:scale-[1.01] duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-500/10 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-brand-500/30 shadow-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-500/20 group-hover:bg-brand-500/30 transition-colors duration-500" />
            <ShieldCheck className="w-10 h-10 text-brand-400 relative z-10" />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-white mb-3 tracking-tight">
            DATABYTE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">POS</span>
          </h1>
          <p className="text-surface-400 font-medium text-sm">
            Enter your credentials to access the terminal
          </p>
        </div>

        <LoginForm />
        
        <div className="mt-10 pt-6 border-t border-white/5 text-center flex items-center justify-center gap-2 text-xs text-surface-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Securely Powered by Corebitsoft
        </div>
      </div>
    </div>
  );
}
