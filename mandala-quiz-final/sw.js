
const CACHE = 'mandala-quiz-v3-cache-v1';
self.addEventListener('install', event=>{
  event.waitUntil(caches.open(CACHE).then(cache=> cache.addAll([
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/questions.js',
    '/assets/logo.jpg'
  ])));
});
self.addEventListener('fetch', event=>{
  event.respondWith(caches.match(event.request).then(resp=> resp || fetch(event.request)));
});
