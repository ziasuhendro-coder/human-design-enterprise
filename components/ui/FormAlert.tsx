interface FormAlertProps {
  type: 'error' | 'success';
  message: string;
}

export default function FormAlert({ type, message }: FormAlertProps) {
  const styles =
    type === 'error'
      ? 'bg-danger-bg border-danger/30 text-danger'
      : 'bg-success-bg border-success/30 text-success';

  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      {message}
    </div>
  );
}

