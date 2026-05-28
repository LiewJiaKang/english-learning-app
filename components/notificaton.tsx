"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Bell,
    BellOff,
    Send,
    Smartphone,
    Share2,
    PlusCircle,
    CheckCircle2,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { subscribeUser, unsubscribeUser, sendNotification } from "@/app/actions";

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/* ------------------------------------------------------------------ */
/*  Push Notification Manager                                          */
/* ------------------------------------------------------------------ */
function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
                updateViaCache: "none",
            });
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (e) {
            console.error("Service Worker registration failed", e);
        }
    }

    async function subscribeToPush() {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        });
        setSubscription(sub);
        const serializedSub = JSON.parse(JSON.stringify(sub));
        await subscribeUser(serializedSub);
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
    }

    async function sendTestNotification() {
        if (!subscription || !message.trim()) return;
        setSending(true);
        await sendNotification(message);
        setMessage("");
        setSending(false);
    }

    if (!isSupported) {
        return (
            <Card className="border-destructive/50 bg-destructive/5 w-full">
                <CardContent className="py-6 flex items-center gap-3">
                    <BellOff className="h-5 w-5 text-destructive" />
                    <p className="text-sm text-destructive">
                        Push notifications are not supported in this browser.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    Push Notifications
                </CardTitle>
                <CardDescription>
                    {subscription
                        ? "You’ll receive daily reminders and updates."
                        : "Stay in the loop with new tools and daily tips."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {subscription ? (
                    <></>
                ) : (
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            You’re not currently subscribed.
                        </p>
                        <Button onClick={subscribeToPush} size="sm">
                            <Bell className="mr-2 h-4 w-4" />
                            Enable
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ------------------------------------------------------------------ */
/*  Install Prompt                                                      */
/* ------------------------------------------------------------------ */
function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    const handleInstallClick = useCallback(async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    }, [deferredPrompt]);

    useEffect(() => {
        // Detect iOS
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );
        // Check if already in standalone mode (PWA installed)
        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        // Capture the beforeinstallprompt event for desktop / Android
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    if (isStandalone) return null; // already installed

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    Install App
                </CardTitle>
                <CardDescription>
                    Add ELA to your home screen for quick access.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {isIOS ? (
                    <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                        <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                            <div>
                                <p className="font-medium">How to install on iOS</p>
                                <ol className="list-inside list-decimal text-muted-foreground">
                                    <li>Tap the <Share2 className="inline h-3.5 w-3.5" /> share button in Safari</li>
                                    <li>Scroll down and tap <strong>“Add to Home Screen”</strong> <PlusCircle className="inline h-3.5 w-3.5" /></li>
                                    <li>Give it a name, then tap <strong>Add</strong></li>
                                </ol>
                            </div>
                        </div>
                    </div>
                ) : deferredPrompt ? (
                    <Button onClick={handleInstallClick} size="sm">
                        <Smartphone className="mr-2 h-4 w-4" />
                        Install Now
                    </Button>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Your browser will prompt you to install when available.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

/* ------------------------------------------------------------------ */
/*  Page / container                                                    */
/* ------------------------------------------------------------------ */
export default function NotificationPage() {
    return (
        <div className="max-w-3xl px-8 mx-auto flex pb-16 gap-4 space-y-6">
            <PushNotificationManager />
            <InstallPrompt />
        </div>
    );
}
