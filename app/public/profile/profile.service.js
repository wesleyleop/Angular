/**
 * Created by yonatom on 8/31/16.
 */

(function () {
    'use strict';

    angular
        .module('app.profile')
        .service('ProfileService', ProfileService);
    /*@ngNoInject*/
    function ProfileService(TokenRestangular) {
        var service = {
            uploadFile: uploadFile,
            saveRestaurant: saveRestaurant,
            getRestaurants: getRestaurants,
            getRestaurant: getRestaurant,
            getCurrentRestaurant: getCurrentRestaurant,
            deleteRestaurant: deleteRestaurant,
            deleteRestaurants: deleteRestaurants,
            updateRestaurant: updateRestaurant,
            updateOpeningHours: updateOpeningHours,
            getOpeningHours: getOpeningHours,
            deletePicture: deletePicture,
            getRestaurantByUuid: getRestaurantByUuid,
            getRestaurantTypes: getRestaurantTypes,
            updateUserPhone: updateUserPhone
        };
        return service;

        function saveRestaurant(restaurant, user_id) {
            //debugger;
            return TokenRestangular.all('user/' + user_id + "/restaurant").customPOST(restaurant);
        }

        function uploadFile(file, item_id, item_type){
            var fd = new FormData();
            //debugger;
            fd.append('file', file, file.name);
            return TokenRestangular.all('photo/' + item_id + '/' + item_type)
                .withHttpConfig({transformRequest: angular.identity})
                .customPOST(fd, '', undefined, {'Content-Type': undefined});
        }

        function getRestaurants(user_id){
            //debugger;
            return TokenRestangular.all('user/' + user_id + '/restaurants').customGET('');
        }

        function getRestaurant(restaurant_id){
            //debugger;
            return TokenRestangular.all('restaurant/' + restaurant_id).customGET('');
        }

        function getRestaurantByUuid(uuid){
            return TokenRestangular.all('restaurant/uuid/' + uuid).customGET('');
        }

        function getCurrentRestaurant(user_id){
            //debugger;
            return TokenRestangular.all('user/' + user_id + '/restaurant').customGET('');
        }

        function deleteRestaurant(restaurant_id){
            return TokenRestangular.all('restaurant/' + restaurant_id).customDELETE('');
        }

        function deleteRestaurants(user_id){
            return TokenRestangular.all('user/' + user_id + '/restaurants').customDELETE('');
        }

        function updateRestaurant(restaurant){
            //debugger;
            return TokenRestangular.all('restaurant').customPUT(restaurant);
        }

        function updateOpeningHours(restaurant_id, time){
            //debugger;
            return TokenRestangular.all('restaurant/' + restaurant_id + '/open').customPUT(time);
        }

        function getOpeningHours(restaurant_id){
            //debugger;
            return TokenRestangular.all('restaurant/' + restaurant_id + '/open').customGET('');
        }

        function deletePicture(url){
            //debugger;
            return TokenRestangular.all('photo/url').customPOST(url);
        }

        function getRestaurantTypes(){
            return TokenRestangular.all('restaurantTypes').customGET('');
        }

        function updateUserPhone(user){
            var phone = {
                "phone" : user.phone
            }
            return TokenRestangular.all('user/' + user.id + '/phone').customPUT(phone);
        }
    }

})();