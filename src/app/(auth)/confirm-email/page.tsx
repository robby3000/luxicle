import { ConfirmEmailMessage } from '@/components/auth/ConfirmEmailMessage';

export default function ConfirmEmailPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <ConfirmEmailMessage />
      </div>
    </div>
  );
}
