'use strict';

angular.module('orders.pending.services', []);
angular.module('orders.pending.controllers', ['orders.pending.services']);
angular.module('orders.pending', ['orders.pending.controllers']);