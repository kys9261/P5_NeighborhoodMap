//Intialize marker list.
var markerInit = [{
    title: "Home",
    lat: 37.5362017,
    lng: 126.8438297,
    visible: true
  }, {
    title: "GangNam-Station",
    lat: 37.4976048,
    lng: 127.0273028,
    visible: true
  }, {
    title: "GwangHwa-Moon",
    lat: 37.5754455,
    lng: 126.9766291,
    visible: true
  }
];
           
//add marker infowindow.
var addMarkerWindow = '<div id="addwin" style="display: hidden"><center> <h2>Input Marker Title!</h2><br><input type="text" data-bind="value:title" placeholder="Intput title"></input>&nbsp;<button data-bind="click:addMarker">Submit</button></center></div>';

//click marker infowindow.
var clickMarkerWindow = '<div id="infowin" style="display: hidden"><center><h1>$title</h1></center></div>';

//this var is change method between applyBindings() and cleanNode(). 
//because when I use applyBinding() method twice, then show the error like this. ("Error You cannot apply bindings multiple times to the same element")
//So first time is use applyBinding() and next time use cleanNode().
var addMarkerCount = 0;

//initialize google map.
function initialize(){
    var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(37.5591237,126.9695029),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    addwindow = new google.maps.InfoWindow({
        content: addMarkerWindow
    });

    //This listener purpose is using nockout function in infowindow.
    google.maps.event.addListener(addwindow, "domready", function(){
        if(addMarkerCount === 0){
            ko.applyBindings(model, document.getElementById("addwin"));
            addMarkerCount++;  
        }else{
            ko.cleanNode(model, document.getElementById("addwin"));
        }
    });

    //Add listener to map for show add marker window.
    google.maps.event.addListener(map, "click", function(e){
        addwindow.open(map);
        addwindow.setPosition(e.latLng);
        var position = String(e.latLng).split(",");
        lats = position[0].replace("(","");
        lngs = position[1].replace(")","");
    });
}

//Make marker function.
var makeMarker = function(data){
    this.title=ko.observable(data.title);
    this.visible=ko.observable(data.visible);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.fullSearch=ko.computed(function(){return this.title().toLowerCase();}, this);
    
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.lat(), this.lng()),
        map: map,
        title: this.title()
    });
    
    //Visivility setting for search.
    this.VisibilityMap=ko.computed(function (){
        if (this.visible()===false){ 
            this.marker.setMap(null);
        }else {
            this.marker.setMap(map);}
    },this);

    //Add listener to marker click event.
    var marker = this.marker;
    google.maps.event.addListener(marker, "click", function(e) {
        var infowindow = new google.maps.InfoWindow({
            content: '<div id="infowin" style="display: hidden"><center><h1>'+marker.title+'</h1></center></div>'
        });
        infowindow.open(marker.map, marker);
    });  
    addwindow.close();
};

//Side list setting function.
var PageGridModel = function(){
    this.title = ko.observable("");
    this.query = ko.observable("");
    this.markerList = ko.observableArray([]);

    for(var marker in markerInit){
        this.markerList.push(new makeMarker(markerInit[marker]));
    }

    this.addMarker = function(){
        this.markerList.push(new makeMarker({title: this.title(), lat:lats, lng:lngs, visible:true}));
    };

    this.filteredMarkers = ko.dependentObservable(function() {
        var filter = this.query().toLowerCase();
        if (!filter) {
            this.markerList().forEach(function(marker){marker.visible(true);});
            return this.markerList();
        } else {
            return ko.utils.arrayFilter(this.markerList(), function(marker) {
                if (marker.fullSearch().match(filter)!==null){
                    marker.visible(true);
                    return true;
                }else{
                   marker.visible(false);
                    return false;
                }
            });
        }
    },this);

    this.gridViewModel = new ko.simpleGrid.viewModel({
    data: this.filteredMarkers,
    columns: [
      {headerText: "Marker Title", rowText: "title"}
    ],
    pageSize: 15
  });
};

window.onload = function(){
    initialize();
    model = new PageGridModel();
    ko.applyBindings(model);
};