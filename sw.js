const CACHENAMES = {
	CODE: 'v1.3'
};

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHENAMES.CODE)
			.then(cache => {
				return cache.addAll([
					'/',
					'/snake.js'
				])
				.then(() => self.skipWaiting());
			})
	);
});	

self.addEventListener('activate',  event => {
	event.waitUntil(Promise.all([self.clients.claim(),
		caches.keys().then(keyList => {
			return Promise.all(keyList.map(function(key) {
				if (Object.values(CACHENAMES).indexOf(key) == -1) {
					return caches.delete(key);
				}
				return true;
			}));
		})
	]));
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(r => r || fetch(event.request))
	);
});