var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', function($http){
    var o = {
	posts: []
    };

    o.getAll = function() {
	return $http.get('/posts').then(function(response) {
	    angular.copy(response.data, o.posts);
	    console.log(o.posts);
	    return response.data;
	});
    };

    o.create = function(post) {
	return $http.post('/posts', post).then(function(response) {
	    o.posts.push(response.data);
	    return response.data;
	});
    };

    o.upvote = function(post) {
	return $http.put('/posts/' + post._id + '/upvote').then(function(response) {
	    post.upvotes += 1;
	    return response.data;
	});
    };
    
    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function($scope,posts){
	$scope.posts = posts.posts;
	$scope.addPost = function(){
	    if(!$scope.title || $scope.title === '') { return; }
	    posts.create({
		title: $scope.title,
		link: $scope.link
	    });
	    $scope.title = '';
	    $scope.link = '';
	};
	$scope.incrementUpvotes = function(post) {
	    posts.upvote(post);
	};
    }
]);

app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function($scope, $stateParams, posts){
	$scope.post = posts.posts[$stateParams.id];

	$scope.addComment = function() {
	    if($scope.body === '') {return;}
	    $scope.post.comments.push({
		body: $scope.body,
		author: 'user',
		upvotes: 0
	    });
	    $scope.body = '';
	};
    }
]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
	    .state('home', {
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl',
		resolve: {
		    postPromise:  function(posts) {
			return posts.getAll();
		    }
		}
	    })
	    .state('posts', {
		url: '/#!/posts/{id}',
		templateUrl: '/posts.html',
		controller: 'PostsCtrl'
	    });

//	$location.html5Mode(true);
	
	$urlRouterProvider.otherwise('home');
    }
]);
