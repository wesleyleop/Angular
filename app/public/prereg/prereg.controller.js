/**
 * Created by Hamid Shafer on 2017-02-24.
 */

(function () {
    'use strict';

    angular
        .module('app.prereg')
        .controller('PreregController', PreregController);

    /*@ngNoInject*/
    function PreregController($state, $scope, $rootScope, $filter, PreregService) {

        var vm = this;
        $rootScope.currentState = "prereg";

        vm.registerSupplier = registerSupplier;
        vm.closeAlert = closeAlert;
        vm.setActiveTab = setActiveTab;
        vm.editPreregistration = editPreregistration;
        vm.addEditRestaurant = addEditRestaurant;
        vm.editOwnerPreregistration = editOwnerPreregistration;
        vm.clearRestaurant = clearRestaurant;
        vm.clearOwner = clearOwner;

        if ($state.current.name == "main.prereg"){
            getSuppliers();
            getDistricts();
        }

        vm.alertClass = "";
        vm.successMessage = "";
        vm.registrationError = "";
        vm.active_tab = $rootScope.prereg_active_tab ? $rootScope.prereg_active_tab : '';
        vm.loading = false;

        // server data
        vm.suppliers = [];
        vm.countries = [];
        vm.districts = [];
        vm.supplier = {};
        vm.supplier.restaurants = [];

        function getSuppliers(){
            PreregService.getSuppliers(/*$rootScope.currentUser.id*/).then(function(response){
                vm.suppliers = response.data; //response.restaurants;
                // angular.forEach(response.data, function(supplier){
                   // console.log(supplier);
                // });
            }, function(error){
                //debugger;
            });
        }


        function getDistricts(){
            PreregService.getDistricts().then(function(response){
                // console.log(response);
                vm.countries = response.countries;
                vm.districts = response.districts;
                // angular.forEach(response.data, function(supplier){
                //    console.log(supplier);
                // });
            }, function(error){
                //debugger;
            });
        }

        
        function registerSupplier(isValid)
        {
            if (!isValid || !vm.supplier.restaurants.length) return;

            vm.loading = true;

            PreregService.saveSupplier(vm.supplier, $rootScope.currentUser.id).then(function(response)
            {
                if (response.success)
                {
                    vm.edit_mode = 1;
                    vm.supplier.owner = response.owner;
                    vm.supplier.restaurants = response.restaurants;
                    for (var i = 0; i < vm.supplier.restaurants.length; i++) {
                        vm.supplier.restaurants[i].acquired = (vm.supplier.restaurants[i].ID_user_acquire === null) ? false :  true;
                        delete vm.supplier.restaurants[i].ID_user_acquire;
                    }
                    vm.alertClass = "success";
                    vm.successMessage = response.message;
                    vm.registrationError = "";
                    getSuppliers();
                    $scope.preregOwnerForm.$setUntouched();
                    $scope.preregForm.$setUntouched();
                }
                else
                {
                    vm.alertClass = "danger";
                    vm.registrationError = response.message;
                }

                vm.loading = false;
                // $state.go("somewhere");
                
            }, function(error)
            {
                console.log(error);
                vm.alertClass = "danger";
                vm.registrationError = "Server Error" + ": " + (error.data.message);
                vm.loading = false;
            });
        }

        function editPreregistration(restaurant_id)
        {
            vm.edit_mode = 1;
            // vm.prereg_edit_restaurant_id = restaurant_id;
            for (var i = 0; i < vm.suppliers.length; i++)
            {
                // console.log(vm.suppliers[i]);
                if (vm.suppliers[i].restaurant_id == restaurant_id)
                {
                    vm.input_country = "";
                    vm.supplier = {
                        owner: {
                            id: vm.suppliers[i].ID_user,
                            name: vm.suppliers[i].owner_name,
                            email: vm.suppliers[i].owner_email,
                            phone: vm.suppliers[i].owner_phone,
                            password: '',
                            confirm_password: ''
                        },
                        restaurant: {
                            id: vm.suppliers[i].restaurant_id,
                            ID_district: vm.suppliers[i].ID_district,
                            name: vm.suppliers[i].restaurant_name,
                            email: vm.suppliers[i].restaurant_email,
                            phone: vm.suppliers[i].restaurant_phone,
                            www: vm.suppliers[i].restaurant_www,
                            acquired: vm.suppliers[i].ID_user_acquire || vm.suppliers[i].acquired ? true: false,
                            dealer_note: vm.suppliers[i].dealer_note
                        }
                    };
                    vm.supplier.restaurants = $filter('filter')( vm.suppliers, {ID_user: vm.supplier.owner.id});
                    angular.forEach(vm.supplier.restaurants, function (restaurant) {
                        restaurant.id = restaurant.restaurant_id;
                        restaurant.ID_district = restaurant.ID_district;
                        restaurant.name = restaurant.restaurant_name;
                        restaurant.email = restaurant.restaurant_email;
                        restaurant.phone = restaurant.restaurant_phone;
                        restaurant.www = restaurant.restaurant_www;
                        restaurant.acquired = restaurant.ID_user_acquire || restaurant.acquired ? true: false;
                    });
                    for (var i = 0; i < vm.supplier.restaurants.length; i++) {
                        if (restaurant_id == vm.supplier.restaurants[i].id) {
                            vm.editRestaurantIndex = i;
                            break;
                        }
                    }
                    for (var j = 0; j < vm.districts.length; j++)
                    {
                        if (vm.districts[j].ID == vm.suppliers[i].ID_district)
                        {
                            vm.input_country = vm.districts[j].country;
                            // console.log(vm.input_country);
                            break;
                        }
                    }
                    break;
                }
            }
            $scope.preregOwnerForm.$setUntouched();
            vm.setActiveTab('home');
        }

        function editOwnerPreregistration(index)
        {
            //debugger;
            vm.editRestaurantIndex = index;
            vm.supplier.restaurant = {
                ID_district: vm.supplier.restaurants[index].ID_district,
                name: vm.supplier.restaurants[index].name,
                email: vm.supplier.restaurants[index].email,
                phone: vm.supplier.restaurants[index].phone,
                www: vm.supplier.restaurants[index].www,
                acquired: vm.supplier.restaurants[index].acquired,
                dealer_note: vm.supplier.restaurants[index].dealer_note
            };

            if(vm.supplier.restaurants[index].id) {
                vm.supplier.restaurant.id = vm.supplier.restaurants[index].id;
            }

            for (var j = 0; j < vm.districts.length; j++)
            {
                if (vm.districts[j].ID == vm.supplier.restaurants[index].ID_district)
                {
                    vm.input_country = vm.districts[j].country;
                    // console.log(vm.input_country);
                    break;
                }
            }

            $scope.preregOwnerForm.$setUntouched();
            vm.setActiveTab('home');
            // location.href
        }

        function closeAlert()
        {
            vm.alertClass = "";
            vm.successMessage = "";
            vm.registrationError = "";
        }

        function setActiveTab($tab)
        {
            if ($tab == undefined) {
                vm.active_tab = $rootScope.prereg_active_tab;
            }
            else {
                vm.active_tab = $tab;
                $rootScope.prereg_active_tab = $tab;
            }
        }

        function addEditRestaurant(isValid) {
            if (!$scope.preregForm.$valid) {
                return;
            }

            var restaurant = angular.copy(vm.supplier.restaurant);
            restaurant.lang = PreregService.getLanguageCode();
            if (angular.isDefined(vm.editRestaurantIndex) && vm.editRestaurantIndex >= 0) {
                vm.supplier.restaurants[vm.editRestaurantIndex] = restaurant;
                delete vm.editRestaurantIndex;
            } else {
                vm.supplier.restaurants.push(restaurant);
            }
            angular.copy({}, vm.supplier.restaurant);
            $scope.preregForm.$setUntouched();
        }

        function clearRestaurant() {
            delete vm.editRestaurantIndex;
            var district = vm.supplier.restaurant.ID_district;
            vm.supplier.restaurant = {};
            vm.supplier.restaurant.ID_district = district;
            $scope.preregForm.$setUntouched();
        }

        function clearOwner() {
            vm.edit_mode = false;
            vm.supplier.owner = {};
            vm.supplier.restaurants = [];
            clearRestaurant();
        }
    }

})();