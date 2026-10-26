import React from 'react';
import { LandingHeader } from '@/ui/components/landing/LandingHeader';
import { LandingHero } from '@/ui/components/landing/LandingHero';
import { LandingWorkflow } from '@/ui/components/landing/LandingWorkflow';
import { LandingSpheres } from '@/ui/components/landing/LandingSpheres';
import { LandingFooter } from '@/ui/components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingWorkflow />
        <LandingSpheres />
      </main>
      <LandingFooter />
    </div>
  );
}
