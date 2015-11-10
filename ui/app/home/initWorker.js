if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('worker.js').then(function (home) {
        console.log('Yo! service worker working.', home.scope);
    }).catch(function (err) {
        console.log('No Yo! service worker not working', err);
    });
}