angular.module('aliceApp')
  .controller(
    'ValidationSummaryController',
    [
      '$http', '$scope', 'API',
      function ($http, $scope, API) {
        let vm = this;
        vm.dashboardType = 'validation';

        vm.projects = [];

        loadSummary();
        $scope.$on('user:login', loadSummary);

        function loadSummary() {
          $http.get(API + 'getValidatorSummary').then(result => {
            vm.projects = result.data;
          });
        }

        return vm;
      }
    ])
  .directive('projectValidationCard', () => {
    return {
      templateUrl: '/components/global/projectCard.html',
    };
  });
