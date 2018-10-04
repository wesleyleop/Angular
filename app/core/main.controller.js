/**
 * Created by yonatom on 8/31/16.
 */

(function () {
    'use strict';

    angular
        .module('app.core')
        .controller('MainController', MainController);
    /*@ngNoInject*/
    function MainController($state, $scope, $rootScope,CoreService, AuthService, $translate, $location, $anchorScroll, appConstant) {
        var vm = this;

        $scope.webWidgetCSS = appConstant.onlineApi + "/webservice/css" + window.location.search;

        if(typeof(localStorage.getItem('user')) != "undefined"){
            $rootScope.currentUser = JSON.parse(localStorage.getItem('user'));
        }
        vm.totalOrder = 0;
        initializeCart();

        $scope.$on('orders-detail-changed', function(event, args){
            CoreService.getOrdersDetailCount().then(function(response){
                vm.totalOrder = response;
            }, function(error){

            });
        });

        vm.currentUser = $rootScope.currentUser;
        $rootScope.language = "en";
        localStorage.setItem('current_language', JSON.stringify($rootScope.language));
        if ($translate.use()){
            $rootScope.language = $translate.use();
        }
        //debugger;
        vm.logout = logout;
        vm.changeLanguage = changeLanguage;

        function changeLanguage(language){
            $translate.use(language);
            localStorage.setItem('current_language', JSON.stringify($translate.use()));

        }

        var lang = getURLParameter('lang');
        if(lang) { vm.changeLanguage(lang); }

        function logout() {
            vm.totalOrder = 0;
            AuthService.logout();
        }

        function initializeCart() {
            CoreService.getOrdersDetailCount().then(function(response){
                //debugger;
                vm.totalOrder = response;
            }, function(error){

            });
        }

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)
                || [null, ''])[1].replace(/\+/g, '%20')) || null;
        }


    }

})();