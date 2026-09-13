import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { ShieldCheck } from 'lucide-react';

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isDemoAuth = cookies().get('pos_demo_auth')?.value === 'true';

  if (session || isDemoAuth) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md p-8 glass-panel rounded-2xl animate-fade-in relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-brand-500/20 shadow-glow">
            <ShieldCheck className="w-8 h-8 text-brand-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2 tracking-wide">
            DATABYTE POS
          </h1>
          <p className="text-surface-400">Sign in to your account to continue</p>
        </div>

        <LoginForm />
        
        <div className="mt-8 text-center text-sm text-surface-500">
          Powered by Corebitsoft
        </div>
      </div>
    </div>
  );
}
