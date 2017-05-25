angular.module('app', []);
var tree = {
	'Food': {
		'Cafe': [{
			name: 'Cafe 1',
			lat: 40,
			lng: -86
		},
        {
			name: 'Cafe 2',
			lat: 40.1,
			lng: -86.2
		}, 
		{
			name: 'Cafe 3',
			lat: 40.2,
			lng: -85.9
		}],
		'Restaurants': [{
			name: 'Rest 1',
			lat: 39.8,
			lng: -85.7
		},
        {
			name: 'Rest 2',
			lat: 40.1,
			lng: -85.9
		}],
	},
	'Transport': {
		'Bus stations': [{
			name: 'Bus stop 1',
			lat: 39.7,
			lng: -86.1
		}],
		'Airports': [{
			name: 'Airport 1',
			lat:40.3,
			lng:-85.8
		}],
		'Subway': [{
			name: 'Subway 1',
			lat: 39.9,
			lng: -85.6
		}]
	}
}

angular.module('app').directive('map', function() {
    return {
        restrict: 'E',
        replace: true,
		scope: true,
        template: '<div></div>',
        link: function(scope, element, attrs) {
            var map = L.map(attrs.id, {
                center: [40, -86],
                zoom: 10
            });
            var tileLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
              maxZoom: 18
            }).addTo(map);
			var markers = new L.FeatureGroup();
			var bounceOptions = { 
				bounceOnAdd: true, 
				bounceOnAddOptions: {duration: 500, height: 100}, 
			  }
            //add markers dynamically
            var points = scope.placesToShow;
            updatePoints(points);
		

            function updatePoints(pts) {
				map.removeLayer(markers);
				markers = new L.FeatureGroup();
               for (let p in pts) {
                  let marker = L.marker([pts[p].lat, pts[p].lng], bounceOptions);
				  marker.bindPopup(pts[p].name).addTo(map);
				  markers.addLayer(marker);
				  marker.once('mouseover', function() {
					  //markers.removeLayer(marker);
					  pts[p] && scope.addToSelected(pts[p]);
					  scope.$apply();
				  });
				  
               }
			   
			   map.addLayer(markers);
            }
			

            //add a watch on the scope to update your points.
            // whatever scope property that is passed into
            // the poinsource="" attribute will now update the points
            scope.$watch(attrs.pointsource, function(value) {
               updatePoints(value);
            });
        }
    };
});

angular.module('app').controller('MapCtrl', function($scope, $http) {
	$scope.tree = tree;
	$scope.selected = [];
   //here's the property you can just update.
   $scope.placesToShow = [];
   
   $scope.selectPoint = function($event, point) {
	   $event.stopPropagation();
	   console.log(point);
	   if (!point.active) {
		 point.active = true;
		 $scope.placesToShow = $scope.placesToShow.concat([point]);
	     console.log($scope.placesToShow);  
	   }
	   
   }
   
   $scope.selectMultiplePoints = function($event, category) {
	   $event.stopPropagation();
	   //$scope.placesToShow = [];
	   if (category instanceof Array) {
		   var itemsToAdd = [];
		    category.forEach(function(item) {
				if (!item.active) {
					item.active = true;
					itemsToAdd.push(item);
				}
			});
			$scope.placesToShow = $scope.placesToShow.concat(itemsToAdd);
			//
	    } else { // it's parent category, continue search recursively
		   for (var prop in category) {
			   if (category.hasOwnProperty(prop)) {

					   $scope.selectMultiplePoints($event, category[prop]);
				   }
			   }
	   }
   }
   
   $scope.addToSelected = function(point) {
	   
	   if ($scope.selected.indexOf(point) == -1) {
	      $scope.selected.push(point);
	   }
   }
   
   $scope.removeFromSelected = function(index) {
	   var itemToRemove = $scope.selected[index];
	   itemToRemove.active = false;
	   $scope.selected.splice(index, 1);
	   
	   var index2 = $scope.placesToShow.indexOf(itemToRemove);
	   $scope.placesToShow.splice(index2, 1);
   }

   //here's some contrived controller method to demo updating the property.
   $scope.getPointsFromSomewhere = function() {
     $http.get('/Get/Points/From/Somewhere').success(function(somepoints) {
         $scope.placesToShow = somepoints;
     });
   }
});