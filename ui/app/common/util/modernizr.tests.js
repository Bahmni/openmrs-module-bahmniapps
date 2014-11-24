Modernizr.addTest('ios', function(){
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false
});