/**
 * Created by Thomas on 10/14/2016.
 */

(function () {
    'use strict';

    angular
        .module('app.client')
        .controller('ClientCartController', ClientCartController);
    /*@ngNoInject*/
    function ClientCartController($state, $rootScope,$scope,$timeout,ClientCartService,ClientService, uiDatetimePickerConfig, $translate, $stateParams, moment, appConstant, RestaurantDetailService) {
        var vm = this;
        vm.show = true;
        //debugger;
        $rootScope.currentState = 'cart';
        vm.getOrders = getOrders;
        vm.getOrderDetail = getOrderDetail;
        vm.getFriends = getFriends;
        vm.getTotalPrice = getTotalPrice;
        vm.changePrice = changePrice;
        vm.placeOrder = placeOrder;
        vm.deleteOrder = deleteOrder;
        vm.deleteOrderFromCart = deleteOrderFromCart;
        vm.deleteOrderDetail = deleteOrderDetail;
        vm.saveChanges = saveChanges;
        vm.changeSideDishFromSelect = changeSideDishFromSelect;
        vm.closeAlert = closeAlert;
        vm.getMainDishName = getMainDishName;
        vm.availableSideDishes = availableSideDishes;
        vm.orders = [];
        vm.order = null;
        vm.orderDetail = [];
        vm.isOrderDetailEmpty = false;
        vm.isOrderEmpty = false;
        vm.friends = [];
        vm.selectedFriend = null;
        vm.totalPrice = 0;
        vm.orderSuccess = false;
        vm.orderError = false;
        vm.errorMessage = '';
        vm.successMessage = '';
        vm.restaurantId = $state.params.restaurantId;
        vm.loading = false;
        vm.removeSideDish = removeSideDish;
        vm.redirectWidget = redirectWidget;

        vm.currentClientId = 0;
        $translate(['DATE_PICKER.NOW', 'DATE_PICKER.CLEAR', 'DATE_PICKER.CLOSE', 'DATE_PICKER.DATE', 'DATE_PICKER.TIME', 'DATE_PICKER.TODAY'])
            .then(function(translations){
            uiDatetimePickerConfig.buttonBar.now.text = translations["DATE_PICKER.NOW"];
            uiDatetimePickerConfig.buttonBar.clear.text = translations["DATE_PICKER.CLEAR"];
            uiDatetimePickerConfig.buttonBar.close.text = translations["DATE_PICKER.CLOSE"];
            uiDatetimePickerConfig.buttonBar.date.text = translations["DATE_PICKER.DATE"];
            uiDatetimePickerConfig.buttonBar.time.text = translations["DATE_PICKER.TIME"];
            uiDatetimePickerConfig.buttonBar.today.text = translations["DATE_PICKER.TODAY"];
        }, function(translationId){
            //debugger;
            uiDatetimePickerConfig.buttonBar.now.text = translationId["DATE_PICKER.NOW"];
            uiDatetimePickerConfig.buttonBar.clear.text = translationId["DATE_PICKER.CLEAR"];
            uiDatetimePickerConfig.buttonBar.close.text = translationId["DATE_PICKER.CLOSE"];
            uiDatetimePickerConfig.buttonBar.date.text = translationId["DATE_PICKER.DATE"];
            uiDatetimePickerConfig.buttonBar.time.text = translationId["DATE_PICKER.TIME"];
            uiDatetimePickerConfig.buttonBar.today.text = translationId["DATE_PICKER.TODAY"];
        });
        $rootScope.$on('$translateChangeSuccess', function(){
            $translate(['DATE_PICKER.NOW', 'DATE_PICKER.CLEAR', 'DATE_PICKER.CLOSE', 'DATE_PICKER.DATE', 'DATE_PICKER.TIME', 'DATE_PICKER.TODAY']).then(function(translations){
                //debugger;
                uiDatetimePickerConfig.buttonBar.now.text = translations["DATE_PICKER.NOW"];
                uiDatetimePickerConfig.buttonBar.clear.text = translations["DATE_PICKER.CLEAR"];
                uiDatetimePickerConfig.buttonBar.close.text = translations["DATE_PICKER.CLOSE"];
                uiDatetimePickerConfig.buttonBar.date.text = translations["DATE_PICKER.DATE"];
                uiDatetimePickerConfig.buttonBar.time.text = translations["DATE_PICKER.TIME"];
                uiDatetimePickerConfig.buttonBar.today.text = translations["DATE_PICKER.TODAY"];
            }, function(translationId){
                //debugger;
                uiDatetimePickerConfig.buttonBar.now.text = translationId["DATE_PICKER.NOW"];
                uiDatetimePickerConfig.buttonBar.clear.text = translationId["DATE_PICKER.CLEAR"];
                uiDatetimePickerConfig.buttonBar.close.text = translationId["DATE_PICKER.CLOSE"];
                uiDatetimePickerConfig.buttonBar.date.text = translationId["DATE_PICKER.DATE"];
                uiDatetimePickerConfig.buttonBar.time.text = translationId["DATE_PICKER.TIME"];
                uiDatetimePickerConfig.buttonBar.today.text = translationId["DATE_PICKER.TODAY"];
            });
        });


        // load order details if state is main.clientCart
        if ($state.current.name == "main.clientCart"){
            getOrderDetail($state.params.restaurantId);
        }

        getOrders();
        getFriends();
        getTotalPrice();

        vm.date_picker = {
            date: new Date('d.m.y H:i'),
            datepickerOptions: {
                showWeeks: false,
                minDate: new Date(),
                startingDay: 1
            }
        };

        vm.openCalendar = function(e, picker) {
            vm.orderDetail[picker].date_picker = true;
        };

        function getOrders(){
            vm.loading = true;
            ClientCartService.getOrders().then(function (response) {
                //debugger;
                if(response.data && response.data.length == 0){
                    vm.isOrderEmpty = true;
                } else {
                    var orders = response.data;
                    vm.orders = [];
                    angular.forEach(orders,function(order){
                        if(order.total_order_details != 0){
                            vm.orders.push(order);
                        }
                    });
                    if (vm.orders.length == 1){
                        $state.go("main.clientCart", {restaurantId: vm.orders[0].ID_restaurant});
                    }
                }
                vm.loading = false;
            }, function (error) {
                //debugger;
                vm.loading = true;
            });
        }

        function addNewKeys(orders) {
            //debugger;
            angular.forEach(orders, function (value) {
                value['visible'] = true;
                value['date_picker'] = false;
                value['serve_at'] = value['serve_at'] == "30.11.-0001 00:00" ? new Date() : moment(value['serve_at'], "DD.MM.YYYY HH:mm").toDate();
                if (value.menu_list.data.photo){
                    value['photo'] = appConstant.imagePath + value.menu_list.data.photo;
                } else {
                    value['photo'] = "assets/images/meal-placeholder.png";
                }
                //debugger;

                value['side_dish_bool'] = value['side_dish'] != '0';
                value['is_child'] = value['is_child'] != 0;
                value['friends'] = vm.friends;
                if (value.is_child){
                    value['t_price'] = (value.menu_list.data.price_child > 0 ? value.menu_list.data.price_child :value.menu_list.data.price ) * value.x_number;
                } else {
                    value['t_price'] = value.menu_list.data.price * value.x_number;
                }
            });
        }

        function getFriends() {
            ClientService.getFriendCircle().then(function (response) {
                //debugger;
                if(!response.error) {
                    vm.friends = response.data;
                }
            }, function (error) {
                //debugger;
            });
        }

        function getTotalPrice() {
            vm.totalPrice = 0;
            angular.forEach(vm.orderDetail, function (value, key) {
                if (value.is_child){
                    vm.totalPrice += (value.menu_list.data.price_child ? value.menu_list.data.price_child : value.menu_list.data.price) * value.x_number;
                } else {
                    vm.totalPrice += value.menu_list.data.price * value.x_number;
                }

            });
            vm.totalPrice = vm.totalPrice.toFixed(2);
        }

        function changePrice(order) {
            //debugger;
            if(order.side_dish == 0) {
                angular.forEach(order.sideDish.data, function(side_dish) {
                    if(side_dish.side_dish == order.ID_orders_detail) {
                        side_dish.x_number = order.x_number;
                    }
                });
                angular.forEach(vm.orderDetail, function(side_dish) {
                    if(side_dish.side_dish == order.ID_orders_detail) {
                        side_dish.x_number = order.x_number;
                        if (side_dish.is_child){
                            side_dish.t_price = (side_dish.menu_list.data.price_child > 0 ? side_dish.menu_list.data.price_child :side_dish.menu_list.data.price ) * side_dish.x_number;
                        } else {
                            side_dish.t_price = side_dish.menu_list.data.price * side_dish.x_number;
                        }
                    }
                });
            }
            if (order.is_child){
                order.t_price = (order.menu_list.data.price_child > 0 ? order.menu_list.data.price_child :order.menu_list.data.price ) * order.x_number;
            } else {
                order.t_price = order.menu_list.data.price * order.x_number;
            }

            getTotalPrice();
        }

        function getOrder(orderId) {
            //debugger;
            ClientService.getOrder(orderId).then(function (response) {
                //debugger;
                vm.order = response.data;
                vm.currentClientId = response.data.ID_client;
            }, function (error) {
                //debugger;
            })
        }

        function getOrderDetail(restaurantId) {
            vm.loading = true;
            ClientCartService.getOrderDetail(restaurantId).then(function (response) {
                //debugger;
                if (response.error || (response.data && response.data.length == 0)) {
                    vm.isOrderDetailEmpty = true;
                } else {
                    vm.orderDetail = response.data;
                    //debugger;

                    initializeAvailableSideDishes(vm.orderDetail);
                    addNewKeys(vm.orderDetail);
                    getTotalPrice();
                    getOrder(vm.orderDetail[0].ID_orders);
                }

                vm.loading = false;
            }, function (error) {
                //debugger;
                vm.loading = true;
            });
        }

        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)
                || [null, ''])[1].replace(/\+/g, '%20')) || null;
        }

        function placeOrder(isValid) {
            if (isValid){
                //debugger;
                vm.loading = true;

                vm.order.partner = getURLParameter('partner');

                var order = {
                    "order": vm.order,
                    "orderDetail" : vm.orderDetail,
                    "lang": localStorage.getItem('NG_TRANSLATE_LANG_KEY') ? localStorage.getItem('NG_TRANSLATE_LANG_KEY') : $rootScope.language
                };

                ClientCartService.placeOrder(order).then(function (response) {
                    //debugger;
                    if (response.data){
                        vm.orderSuccess = "CLIENT.ORDER SUCCESS MSG";
                        vm.orderError = "";
                        vm.orderDetail = [];
                        $rootScope.$broadcast('orders-detail-changed');
                        $timeout(function(){
                            vm.orderSuccess = "";
                            $state.go('main.clientDashboard');
                        }, 4000);
                    }
                    else if(response.wrongServingTime) {
                        vm.orderError = "CLIENT.WRONG SERVING TIME";
                        vm.wrongServing = response.wrongServingTime;
                        // $timeout(function(){
                        //     vm.orderError = "";
                        // }, 5000);
                    } else if (response.requestError){
                        vm.orderError = "CLIENT.ORDER ERROR";
                        // $timeout(function(){
                        //     vm.orderError = "";
                        // }, 3500);
                    }
                    vm.getOrderDetail($state.params.restaurantId);
                    vm.loading = false;
                }, function (error) {
                    //debugger;
                    vm.orderError = "CLIENT.ORDER ERROR";
                    $rootScope.$broadcast('orders-detail-changed');
                    getOrderDetail($state.params.restaurantId)
                    $timeout(function(){
                        vm.orderError = "";
                    }, 3500);
                    vm.loading = false;
                });
            }
        }

        function closeAlert(ers) {
            //debugger;
            if (ers == "error") {
                vm.orderError = "";
            } else {
                vm.orderSuccess = "";
            }
        }

        function deleteOrder(order) {
            //debugger;
            ClientCartService.deleteOrder(order.ID_orders).then(function (response) {
                $rootScope.$broadcast('orders-detail-changed');
                vm.getOrders()
            }, function (error) {
                //debugger;
            });
        }
        function deleteOrderFromCart(order) {
            //debugger;
            ClientCartService.deleteOrder(order.ID_orders).then(function (response) {
                $rootScope.$broadcast('orders-detail-changed');
                $state.go("main.clientOrders");
            }, function (error) {
                //debugger;
            });
        }

        function deleteOrderDetail(orderDetail) {
            //debugger;
            ClientCartService.deleteOrderDetail(orderDetail.ID_orders_detail).then(function (response) {

                // Delete from side dishes of main dish if it is side_dish
                var mainDish = findDishById(orderDetail.side_dish);
                if(angular.isDefined(mainDish)) {
                    var sideDishes = mainDish.sideDish.data;
                    for (var i = 0; i < sideDishes.length; i++) {
                        if (sideDishes[i].ID_orders_detail == orderDetail.ID_orders_detail) {
                            sideDishes.splice(i, 1);
                            break;
                        }
                    }
                }

                //Remove all side dishes from vm.ordersDetail if it has any side dishes
                for(var i = 0; i < vm.orderDetail.length; i++) {
                    if(vm.orderDetail[i].side_dish == orderDetail.ID_orders_detail) {
                        vm.orderDetail.splice(i, 1);
                    }
                }

                //Remove main dish from order
                var delete_index = vm.orderDetail.indexOf(findDishById(orderDetail.ID_orders_detail));
                if(delete_index > -1) {
                    vm.orderDetail.splice(delete_index, 1);
                }
                getTotalPrice();
                $rootScope.$broadcast('orders-detail-changed');

            }, function (error) {
                alert("Error. Please call administrator!")
            });
        }

        function saveChanges(isValid, changeState) {

            if (!vm.orderDetail.length){
                if (changeState) {
                    $state.go("main.restaurant_detail", { "restaurantId" : vm.restaurantId});
                return;
                } else {
                    return;
                }
            }
            if (vm.orderDetail.length > 0 && isValid){
                vm.loading = true;
                var lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY') ? localStorage.getItem('NG_TRANSLATE_LANG_KEY') : $rootScope.language;
                var order = {
                    "order": vm.order,
                    "lang": lang
                };

                var orders_detail = {
                    "orders_detail": vm.orderDetail,
                    "lang": lang

                };
                var resp = 0;
                //debugger;
                ClientService.updateOrder(order).then(function (response) {
                    //debugger;
                    getOrder(vm.orderDetail[0].ID_orders);
                    if (resp){
                        vm.loading = false;
                    } else {
                        resp = 1;
                    }
                    if (changeState){
                        angular.forEach(vm.orderDetail, function(item){
                            //debugger;
                            item.date_picker = false;
                        });
                        //debugger;
                        $state.go("main.restaurant_detail", { "restaurantId" : vm.restaurantId})
                    }
                    vm.orderSuccess = "CLIENT.ORDER SAVE SUCCESS MSG";
                    $timeout(function(){
                        vm.orderSuccess = "";
                    }, 3000);
                }, function (error) {
                    if (resp){
                        vm.loading = false;
                    } else {
                        resp = 1;
                    }
                });

                ClientService.updateOrderDetails(orders_detail).then(function (response) {
                    //debugger;
                    vm.getOrderDetail(vm.restaurantId);
                    if (resp){
                        vm.loading = false;
                    } else {
                        resp = 1;
                    }
                }, function (error) {
                    //debugger;
                    if (resp){
                        vm.loading = false;
                    } else {
                        resp = 1;
                    }
                })
            }


        }

        // NOTE that order_detail.side_dish is actually referring to the id of the order_detail which is the main dish
        // for this side dish
        function removeSideDish(order_detail){
            if(order_detail.recommended_side_dish == 1) {
                vm.deleteOrderDetail(order_detail);
            } else {
                removeSideDishFromMainDish(order_detail);
                ClientCartService.removeSideDish(order_detail);
                order_detail.side_dish = 0;
                $rootScope.$broadcast('orders-detail-changed');
            }
        }

        // Removes the sideDish from the list of side dishes (mainDish.sideDish) of the mainDish
        function removeSideDishFromMainDish(sideDish){
            var mainDishObj = findDishById(sideDish.side_dish)
            var sideDishes = mainDishObj.sideDish.data;

            for(var i=0; i<sideDishes.length; i++){
                if(sideDishes[i].ID_orders_detail == sideDish.ID_orders_detail){
                    sideDishes.splice(i, 1);
                    break;
                }
            }
        }
        // Returns the number of side dishes that a dish contains. Main dish is object of type order_detail
        function countSideDishesForMainDish(mainDish){
            var counter = 0;

            angular.forEach(vm.orderDetail, function(orderDetail){
                if(orderDetail.side_dish == mainDish){
                counter++;
                }
            });

            return counter;
        }

        // This function is called when the dishes are first loaded from the server. We iterate each dish and set the
        // additional properties that we need for proper rendering of the dishes and their side dishes lists.
        // Again, NOTE that the property side_dish refers to the id of the main dish and is only set if the dish is
        // actually a side dish. When the dish does not have a main dish, side_dish is set to '0' or ''. This is poor
        // implementation and it should be set to NULL, but for now I won't change it since that is out of my scope
        function initializeAvailableSideDishes(order_details){
            angular.forEach(order_details, function(order_detail){
                convertMenuListsToOrdersDetails(order_detail.menu_list.data.recommended_side_dishes);
            });
        }

        function addSideDishToCart(mainDish, side_dish){
            var menuList = side_dish.menu_list.data;
            mainDish.loading = true;
            var data = {
                "orders_detail" : {
                    "ID_restaurant": menuList.ID_restaurant,
                    "ID_menu_list": menuList.ID_menu_list ? menuList.ID_menu_list: menuList.ID,
                    "date": mainDish.serve_at,
                    "time": undefined,
                    "side_dish": mainDish.ID_orders_detail,
                    "x_number": mainDish.x_number,
                    "recommended_side_dish": side_dish.ID_orders_detail ? 0 : 1
                },
                "lang": "en",
                "source": "detail"
            };

            RestaurantDetailService.addMenuListToCart(data).then(function(response){

                var addedSideDish = response.data;
                if (side_dish.ID_orders_detail && side_dish.x_number > mainDish.x_number) {
                    side_dish.x_number = side_dish.x_number - mainDish.x_number;
                    var lang = localStorage.getItem('NG_TRANSLATE_LANG_KEY') ? localStorage.getItem('NG_TRANSLATE_LANG_KEY') : $rootScope.language;
                    ClientService.updateOrderDetails({"orders_detail": [side_dish], "lang": lang }).then(function (response) {
                        console.info('response', response);
                    }, function (error) {
                        alert('Could not update dish data!');
                    })
                }
                addedSideDish.visible = true;
                changePrice(addedSideDish);
                addedSideDish.menu_list.data.photo = addedSideDish.menu_list.data.photo ?
                    appConstant.imagePath + addedSideDish.menu_list.data.photo : "assets/images/meal-placeholder.png"
                vm.orderDetail.push(addedSideDish);
                mainDish.sideDish.data.push(addedSideDish);
                mainDish.loading = false;
                getTotalPrice();

                $rootScope.$broadcast('orders-detail-changed');

            },function(error){
                mainDish.loading = false;
            });
        }

        function setAsSideDishInCart(mainDish, side_dish){
            var menuList = side_dish.menu_list.data;
            mainDish.loading = true;
            var data = {
                "orders_detail" : {
                    "ID_orders_detail": side_dish.ID_orders_detail,
                    "ID_restaurant": menuList.ID_restaurant,
                    "ID_menu_list": menuList.ID_menu_list ? menuList.ID_menu_list: menuList.ID,
                    "date": mainDish.serve_at,
                    "time": undefined,
                    "side_dish": mainDish.ID_orders_detail,
                    "x_number": mainDish.x_number,
                    "recommended_side_dish": side_dish.ID_orders_detail ? 0 : 1
                },
                "lang": "en",
                "source": "detail"
            };

            RestaurantDetailService.addMenuListToCart(data).then(function(response){
                side_dish.mainDish = mainDish.ID_orders_detail;
                side_dish.side_dish = mainDish.ID_orders_detail;
                side_dish.isSideDish = true;
                side_dish.serve_at = mainDish.serve_at;
                side_dish.x_number = mainDish.x_number;
                mainDish.hasSideDishes = true;
                mainDish.sideDish.data.push(side_dish);
                mainDish.loading = false;
                // item.ordered = response.data.x_number;
                $rootScope.$broadcast('orders-detail-changed');

            },function(error){
                //debugger;
                mainDish.loading = false;
            });
        }

        // This callback is invoked when the user selects a side dish from the dropdown menu.
        function changeSideDishFromSelect(order, selectedSideDish) {
            //debugger;
            //Swap item from order
            if(angular.isUndefined(selectedSideDish.ID_orders_detail)) {
                var swapDish = getAvailableDishFromOrder(order, selectedSideDish);
                if(swapDish) {
                    selectedSideDish = swapDish;
                }
            }

            if(angular.isUndefined(selectedSideDish.ID_orders_detail) ||
                (angular.isDefined(selectedSideDish.ID_orders_detail) && order.x_number < selectedSideDish.x_number)) {
                addSideDishToCart(order, selectedSideDish);
            } else if (angular.isDefined(selectedSideDish.ID_orders_detail) && order.x_number == selectedSideDish.x_number) {
                setAsSideDishInCart(order, selectedSideDish);
            }
            vm.tempSideDish = null;
        }

        function removeSideDishesForMainDish(mainDish){
            angular.forEach(vm.orderDetail, function(orderDetail){
               if(orderDetail.side_dish == mainDish){
                   orderDetail.side_dish = null;
                   orderDetail.mainDish = null;
                   orderDetail.isSideDish = false;
               }
            });
        }

        // Iterates through our vm.orderDetail object (which is really just and array of dishes), and returns the one
        // with the id of ID_orders_detial
        function findDishById(ID_orders_detail){
            for(var i=0; i<vm.orderDetail.length; i++){
                var orderDetail = vm.orderDetail[i];
                if(orderDetail.ID_orders_detail == ID_orders_detail){
                    return orderDetail;
                }
            }
        }

        function getMainDishName(sideDish) {
            if(angular.isDefined(sideDish.side_dish) && sideDish.side_dish != 0 && sideDish.side_dish) {
                var mainDishObj = findDishById(sideDish.side_dish);
                if(angular.isDefined(mainDishObj)) {
                    return mainDishObj.menu_list.data.name;
                }
            } else
                return "";
        }


        // New functionality

        function availableSideDishes(mainDish) {
            return function(sideDish) {
                if(mainDish.menu_list == undefined) {
                    console.info('mainDish', mainDish)
                }
                if(sideDish.menu_list == undefined) {
                    console.info('sideDish', sideDish)
                }
                if(mainDish.menu_list.data.name == sideDish.menu_list.data.name) {
                    return false;
                }
                return (mainDish.x_number <= sideDish.x_number || !sideDish.ID_orders_detail)
                    && !dishHasSideDishes(sideDish) && !mainDishHasDishAsSideDish(mainDish, sideDish)
                    && !dishIsSideDish(sideDish);
            }
        }

        function sideDishIsAddedToMainDish(mainDish, sideDish) {
           return mainDish.sideDish.data.some(function (item) {
               return (item.menu_list.data.ID_menu_list == sideDish.menu_list.data.ID_menu_list ||
                    item.menu_list.data.ID == sideDish.menu_list.data.ID_menu_list)
            });
        }

        function dishIsSideDish(dish) {
            return dish.side_dish && dish.side_dish != 0;
        }

        function dishHasSideDishes(dish) {
            return dish.sideDish && dish.sideDish.data && dish.sideDish.data.length > 0;
        }

        function convertMenuListsToOrdersDetails(menuListsArray) {
            for(var i=0; i < menuListsArray.length; i++) {
                menuListsArray[i] = {menu_list: {data: menuListsArray[i]}};
            }
        }

        function mainDishHasDishAsSideDish(mainDish, sideDish) {
            for(var i = 0; i < mainDish.sideDish.data.length; i++) {
                if(mainDish.sideDish.data[i].menu_list.data.name == sideDish.menu_list.data.name) {
                    return true;
                }
            }
            return false;
        }

        function getAvailableDishFromOrder(mainDish, sideDish) {
            for(var i = 0; i < vm.orderDetail.length; i++) {
                //Check if names are equal and other requirements are valid
                if(vm.orderDetail[i].menu_list.data.name == sideDish.menu_list.data.name && !vm.orderDetail[i].sideDish.length
                    && vm.orderDetail[i].side_dish == 0 && mainDish.x_number <= vm.orderDetail[i].x_number) {
                    return vm.orderDetail[i];
                }
            }
        }

        function redirectWidget() {
            var restaurantId = localStorage.getItem('widget__restaurantId')
            return $stateParams.app == 'widget' ?
                $state.href('main.restaurant_detail', {restaurantId: restaurantId}) :
                $state.href('main.search');
        }
    }
})();