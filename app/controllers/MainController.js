module.exports = function($scope, $rootScope, $mdToast, $window, facebookService, $mdDialog, $mdMedia) {
  //scopeS
  $scope.searchContents = '';
  $scope.status = '';
  $scope.images = [];
  $scope.loadingResults = false;
  $scope.customFullscreen = $mdMedia('xs') || $mdMedia('sm');
  $scope.showLoadMore = false;
  $scope.imgType = 'All';
  $scope.size = 'All';

  $scope.sizes = {
    'All': '',
    'Large': '&tbs=isz:l',
    'Medium': '&tbs=isz:m',
    'Icon': '&tba=isz:i'
  }

  $scope.imgTypes = {
    'All': '',
    'Face': '&tbs=itp:face',
    'Photo': '&tbs=itp:photo',
    'Clipart': '&tbs=itp:clipart',
    'Line drawing': '&tbs=itp:lineart'
  }

  $rootScope.postMessage = '';
  $rootScope.pageToken = '';
  $rootScope.photoIdToken = '';
  $rootScope.scheduleDate = '';
  $rootScope.selectedImage = '';

  //requires
  require('jquery')
  var https = require('https')
  var cheerio = require('cheerio')
  var querystring = require('querystring')

  //vars
	var cors_api_url = 'https://google-cors-server.herokuapp.com/';

  function DialogController($scope, $rootScope, $mdDialog) {
    console.log('DialogController image : ' + $rootScope.selectedImage);
    $scope.selectedImage = $rootScope.selectedImage;
    $scope.dateValue = (new Date).getTime();
    $scope.hide = function() {
      $mdDialog.hide();
    };
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
    $scope.answer = function() {
      uploadPhoto($rootScope.selectedImage)
      $rootScope.postMessage = $scope.postMessage;
      $rootScope.scheduleDate = Math.floor($scope.dateValue / 1000);
      switch ($scope.postType) {
        case ('Post'):
          //post
          $mdDialog.hide();
          return;
        case ('Schedule'):
          schedulePost();
          $mdDialog.hide();
          return;
        case ('Draft'):
          //draft
          $mdDialog.hide();
          return;
        default :
          console.log('Default')
          return;
      }
    };
    $scope.isScheduledPost = false;
    $scope.postMessage = '';
    $scope.postType = 'Post'

    $scope.postOptions = [
      'Post',
      'Schedule',
      'Draft'
    ]

    $scope.$watch('postType', function() {      
      if ($scope.postType == 'Schedule') {
        $scope.isScheduledPost = true
      } else {
        $scope.isScheduledPost = false
      }
    })
  }

  schedulePost = function() {
    // post image unpublished no story 
    // get object id of image
    // post to feed unpublished with object id
    FB.api(
      "/608245079324459/feed",
      "POST",
      {
        'access_token' : $rootScope.pageToken,
        'message' :  $rootScope.postMessage,
        'object_attachment' : $rootScope.photoIdToken,
        'scheduled_publish_time' : $rootScope.scheduleDate,
        'published' : false
      },
      function (response) {
        if (response && !response.error) {
          console.log(response)
        } else {
          console.log(response.error)
        }
      }
    )


  };

  $scope.showDialog = function(index) {
    $rootScope.selectedImage = $scope.imgArray[index]
    //uploadPhoto($scope.imgArray[index]);
    var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '../partials/PostDialog.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        fullscreen: true
      });
  }

	showSimpleToast = function(text) {
    $mdToast.show(
      $mdToast.simple()
        .textContent(text)
        .position("top right")
        .hideDelay(3000)
    );
  };

  function doCORSRequest(options, printResult) {
    var x = new XMLHttpRequest();
    x.open(options.method, cors_api_url + options.url);
    x.onload = x.onerror = function() {
      printResult(
        options.method + ' ' + options.url + '\n' +
        x.status + ' ' + x.statusText + '\n\n' +
        (x.responseText || '')
      );
    };
    x.send(options.data);
  }

  function setDelay(i) {
	  setTimeout(function(){
			//var results = imageSearch($scope.searchContents, callback, (i*10), 10)
	  }, i*1000)
	}

	function getSubStr(str) {
    var a = str.indexOf('/imgres?imgurl');

    if (a == -1)
       return '';

    var b = str.indexOf('&', a+1);

    if (b == -1)
       return '';

    return str.substr(a+15, b-a-15);
	}

	$scope.search = function() {

		if ($scope.searchContents.length > 0) {
      $scope.loadingResults = true;
			$scope.imgArray = [];

      var requestURL = 'https://google.com/search?tbm=isch'
      if ($scope.imgTypes[$scope.imgType].length > 0) requestURL += $scope.imgTypes[$scope.imgType]
      if ($scope.sizes[$scope.size].length > 0) requestURL += $scope.sizes[$scope.size]
      requestURL += '&q='+ $scope.searchContents;
			doCORSRequest({
        method: 'GET',
        url: requestURL
      }, function printResult(result) {
        var $ = cheerio.load(result);
         $scope.imgArray = $('#res img').parent().map(function() {
			      var href = $(this).attr('href');
			      var params = querystring.parse(href);
			      return params['/imgres?imgurl'];
			    });
        $scope.loadingResults = false;
        $scope.showLoadMore = true;
     		$scope.$apply()
     	})
		} else {
			showSimpleToast('You must fill in the search!')
      //$scope.getAccessPageToken();
		}
		//
	}
  uploadPhoto = function(image) {
    console.log('uploading')
    facebookService.uploadPhoto(image) 
      .then(function(response) {
        console.log(response.id)
        $rootScope.photoIdToken = response.id;
      })
  };

  $scope.getAccessPageToken = function() {
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        console.log('Logged in.');
        facebookService.getPageToken() 
          .then(function(response) {
            $rootScope.pageToken = response.access_token;
          }
        );
      }
      else {
        FB.login();
      }
    })
  };
	
  $scope.loadMore = function() {
    //$scope.getAccessPageToken();
    $scope.showLoadMore = false;
    $scope.searchContents = $scope.searchContents + 's';
    $scope.search();
    var text = $scope.searchContents.slice(0, -1)
    $scope.searchContents = text;
  }

  $scope.login = function() {
    FB.init({
      appId      : '558268211000991',
      xfbml      : true,
      version    : 'v2.5'
    });

    $scope.getAccessPageToken();
  }
}