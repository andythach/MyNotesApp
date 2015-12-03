var myApp = angular.module("myApp", ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
	$rootScope.authenticated = false;
	$rootScope.current_user = "";

	$rootScope.logout = function() {
		$http.get('auth/signout');
		$rootScope.authenticated = false;
		$rootScope.current_user = "";
	};
});

myApp.config(function($routeProvider){
  $routeProvider
    //the timeline display
    .when('/', {
      templateUrl: 'main.html',
      controller: 'AppCtrl'
    })
    //the login display
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'authController'
    })
    //the signup display
    .when('/register', {
      templateUrl: 'register.html',
      controller: 'authController'
    });
});

myApp.factory('postService', function($resource) {
	return $resource('/api/posts/:id');
});

myApp.controller('AppCtrl', function(postService, $scope, $rootScope, $http, $location){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {title: '', text: '', created_at: ''};
	  });
	};

	$scope.remove = function(id){
		console.log(id);
		$http.delete('/api/posts/' + id).success(function() {
			$scope.posts = postService.query();
	    	$scope.newPost = {title: '', text: '', created_at: ''};
		})
	};

	$scope.edit = function(id){
		console.log(id);
		$http.get('/api/posts/' + id).success(function(data){
			$scope.posts = postService.query();
	    	$scope.newPost = data;
		});
	};

	$scope.update = function() {
		console.log($scope.newPost._id);
		$http.put('/api/posts/' + $scope.newPost._id, $scope.newPost).success(function(data){
			$scope.posts = postService.query();	
			$scope.newPost = {title: '', text: '', created_at: ''};		
		});

	}
});

myApp.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});