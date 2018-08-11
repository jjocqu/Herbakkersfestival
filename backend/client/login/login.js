angular.module('herbakker.login', [])

    .controller('LoginController', function ($scope, $location, $route, ApiFactory) {
        $scope.data = {};

        $scope.name = 'LoginController';
    });