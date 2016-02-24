'use strict';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', function(event) {
        console.log(event.data);
    });

    navigator.serviceWorker.register('worker.js').then(function (bahmni) {
        console.log('Yo! service worker working.', bahmni.scope);
        //window.location.href = "/bahmni/home/";
    }).catch(function (err) {
        alert('Sorry, offline cannot be setup.');
        console.log('No Yo! service worker not working', err);
    });
}