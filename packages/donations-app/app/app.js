angular.module('aliceApp', ['ui.router', 'angular-jwt', 'ui.bootstrap', 'ui.bootstrap.modal', 'ngAnimate',
  'toastr', 'ngFileUpload', 'angularMoment', 'datetime', 'ngSanitize', 'summernote', 'ng-currency',
  'angular-svg-round-progressbar', 'treasure-overlay-spinner', 'ui.bootstrap', 'credit-cards', 'angular-flot',
	'ngTagsInput', 'chart.js', 'ngclipboard', 'ngCookies', 'ui.carousel'])

  .constant('AUTH_EVENTS', {
    notAuthenticated: 'auth-not-authenticated'
  })

  .constant(function (envConfig) {
    envConfig();
  })

  //.constant('API', 'https://api.stage.alice.si/api/')
  //.constant('API', 'https://52.56.110.127/api/')
  //.constant('API', 'http://localhost:8080/api/')

  .config(['toastrConfig', function (toastrConfig) {
    angular.extend(toastrConfig, {
      timeOut: '3000',
      containerId: 'toast-container',
      maxOpened: 0,
      newestOnTop: true,
      positionClass: 'toast-top-center',
      preventDuplicates: false,
      preventOpenDuplicates: false,
      target: 'body'
    });
  }])

  .config(['$stateProvider', '$urlRouterProvider', 'MODE', function ($stateProvider, $urlRouterProvider, MODE) {

    $urlRouterProvider.otherwise('/404');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/components/home/homeView.html'
      })
      .state('passwordReset', {
        url: '/passwordReset',
        templateUrl: '/components/auth/passwordResetView.html'
      })
      .state('passwordChange', {
        url: '/passwordChange/:passwordChangeToken',
        templateUrl: '/components/auth/passwordChangeView.html'
      })
      // Old Project Appeal Page (Pilot Project appeal page)
      .state('project-old', {
        url: '/project-old/:projectCode',
        templateUrl: '/components/project-old/projectView.html'
      })
      // New Project Appeal Page
      .state('project', {
        url: '/project/:projectCode/:mode',
        templateUrl: function(params) {
          if (params.mode) {
            return '/components/project/mode/' + params.mode + '.html';
          } else {
            return '/components/project/mode/4.html';
          }
        }
      })
      .state('project-simple', {
        url: '/project/:projectCode',
        templateUrl: function(params) {
          const appealVersionsForProject = {
            // 'fusion-housing-1': 2,
            // 'gift-of-walking': 2,
            // 'save-from-abuse': 2
          };

          // FIXME remove this after AB vodafone testing
          if (MODE != 'prod') {
            appealVersionsForProject['fusion-housing-1'] = 2;
          }

          const defaultAppealVersion = 4;
          const defaultVersionForProject =
            appealVersionsForProject[params.projectCode] || defaultAppealVersion;

          return `/components/project/mode/${defaultVersionForProject}.html`;
        }
      })
      .state('how-it-works', {
        url: '/how-it-works/',
        templateUrl: '/components/how-it-works/howItWorksTemplate.html'
      })
			.state('checkout', {
        url: '/checkout/:projectCode',
        templateUrl: '/components/checkout/checkoutView.html'
      })
      .state('geek-mode', {
        url: '/geek-mode/',
        templateUrl: '/components/geek-mode/geekModeView.html'
      })
      .state('faq', {
        url: '/faq/',
        templateUrl: '/components/faq/faqTemplate.html'
      })
      .state('charity-admin', {
        url: '/charity-admin/:code',
        templateUrl: '/components/charity/charityAdminView.html'
      })
			.state('dai', {
				url: '/dai/',
				templateUrl: '/components/dai/dai.html'
			})
			.state('dai-thankyou', {
				url: '/thankyou/:donationAmount/:donationTx',
				templateUrl: '/components/dai/daiThankyou.html'
			})
			.state('daiboard', {
				url: '/daiboard',
				templateUrl: '/components/dai/daiBoard.html'
      })
      .state('404', {
				url: '/404',
				templateUrl: '/404.html'
      })
      .state('registration-finishing', {
        url: '/registration-finishing/:userId',
        templateUrl: 'components/auth/registrationFinishingView.html'
      })
      .state('oauth2', {
        url: '/oauth2',
        templateUrl: 'components/auth/oauth2View.html'
      })
			// Dashboards:
      .state('validation', {
        url: '/validation/',
        templateUrl: '/components/validation/summaryView.html'
      })
      .state('validation-goals-dashboard', {
        url: '/validation/:project',
        templateUrl: '/components/validation/goalsDashboard.html'
      })
			.state('charity-dashboard', {
        url: '/charity-dashboard/',
        templateUrl: '/components/dashboard/charityDashboardHome.html'
      })
      .state('charity-dashboard-project', {
        url: '/charity-dashboard/:project',
        templateUrl: '/components/dashboard/charityDashboardView.html'
      })
			.state('my-impact', {
        url: '/my-impact/',
        templateUrl: '/components/my-impact/myImpactHomeView.html'
      })
			.state('my-impact-project', {
        url: '/my-impact/:project',
        templateUrl: '/components/my-impact/myImpactView.html'
      })
			.state('project-wizard', {
        url: '/project-wizard/:code',
        templateUrl: '/components/project-wizard/projectWizardView.html'
      })
      // PROJECT WIZARD
			// Superadmin Dashboard:
			.state('super-admin', {
				url: '/super-admin/',
				templateUrl: '/components/backoffice/dashboardView.html'
			})
			// We will move the following >>>>>>>>
      .state('projects', {
        url: '/projects/',
        templateUrl: '/components/project-wizard/projectsView.html'
      })
      .state('users', {
        url: '/users/',
        templateUrl: '/components/user/usersView.html'
      })
      .state('log-in-as-another-user', {
        url: '/log-in-as-another-user/',
        templateUrl: '/components/auth/logInAsAnotherUser.html'
      })
			.state('charities', {
        url: '/charities/',
        templateUrl: '/components/charity/charitiesView.html'
      });
			// <<<<<<<<< into Superadmin Dashboard
  }])

  .factory('ErrorInterceptor', ['$rootScope', '$q', '$injector', function ($rootScope, $q) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast("server:error", response);
        return $q.reject(response);
      }
    };
  }])

  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('ErrorInterceptor');
  }])

  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
      enabled: true
    }).hashPrefix('');
  }])

  .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://www.youtube.com/**'
    ]);
  }])

  .run(['$rootScope', '$state', '$location', 'AuthService', function ($rootScope, $state, $location, AuthService) {
    //Activate WOW animations
    new WOW().init();

    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (AuthService.isAuthenticated()) {
        if (next.name === 'login') {
          event.preventDefault();
          $state.go('home');
        }
      } else {
        //Redirect to landing page
        var unathorized = ['myImpact'];
        if (unathorized.indexOf(next.name) >= 0) {
          console.log("Unauthorized trying to navigate to: " + next.name);
          event.preventDefault();
          $state.go('login');
        }
      }
    });

    $rootScope.$on('$stateChangeSuccess', function () {
      //Autoscroll to top after route change
      document.body.scrollTop = document.documentElement.scrollTop = 0;

      // Google analytics event reporting
      ga('send', 'pageview', $location.path());
    });

  }]);
