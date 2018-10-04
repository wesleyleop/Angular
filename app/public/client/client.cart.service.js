/**
 * Created by Thomas on 10/14/2016.
 */

(function () {
    'use strict';

    angular
        .module('app.client')
        .service('ClientCartService', ClientCartService);
    /*@ngNoInject*/
    function ClientCartService(TokenRestangular, $rootScope, $state, moment) {
        var service = {
            getOrders: getOrders,
            getOrderDetail: getOrderDetail,
            placeOrder: placeOrder,
            deleteOrder: deleteOrder,
            deleteOrderDetail: deleteOrderDetail,
            saveChanges: saveChanges,
            removeSideDish: removeSideDish
        };
        return service;

        function getOrders(){
            //debugger;
            return TokenRestangular.all('orders').customGET('');
        }

        function getOrderDetail(restaurantId) {
            //debugger;
            return TokenRestangular.all('orders_detail/' + restaurantId).customGET('');
        }

        function placeOrder(order){
            //debugger;
            angular.forEach(order.orderDetail, function(item){
                item.serve_at = moment(item.serve_at).format();
                //debugger;
            });
            return TokenRestangular.all('order').customPOST(order);
        }

        function deleteOrder(orderId){
            var url = 'order/' + orderId;
            //debugger;
            return TokenRestangular.all(url).customDELETE('')
        }

        function deleteOrderDetail(orderDetailId){
            //debugger;
            return TokenRestangular.all('orders_detail/' + orderDetailId).customDELETE('')
        }

        function saveChanges(data) {
            //debugger;
            return TokenRestangular.all('save_changes_order').customPOST(data);
        }

        // Removes the side_dish foreign key from the sideDish to the mainDish
        function removeSideDish(sideDish){
            return TokenRestangular.one("orders_detail/side_dish", sideDish.ID_orders_detail).remove();
        }
    }
})();
