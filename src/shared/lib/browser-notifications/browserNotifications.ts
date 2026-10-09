// Системні сповіщення браузера (Notification API) — показуються, навіть коли вкладка у фоні.
// Працюють лише на https або localhost і лише з дозволу користувача

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

// 'default' — ще не питали; 'granted' — дозволено; 'denied' — заборонено (повторно спитати не можна)
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  return isNotificationSupported() ? Notification.permission : 'unsupported'
}

// Питати дозвіл можна лише у відповідь на дію користувача (клік) — інакше браузер відмовить сам
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported' as const
  return Notification.requestPermission()
}

export function showBrowserNotification(title: string, options: { body?: string; tag?: string; onClick?: () => void }) {
  if (getNotificationPermission() !== 'granted') return
  // tag: повторне сповіщення з тим самим tag замінює попереднє, а не множиться
  const notification = new Notification(title, { body: options.body, tag: options.tag })
  notification.onclick = () => {
    window.focus()
    options.onClick?.()
    notification.close()
  }
}
