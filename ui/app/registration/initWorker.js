if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('worker.js').then(function (registration) {
        console.log('Yo Baby! service worker working.', registration.scope);
    }).catch(function (err) {
        console.log('No Yo! service worker not working', err);
    });
}