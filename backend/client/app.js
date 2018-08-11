angular.module('herbakker', [
    'herbakker.factories',
    'herbakker.login',
    'ngRoute'
]).config(config);

config.$inject = ['$routeProvider'];

function config($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: './login/login.html',
            controller: 'LoginController'
        })
        .otherwise({
            redirectTo: '/login'
        });
};