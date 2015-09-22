'use strict';

(function (angular, window) {
  angular
    .module('eventsFeedPluginDesign')
    .controller('DesignHomeCtrl', ['$scope','Buildfire','LAYOUTS','DataStore','TAG_NAMES',
      function ($scope, Buildfire, LAYOUTS,DataStore,TAG_NAMES) {
        var DesignHome = this;
         var DesignHomeMaster;
         DesignHome.layouts = {
           listLayouts: [{
             name: "Event_Item_Layout_1"
           }, {
               name: "Event_Item_Layout_2"
           }, {
               name: "Event_Item_Layout_3"
           }, {
               name: "Event_Item_Layout_4"
           }]
         };
          function init() {
              var _data = {
                  design: {
                      listLayout: "",
                      backgroundImage: ""
                  },
                  content: {
                      images: [],
                      description: ""
                  }
              };

              /* background image add </end>*/
              Buildfire.datastore.get(TAG_NAMES.CONTACT_INFO, function (err, data) {
                  if (err) {
                      Console.log('------------Error in Design of People Plugin------------', err);
                  }
                  else if (data && data.data) {
                      DesignHome.data = angular.copy(data.data);
                      console.log("init Data:",DesignHome.data)
                      if (!DesignHome.data.design)
                          DesignHome.data.design = {};
                      if (!DesignHome.data.design.listLayout)
                          DesignHome.data.design.listLayout = DesignHome.layouts.listLayouts[0].name;
                      DesignHomeMaster = angular.copy(data.data);
                      $scope.$digest();
                  }
                  else {
                      DesignHome.data = _data;
                      console.info('------------------unable to load data---------------');
                  }
              });
          }
          init();
          /*On layout click event*/
          DesignHome.changeListLayout = function (layoutName) {
              if (layoutName && DesignHome.data.design) {
                  DesignHome.data.design.listLayout = layoutName;
                  console.log(DesignHome.data);
                  saveData(function (err, data) {
                          if (err) {
                              return DesignHome.data = angular.copy(DesignHomeMaster);
                          }
                          else if (data && data.obj) {

                              return DesignHomeMaster = data.obj;

                          }
                          $scope.$digest();
                      }
                  )
              }
          };

          /*save method*/
          function saveData(callback) {
              callback = callback || function () {

                  };
              Buildfire.datastore.save(DesignHome.data, TAG_NAMES.CONTACT_INFO, callback);
          }

      }]);
})(window.angular);
