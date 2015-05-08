//Intialize marker list.
var markerInit = [{
    title: "House",
    comment: "Here is my House.",
    lat: 37.5362017,
    lng: 126.8438297,
    visible: true
  }, {
    title: "GangNam-Station",
    comment: "Do you know GangNam Style?",
    lat: 37.4976048,
    lng: 127.0273028,
    visible: true
  }, {
    title: "GwangHwa-Gate",
    comment: "Here is traditional gate of palace.",
    lat: 37.5754455,
    lng: 126.9766291,
    visible: true
  }
];
           
//initialize google map.
function initialize(){

    var initLocation = new google.maps.LatLng(37.575282,126.976753);

    var mapOptions = {
        zoom: 11,
        center: initLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    //google map panorama option
    var panoramaOptions = {
        position: initLocation,
        pov: {
            heading: 20,
            pitch: 10
        }
    };
    
    //google map panorama
    var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
    map.setStreetView(panorama);
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
        title: this.title(),
        comment: data.comment
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
            content: document.getElementById('infomation').value = marker.title +' <br> '+ marker.comment
        });
        infowindow.open(marker.map, marker);
    });  
};

//Side list setting function.
var PageGridModel = function(){
    this.comment = ko.observable("");
    this.query = ko.observable("");
    this.markerList = ko.observableArray([]);

    for(var marker in markerInit){
        this.markerList.push(new makeMarker(markerInit[marker]));
    }

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