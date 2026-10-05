import { create } from 'zustand';

interface ToastMessage {
  id: number;
  text: string;
  kind: 'info' | 'error';
}

interface ToastState {
  messages: ToastMessage[];
  push: (text: string, kind?: ToastMessage['kind']) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastState>((set) => ({
  messages: [],
  push: (text, kind = 'info') => {
    const id = nextId++;
    set((state) => ({ messages: [...state.messages, { id, text, kind }] }));
    setTimeout(() => {
      set((state) => ({ messages: state.messages.filter((m) => m.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((state) => ({ messages: state.messages.filter((m) => m.id !== id) })),
}));

export function useToast() {
  return useToastStore((state) => state.push);
}

export function ToastContainer() {
  const messages = useToastStore((state) => state.messages);
  const dismiss = useToastStore((state) => state.dismiss);

  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <button
          key={m.id}
          onClick={() => dismiss(m.id)}
          className={`rounded-md px-4 py-2 text-left text-sm shadow-lg ${
            m.kind === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'
          }`}
        >
          {m.text}
        </button>
      ))}
    </div>
  );
}
