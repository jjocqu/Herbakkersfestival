angular
    .module('herbakker.factories', [])
    .factory('ApiFactory', function($http) {

        var getSales = function() {
            return $http({
                method: 'GET',
                url: 'api/sales'
            }).then(function(res) {
                return res.data;
            })
        };

        var login = function(credentials) {
            return $http({
                method: 'POST',
                url: '/api/login',
                data: credentials
            })
        };

        return {
            getSales: getSales,
            login: login
        }
    });