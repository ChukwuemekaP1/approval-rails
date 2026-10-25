// Service Worker stub to prevent 404s from stale browser registrations
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
