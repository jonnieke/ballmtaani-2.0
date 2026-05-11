import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!user) {
      alert("Please sign in to enable notifications.");
      return;
    }
    
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error("Notification permission denied");
      }

      // Generate a dummy VAPID key for local testing if you don't have a real one
      // In production, this MUST be your actual public VAPID key from Supabase Edge Functions
      const publicVapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuB-5bXByNXjJvCsv-DdEv2gOU';
      
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
      
      setIsSubscribed(true);
      
      // Send a local test notification instantly
      registration.showNotification("Notifications Enabled! 🔔", {
        body: "You're all set to receive live match updates.",
        icon: "/logo.png",
        badge: "/logo.png"
      });

    } catch (err) {
      console.error("Failed to subscribe:", err);
      alert("Failed to enable notifications. " + (err as Error).message);
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
      setIsSubscribed(false);
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
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
