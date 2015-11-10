if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('worker.js').then(function (clinical) {
        console.log('Yo Baby! service worker working.', clinical.scope);
    }).catch(function (err) {
        console.log('No Yo! service worker not working', err);
    });
}