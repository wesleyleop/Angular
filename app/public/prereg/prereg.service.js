/**
 * Created by Hamid Shafer on 2017-02-24.
 */

(function () {
    'use strict';

    angular
        .module('app.prereg')
        .service('PreregService', PreregService);
    /*@ngNoInject*/
    function PreregService(TokenRestangular, $translate) {
        var service = {
            getSuppliers: getSuppliers,
            getDistricts: getDistricts,
            saveSupplier: saveSupplier,
            getLanguageCode: getLanguageCode
        };
        return service;

        function getSuppliers() {
            return TokenRestangular.all('prereg').customGET('');
        }

        function getDistricts() {
            return TokenRestangular.all('prereg/districts').customGET('');
        }

        function saveSupplier(supplier, user_id) {
            return TokenRestangular.all('prereg/' + user_id).customPOST(supplier);
        }

        function getLanguageCode() {
            var langCode = {
                "en" : "ENG",
                "cs" : "CZE"
            }
            var currentLang = $translate.use();
            if (currentLang && currentLang in langCode) {
                return langCode[currentLang];
            }
            return "ENG";
        }
    }

})();