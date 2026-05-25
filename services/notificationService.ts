
import { TradeSignal, SignalStrength, SignalType } from '../types';

export function isIdealSignal(signal: TradeSignal, winProbability?: number): boolean {
  if (signal.strength === SignalStrength.GOLDEN) return true;
  if (signal.score >= 85) return true;
  if (signal.score >= 70 && (winProbability ?? 0) >= 65) return true;
  if ((winProbability ?? 0) >= 75) return true;
  return false;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendDeviceNotification(
  signal: TradeSignal,
  winProbability?: number,
  enabled = true
): void {
  if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return;

  const dir = signal.type === SignalType.BUY ? 'CALL' : 'PUT';
  const title = `🎯 Lux Trader — Sinal ${signal.score >= 85 ? 'Elite' : 'Ideal'}`;
  const body = `${dir} ${signal.asset} | Score ${signal.score}%${winProbability ? ` | Win ${winProbability}%` : ''}`;

  try {
    const n = new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `lux-signal-${signal.id}`,
      requireInteraction: true,
      silent: false,
    });
    n.onclick = () => { window.focus(); n.close(); };
  } catch { /* ignore */ }
}

export function triggerHaptic(enabled = true): void {
  if (!enabled || !navigator.vibrate) return;
  navigator.vibrate([120, 60, 120, 60, 200]);
}
