import { OrganizationForm } from './OrganizationForm';

export function OrganizationOnboardingPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-2xl">
        <OrganizationForm required />
      </div>
    </main>
  );
}
