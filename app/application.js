require('angular')
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('angular-material');

var MainController = require('./controllers/MainController')
var app = angular.module('app', ['ngMaterial'])

app.controller('MainController', ['$scope', '$rootScope', '$mdToast', '$window', 'facebookService', '$mdDialog', '$mdMedia',  MainController])

app.factory('facebookService', function($q, $rootScope) {
	return {
	  getPageToken: function() {
	  	var deferred = $q.defer();
			FB.api(
			  '/608245079324459',
			  'GET',
			  {"fields":"access_token"},
			  function(response) {
			      if (!response || response.error) {
	            deferred.reject('Error occured');
	          } else {
	            deferred.resolve(response);
	            console.log('page token')
	            console.log(response)
	          }
	      });
	      return deferred.promise;
	    },
		uploadPhoto: function(image) {
	  	var deferred = $q.defer();
			FB.api(
		    "/608245079324459/photos",
		    "POST",
		    {
	    	  'access_token' : $rootScope.pageToken,
	        "url": image,
	        'published' : false,
					'no_story' : true
		    },
			  function(response) {
		      if (!response || response.error) {
	          deferred.reject('Error occured');
	        } else {
	          deferred.resolve(response);
	        }
	      });
	      return deferred.promise;
	    }
	  }
});