'use client';

type ToastListener = (message: string | null) => void;

class ToastStore {
  private message: string | null = null;
  private timer: NodeJS.Timeout | null = null;
  private listeners: Set<ToastListener> = new Set();

  public show(msg: string) {
    this.message = msg;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.hide();
    }, 5000);
    this.notify();
  }

  public hide() {
    this.message = null;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public getMessage(): string | null {
    return this.message;
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.message);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l(this.message));
  }
}

export const toastStore = new ToastStore();
