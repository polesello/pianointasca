self.addEventListener('install', e => {
    e.waitUntil(caches.open('piano_cache').then(
        cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/img/1-notes.svg',
                '/img/5-notes.svg',
                '/img/8-notes.svg',
                '/notes/c4.mp3',
                '/notes/d4.mp3',
                '/notes/e4.mp3',
                '/notes/f4.mp3',
                '/notes/g4.mp3',
                '/notes/a5.mp3',
                '/notes/b5.mp3',
                '/notes/c5.mp3',
            ]).then(() => self.skipWaiting());
        }))
});
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request).then(
        response => {
            return response || fetch(event.request);
        }));
});