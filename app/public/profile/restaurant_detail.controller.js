/**
 * Created by yonatom on 8/31/16.
 */

(function () {
    'use strict';

    angular
        .module('app.profile')
        .controller('RestaurantEditController', RestaurantEditController);
    /*@ngNoInject*/
    function RestaurantEditController($state, $scope, Cropper, $timeout, appConstant, $location, $anchorScroll, $stateParams, $rootScope, ProfileService) {
        var vm = this;
        var data, file, item_type;
        vm.restaurant = [];
        vm.interiorImages = [];
        vm.exteriorImages = [];
        vm.gardenImages = [];
        vm.editError = "";
        vm.updateSuccess = "";
        vm.updateSuccess2 = "";
        vm.updateError = "";
        vm.interior_cropper = false;
        vm.exterior_cropper = false;
        vm.garden_cropper = false;
        $rootScope.pic1 = false;
        $rootScope.pic2 = false;
        $rootScope.pic3 = false;
        vm.upload_error1 = "";
        vm.upload_error2 = "";
        vm.upload_error3 = "";
        vm.server_error = "";
        vm.uploadFile = uploadFile;
        vm.onFile = onFile;
        vm.crop = crop;
        vm.clear = clear;
        vm.closeAlert = closeAlert;
        vm.deletePicture = deletePicture;
        vm.updateRestaurant = updateRestaurant;
        vm.deleteRestaurant = deleteRestaurant;
        //debugger;
        vm.time = {
            monday:{},
            tuesday: {},
            wednesday: {},
            thursday: {},
            friday: {},
            saturday: {},
            sunday: {}
        };
        getRestaurant();
        getRestaurantTypes();

        function getRestaurant(){
            ProfileService.getRestaurant($stateParams.restaurantId).then(function(response){
                vm.restaurant = response.data;
                if (vm.restaurant.photos){
                    vm.interiorImages = [];
                    vm.exteriorImages = [];
                    vm.gardenImages = [];
                    for (var i = 0; i < vm.restaurant.photos.data.length; i++){
                        //debugger;
                        var photo = vm.restaurant.photos.data[i];
                        if (photo.item_type == "interior"){
                            vm.interiorImages.push(appConstant.imagePath + photo.file_path);
                        } else if (photo.item_type == "exterior"){
                            vm.exteriorImages.push(appConstant.imagePath + photo.file_path);
                        } else if (photo.item_type == "garden"){
                            vm.gardenImages.push(appConstant.imagePath + photo.file_path);
                        }
                    }
                }
                if (vm.restaurant.openingHours && vm.restaurant.openingHours.data && vm.restaurant.openingHours.data.length){
                    ProfileService.getOpeningHours(vm.restaurant.id).then(function(response){
                        //debugger;
                        vm.time = response.data.time;
                    }, function(error){
                        //debugger;
                    });
                } else {
                    initialTimeSetup();
                }
                $('#map_holder2').locationpicker({
                    location: {latitude: vm.restaurant.latitude, longitude: vm.restaurant.longitude},
                    radius: 300,
                    zoom: 15,
                    inputBinding: {
                        latitudeInput: $("#latitude"),
                        longitudeInput: $("#longitude"),
                        radiusInput: $('#radius'),
                        locationNameInput: $('#address_input')
                    },
                    enableAutocomplete: true
                });
                //debugger;
                $rootScope.pic1 = false;
                $rootScope.pic2 = false;
                $rootScope.pic3 = false;
            }, function(error){
                //debugger;
            });
        }

        function getRestaurantTypes(){
            ProfileService.getRestaurantTypes().then(function(response){
                //debugger;
                vm.restaurantTypes = response.data;
                angular.forEach(vm.restaurantTypes, function (value, key) {
                    value['n_type'] = "RESTAURANT_TYPE." + value.name;
                });
            }, function(error){
                //debugger;

            });
        }

        function updateRestaurant(isValid){
            //debugger;
            if (isValid){
                if ($rootScope.currentUser.profile_type === "data" && vm.restaurant.ID_user_active === null){
                    vm.restaurant.ID_user_active = $rootScope.currentUser.id;
                }
                
                if (vm.restaurant.status === 'N') {
                    vm.restaurant.status = "A";
                }
                
                var restaurant = {
                    "restaurant" : vm.restaurant
                };
                
                //debugger;
                
                ProfileService.updateRestaurant(restaurant).then(function(response){
                    //debugger;
                    vm.updateSuccess = "Restaurant updated successfully!";
                    $location.hash("u");
                    $anchorScroll();

                }, function(error){
                    //debugger;

                });
                
                ProfileService.updateUserPhone($rootScope.currentUser).then(function(response){
                    var user = JSON.stringify(response.data);
                    localStorage.setItem('user', user);
                });


            }
        }

        function deleteRestaurant(restaurantId){
            ProfileService.deleteRestaurant(restaurantId).then(function(response){
                //debugger;
                $state.go("main.profile");
            }, function(error){
                //debugger;
            });
        }

        vm.start_time = "From";
        vm.changeTime = function(date, shift, value){
            vm.time[date][shift] = value;
        };
        vm.changeOthers = function(shift, value){
            var keys = Object.keys(vm.time);
            for (var i = 0; i < keys.length; i++){
                vm.time[keys[i]][shift] = value;
            }
        };

        vm.initialTimeSetup = initialTimeSetup;

        function initialTimeSetup(){
            var keys = Object.keys(vm.time);
            for (var i = 0; i < keys.length; i++){
                vm.time[keys[i]].m_start = vm.time[keys[i]].a_start = "From";
                    vm.time[keys[i]].m_end = vm.time[keys[i]].a_end = "Until";

            }
            //debugger;
        }

        function checkValid(){
            //debugger;
            var keys = Object.keys(vm.time);
            for (var i = 0; i < keys.length; i++){
                if (vm.time[keys[i]].m_start == "From" ||
                    vm.time[keys[i]].m_end == "Until"){
                    return false;
                }
            }
            return true;
        }

        vm.updateOpeningHours = function(time){
            var time = {
                "time": time
            };
            if (checkValid()){
                ProfileService.updateOpeningHours($stateParams.restaurantId, time).then(function(response){
                    //debugger;
                    vm.updateError = "";
                    vm.updateSuccess2 = "Opening Hours updated successfully!";
                }, function(error){
                    //debugger;
                });
            } else {
                vm.updateSuccess2 = "";
                vm.updateError = "You must fill morning opening hours!";
            }
        };

        vm.times = [
            "7:00", "7:30", "8:00", "8:30", "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
            "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
            "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
            "21:00", "21:30", "22:00", "22:30", "23:00", "23:30", "24:00", "1:00", "1:30",
            "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00", "5:30",
            "6:00", "6:30"
        ];

        vm.openCalendar = function(e, picker) {
            vm[picker].open = true;
        };

        vm.time_picker = {
            date: new Date('2015-03-01T12:30:00Z'),
            timepickerOptions: {

            }
        };
        function deletePicture(url){
            //debugger;
            var jsonURL = {
                "url": url
            };
            ProfileService.deletePicture(jsonURL).then(function(response){
                //debugger;
                getRestaurant();
            }, function(error){
                //debugger;
            });
        }

        vm.changePic = function() {
            $rootScope.pic1 = true;
        }

        function uploadFile(file) {
            //debugger;
            if (file) {
                //debugger;
                if (item_type == "interior"){
                    //debugger;
                    $rootScope.pic1 = true;
                } else if(item_type == "exterior"){
                    //debugger;
                    $rootScope.pic2 = true;
                } else if (item_type == "garden"){
                    //debugger;
                    $rootScope.pic3 = true;
                }
                ProfileService.uploadFile(file, $stateParams.restaurantId, item_type).then(function(response){
                    //debugger;
                    getRestaurant();
                    clear();

                }, function(error){
                    //debugger;
                    vm.server_error = "Error uploading your file! Please try again!";
                    clear();
                    $rootScope.pic1 = false;
                    $rootScope.pic2 = false;
                    $rootScope.pic3 = false;
                });

            }
        }

        function closeAlert(value){
            if (value == 1){
                vm.upload_error1 = "";
            } else if (value == 2){
                vm.upload_error2 = "";
            } else if (value == 3){
                vm.upload_error3 = "";
            } else if (value == "server"){
                vm.server_error = "";
            } else if (value == "success"){
                vm.updateSuccess = "";
            } else if (value == "success2"){
                vm.updateSuccess2 = "";
            } else if (value == "error"){
                vm.updateError = "";
            }
        }

        function onFile(blob, type) {
            //debugger;
            if (blob){
                item_type = type;
                if (item_type == "interior"){
                    if (vm.interiorImages.length >= 3){
                        vm.upload_error1 = "You can't upload more than 3 images!";
                        //debugger;
                        $rootScope.pic1 = false;
                        vm.dataUrl = null;
                        return;
                    }
                    vm.interior_cropper = true;
                    vm.exterior_cropper = false;
                    vm.garden_cropper = false;
                } else if (item_type == "exterior"){
                    if (vm.exteriorImages.length >= 1){
                        //debugger;
                        vm.upload_error2 = "You can't upload more than 1 image!";
                        $rootScope.pic2 = false;
                        vm.dataUrl = null;
                        return;
                    }
                    vm.exterior_cropper = true;
                    vm.interior_cropper = false;
                    vm.garden_cropper = false;
                } else if (item_type == "garden") {
                    if (vm.gardenImages.length >= 2){
                        //debugger;
                        vm.upload_error3 = "You can't upload more than 2 images!";
                        $rootScope.pic3 = false;
                        vm.dataUrl = null;
                        return;
                    }

                    vm.garden_cropper = true;
                    vm.interior_cropper = false;
                    vm.exterior_cropper = false;
                }
                vm.dataUrl = null;
                Cropper.encode((file = blob)).then(function(dataUrl) {
                    vm.dataUrl = dataUrl;
                    $timeout(showCropper);  // wait for $digest to set image's src

                });
            }
        };

        function crop(){
            if (!file || !data) return;
            Cropper.crop(file, data).then(function(blob){
                blob.name = file.name;
                vm.uploadFile(blob);
                vm.dataUrl = null;
                file = null;
                hideCropper();
                vm.interior_cropper = false;
                vm.exterior_cropper = false;
                vm.garden_cropper = false;

            });
        }

        vm.cropper = {};
        vm.cropperProxy = 'cropper.first';

        function clear() {
            //debugger;
            // if (!vm.cropper.first) return;
            // vm.cropper.first('clear');
            $timeout(hideCropper);
            vm.dataUrl = null;
            vm.interior_cropper = false;
            vm.exterior_cropper =false;
            vm.garden_cropper = false;
        };

        vm.options = {
            maximize: true,
            aspectRatio: 4/3,
            crop: function(dataNew) {
                data = dataNew;
            }
        };

        vm.showEvent = 'show';
        vm.hideEvent = 'hide';


        function showCropper() { $scope.$broadcast(vm.showEvent); }
        function hideCropper() { $scope.$broadcast(vm.hideEvent); }




    }

})();