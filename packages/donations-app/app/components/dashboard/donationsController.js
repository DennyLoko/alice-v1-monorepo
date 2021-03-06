angular.module('aliceApp')
  .controller('DashboardDonationsController', ['AuthService', '$http', 'API', 'Excel', '$timeout', '$stateParams', '$scope', '$filter', function (AuthService, $http, API, Excel, $timeout, $stateParams, $scope, $filter) {
    var vm = this;
    vm.auth = AuthService;
    vm.mode = $stateParams.tab;

    vm.exportToExcel = function () {
      Excel.tableToExcel('donations', 'donations', 'donations.xlsx');
    };

    vm.sort = function (field) {
      vm.sortField = field;
    };

    if (!AuthService.getLoggedUser()) {
      AuthService.showLogInModal();
    }

    /*jshint -W030 */
    $scope.activeProject;
    $scope.$watch('activeProject', function() {
      loadDonationsData($scope.activeProject);
    });

    function loadDonationsData(activeProject) {
      $http.get(API + 'getDonationsForProjects').then(function (result) {
        vm.projectsWithDonations = result.data;
        vm.projectsWithDonations = vm.projectsWithDonations.map(project => {
          project.selected = true;
          return project;
        });
      });

      $scope.$watch("donCtrl.projectsWithDonations", function () {
        reloadDonationsData();
      }, true);
    }

    function reloadDonationsData() {
      if (!vm.projectsWithDonations) {
        return;
      }
      var selectedData = vm.projectsWithDonations.reduce((acc, project) =>
        {
          if (project.selected) {
            acc.donations = acc.donations.concat(project.donations);
            acc.validations = acc.validations.concat(project.validations);
            acc.donationsUsers = acc.donationsUsers.concat(project.users);
          }
          return acc;
        },
        {
          donations: [],
          validations: [],
          donationsUsers: []
        }
      );

      var selectedDontaionsData = prepareDataForAccumulativeSortedChart(selectedData.donations);
      var selectedValidationsData = prepareDataForAccumulativeSortedChart(selectedData.validations);
      // var selectedDonationsUsersData = groupUsers(selectedData.donationsUsers);
      // vm.donations = selectedDonationsUsersData;
      vm.donations = selectedData.donationsUsers;

      var summary = countSummaryForSelectedProjects(selectedData);
      vm = Object.assign(vm, summary);
      // console.log(vm.donations);
    }

    function countSummaryForSelectedProjects(selectedData) {
      function sum(arr, key) {
        return arr.reduce((acc, cur) => acc + cur[key], 0
        );
      }

      var donationsTotal = sum(selectedData.donations, 'amount');
      var totalReceived = calculateTotalReceived();
      var donationsLength = selectedData.donations.length;

      return {
        donated: donationsTotal,
        received: totalReceived,
        avgDonation: donationsLength === 0 ? 0 : donationsTotal / donationsLength
      };
    }

    function calculateTotalReceived() {
      return vm.donations.reduce((res, donation) => res + donation.paidOut, 0);
    }

    function groupUsers(users) {
      pos = 0;
      usersDict = users.reduce((acc, user) => {
          if (!acc[user._id]) {
            acc[user._id] = Object.assign({}, user);
            acc[user._id].pos = ++pos;
            acc[user._id].refunded = 0;
          }
          else {
            acc[user._id].total += user.total;
            acc[user._id].count += user.count;
            acc[user._id].paidOut += user.paidOut;
            if (acc[user._id].last < user.last) {
              acc[user._id].last = user.last;
            }
          }
          return acc;
        },
        {}
      );

      return Object.values(usersDict);
    }

    function removeTimeFromDate(date) {
        let changeDate = new Date(date.createdAt);
        return moment(new Date(changeDate.getFullYear(), changeDate.getMonth(), changeDate.getDate())).valueOf();
    }

    // group donations by date with accumulated values (accumulated for each day)
    function perDay(data) {
      if (data.length > 1) {
        var currentDate = data[0][0];
        accumulate = 0;
        let dataPerDay = data.reduce((acc, elem) => {
          if (elem[0] != currentDate) {
            acc.push([currentDate, accumulate]);
            currentDate = elem[0];
            accumulate = elem[1];
          } else {
            accumulate += elem[1];
          }
          return acc;
        },
        [[currentDate, accumulate]]);
        dataPerDay.push([currentDate, accumulate]);
        return dataPerDay;
      }
      else {
        return data;
      }
    }

    function prepareDataForAccumulativeSortedChart(collection) {
      // this sort is for the case when there are some projects
      collection = collection.sort((el1, el2) => {
        var moment1 = moment(el1.createdAt).valueOf();
        var moment2 = moment(el2.createdAt).valueOf();
        return moment1 - moment2;
      });
      // removeing time for each date
      // descreasing amount by 100000 to show thousands
      var data = collection.reduce((acc, elem) => {
          const newDate = removeTimeFromDate(elem);
          acc.push([newDate, elem.amount / 100000]);
          return acc;
        },
        []
      );
      return perDay(data);
    }

    return vm;
  }]);
