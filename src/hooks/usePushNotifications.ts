import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Only run for employees
    const role = localStorage.getItem('role');
    if (role !== 'Employee') return;

    // Register service worker
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // console.log('Service Worker registered successfully:', registration);

          // Check if already subscribed
          return registration.pushManager.getSubscription();
        })
        .then((existingSubscription) => {
          if (existingSubscription) {
            setIsSubscribed(true);
            setSubscription(existingSubscription);
            sendSubscriptionToServer(existingSubscription);
          } else {
            // Request permission and subscribe
            requestNotificationPermission();
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // console.log('Notification permission granted');

        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = (import.meta as any).env.VITE_VAPID_PUBLIC_KEY || 'BHWnf-U3zH5IQarMbSyy1KkDdYFOCcpydYupXT6D06jJArvG5oaeKitn27z7NdlDaOHQu2lqPg4MjYwjX2AKHR0'; // Generated VAPID public key

        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        setIsSubscribed(true);
        setSubscription(newSubscription);
        sendSubscriptionToServer(newSubscription);
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';
      const cleanBaseUrl = baseUrl.replace('/api', '');
      const response = await fetch(`${cleanBaseUrl}/api/users/subscribe-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (!response.ok) {
        // Silent fail for subscription errors
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const unsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      setIsSubscribed(false);
      setSubscription(null);

      // Notify server about unsubscription
      try {
        const token = localStorage.getItem('token');
        const baseUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';
        const cleanBaseUrl = baseUrl.replace('/api', '');
        await fetch(`${cleanBaseUrl}/api/users/unsubscribe-push`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Error unsubscribing from server:', error);
      }
    }
  };

  return {
    isSubscribed,
    subscription,
    requestNotificationPermission,
    unsubscribe
  };
};

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}