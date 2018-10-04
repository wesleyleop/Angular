/**
 * Created by yonatom on 8/31/16.
 */

(function () {
    'use strict';

    angular.module('app', [
        'app.core','app.auth', 'app.profile', 'app.prereg', 'app.home', 'app.restaurant', 'app.client','ngDropdowns', 'angular.filter'
    ])
        .constant("appConstant", {
            "googleSearchApi": "https://www.googleapis.com/customsearch/v1?lr=lang_cs"+
                                "&key=AIzaSyD1v6p9-NzUEwVraTp82KbX-knSXpB-9AM"+
                                "&cx=016001325367024894947:mdw4ssol40i"+
                                "&q=",
        // "onlineApi": "http://localhost/gastro-booking/gastrobooking.api/public/api",
        "onlineApi": "http://api.gastro-booking.com/api",
        "searchApi": "http://localhost/gastrogoogle/search.php",
        "viewApi": "http://localhost/gastrogoogle/viewClicked.php", 
        "searchApiLimit": 4, "searchApiGLimit": 10,
            "grant_type": "password",
            "client_id": "$2y$10$jvw/V6Fo9mvp4JXDCYYI..123uYpTEl27",
            "client_secret": "$2y$10$9OqJjxC9qZKC92L.123nO7hVOPY0436eU",
            "localImagePath": "http://localhost:8000/",
        // "sitePath": "http://localhost/gastro-booking/gastrobooking.ui/src/#/app/restaurant/",
        "sitePath": "http://gastro-booking.com/#/app/restaurant/",
        // "imagePath": "http://api.gastro-booking.sk/"  
        "imagePath": "http://api.gastro-booking.com/"        
        }).run(['$rootScope', '$state', '$stateParams', addUIRouterVars])

        .factory("TokenRestangular2", tokenRestangular2)
        .factory("TokenRestangular1", tokenRestangular1)    //added code
        .factory("TokenRestangular", tokenRestangular);

    /*@ngNoInject*/
    function tokenRestangular(Restangular, appConstant) {
        /*@ngNoInject*/
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setDefaultHeaders({Authorization: 'Bearer ' + localStorage.getItem('access_token')});
            RestangularConfigurer.setBaseUrl(appConstant.onlineApi);
        });

    }

    /*@ngNoInject*/
    function tokenRestangular1(Restangular, appConstant) {
        /*@ngNoInject*/
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(appConstant.viewApi);
        });
    }

    /*@ngNoInject*/
    function tokenRestangular2(Restangular, appConstant) {
        /*@ngNoInject*/
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(appConstant.searchApi);
        });
    }

    function addUIRouterVars($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        // add previous state property
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $state.previous = fromState;
            $state.previous_params = fromParams;
        });
    }

})();