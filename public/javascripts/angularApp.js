var app = angular.module('flapperNews', ['ui.router']);

app.factory('posts', ['$http', function ($http) {
    var o = {
        posts: []
    };

    o.getAll = function () {
        return $http.get('/posts').then(function (response) {
            angular.copy(response.data, o.posts);
            console.log(o.posts);
            return response.data;
        });
    };

    o.create = function (post) {
        return $http.post('/posts', post).then(function (response) {
            o.posts.push(response.data);
            return response.data;
        });
    };

    o.upvote = function (post) {
        return $http.put('/posts/' + post._id + '/upvote').then(function (response) {
            post.upvotes += 1;
            return response.data;
        });
    };

    o.get = function (id) {
        return $http.get('/posts/' + id).then(function (response) {
            return response.data;
        });
    };

    o.addComment = function (id, comment, post) {
        return $http.post('/posts/' + id + '/comments', comment).then(function (response) {
            console.log("got to 3");
            post.comments.push(response.data);
            console.log("got to 4");
            return response.data;
        });
    };

    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
            .then(function (response) {
                comment.upvotes += 1;
                return response.data;
            });
    };

    return o;
}]);

app.controller('MainCtrl', [
    '$scope',
    'posts',
    function ($scope, posts) {
        $scope.posts = posts.posts;
        $scope.addPost = function () {
            if (!$scope.title || $scope.title === '') { return; }
            posts.create({
                title: $scope.title,
                link: $scope.link
            });
            $scope.title = '';
            $scope.link = '';
        };
        $scope.incrementUpvotes = function (post) {
            posts.upvote(post);
        };
    }
]);

app.controller('PostsCtrl', [
    '$scope',
    'post',
    'posts',
    function ($scope, post, posts) {
        $scope.post = post;

        $scope.addComment = function () {
            if ($scope.body === '') { return; }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user'
            },
            $scope.post);
            $scope.body = '';
        };

        $scope.incrementUpvotes = function (comment) {
            posts.upvoteComment(post, comment);
        };
    }
]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: function (posts) {
                        return posts.getAll();
                    }
                }
            })
            .state('posts', {
                url: '/posts/{id}',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });

        //	$location.html5Mode(true);

        $urlRouterProvider.otherwise('home');
    }
]);
