import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Error checking push subscription:", err);
    }
  };

  const subscribeToPush = async () => {
    setPushError(null);
    if (!user) {
      setPushError("Sign in to enable match alerts.");
      return false;
    }

    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
    if (!publicVapidKey) {
      setPushError("Push notifications are not configured yet.");
      return false;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("Notification permission denied — enable them in browser settings.");
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Save to Supabase
      const subJson = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth
        }, { onConflict: 'endpoint' });

      if (error) throw error;

      await supabase.from('notification_preferences').upsert({
        user_id: user.id,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      await supabase.from('notification_consent_events').insert({
        user_id: user.id,
        channel: 'push',
        action: 'granted',
        purpose: 'football_news_and_match_alerts',
        source: 'browser_push_prompt',
        metadata: { user_agent: navigator.userAgent },
      });
      
      setIsSubscribed(true);
      
      // Send a local test notification instantly
      registration.showNotification("Notifications Enabled! 🔔", {
        body: "You're all set to receive live match updates.",
        icon: "/logo.png",
        badge: "/logo.png"
      });

      return true;

    } catch (err) {
      console.error("Failed to subscribe:", err);
      setPushError((err as Error).message || "Failed to enable notifications.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from Supabase
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .match({ endpoint: subscription.endpoint });
        }
      }
      if (user) {
        await supabase.from('notification_preferences').upsert({
          user_id: user.id,
          push_enabled: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        await supabase.from('notification_consent_events').insert({
          user_id: user.id,
          channel: 'push',
          action: 'withdrawn',
          purpose: 'football_news_and_match_alerts',
          source: 'notification_preferences',
        });
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
      setPushError((err as Error).message || "Failed to disable notifications.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    pushError,
    subscribeToPush,
    unsubscribeFromPush
  };
}

// Utility to convert Base64 URL to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
