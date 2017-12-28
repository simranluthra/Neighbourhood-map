// Array of markers
let locations = [
  {
    Name: "Panorama and Science Centre",
    location: {
        lat: 29.9660,
        lng: 76.8341
    },
    show: true,
    selected: false,
  },
  {
    Name: "Brahma Sarovar",
    location: {
        lat: 29.9614,
        lng: 76.8286
    },
    show: true,
    selected: false,
  },
  {
    Name: "Sheikh Chilli's Tomb",
    location: {
        lat: 29.9763,
        lng: 76.8282
    },
    show: true,
    selected: false,
  },
  {
    Name: "National Institute of Technology",
    location: {
        lat: 29.9490,
        lng: 76.8173
    },
    show: true,
    selected: false,
  },
  {
    Name: "LNJP Hospital",
    location: {
        lat: 29.965072,
        lng: 76.820581
    },
    show: true,
    selected: false,
  }
];

//helper varaibles
let map;
let navbar = document.getElementById('title');
let markers = [];

function error(){
  $('#map').text("Something has gone wrong!");
  $('aside').addClass("d-none");
}

function initMap() {
    let mapSettings = {
        center: {
            lat: 29.9614,
            lng: 76.8286
        },
        zoom: 15,
        mapTypeControl: true,
        mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.BOTTOM_LEFT
        },
    };
    map = new google.maps.Map(document.getElementById('map'), mapSettings);
    markerDetail = new google.maps.InfoWindow();
    ko.applyBindings(new mapModel());
}

function mapModel() {
    let bounds = new google.maps.LatLngBounds();
    this.searchPlace = ko.observable();
    for (let i = 0; i < locations.length; i++) {
        let marker = new google.maps.Marker({
            map: map,
            position: locations[i].location,
            name: locations[i].Name,
            animation: google.maps.Animation.DROP,
            show: ko.observable(locations[i].show),
            selected: ko.observable(locations[i].selected)
        });

        markers.push(marker);
        bounds.extend(marker.position);
        markers[markers.length - 1].setVisible(markers[markers.length - 1].show());
    }

    // Function to add Click functionality to the markers
    for (let i = 0; i < markers.length; i++) {
        (function(marker) {
            marker.addListener('click', () => {
                setSelected(marker);
            });
        })(markers[i]);
    };

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(navbar);

    //search function
    this.search = function() {
        markerDetail.close();
        let text = this.searchPlace();
        if (text.length === 0) {
            this.showAll(true);
        }
        else{
            for (let i = 0; i < markers.length; i++) {
                if (markers[i].name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
                    markers[i].setVisible(true);
                    markers[i].show(true);
                } else {
                    markers[i].setVisible(false);
                    markers[i].show(false);
                }
            }
        }
        markerDetail.close();
    };
    //show all markers
    this.showAll = function(show) {
        for (let i = 0; i < markers.length; i++) {
            markers[i].setVisible(show);
            markers[i].show(show);
        }
    };

    // function to make all the markers unselected.
    unselectAll = function() {
        for (let i = 0; i < markers.length; i++) {
            markers[i].selected(false);
        }
    };

    setSelected = function(marker) {
        unselectAll();
        marker.selected(true);
        this.currentMarker = marker;
        let loc = '';
        loc+=marker.position.lat();
        loc+=","
        loc+=marker.position.lng();

        $.ajax({
          dataType: "json",
          url: 'https://api.foursquare.com/v2/venues/explore',
          type: 'GET',
          data: {
            client_id: 'HBDYZVOGBGPPL0WTVGYTQUFHKRR54NJUKLI4IY0CP3GPSGEN',
            client_secret: 'ZVNCR0E4KRXEJJBHSA3XFCDZZZSTTWAZ0CCFAYTCR4SCKKF5',
            ll: loc,
            section: 'topPicks',
            v: '20170801'
          },
          success: function(response){
           //console.log(response.response.groups[0].items[3].venue.name)
            if (response.response.groups[0].items[0] == undefined){
              markerDetail.setContent("<h5>" + marker.name + "</h5>" +
                                      "<h6>Nothing found:</h6>");
            }
            else{
              markerDetail.setContent("<h5>" + marker.name + "</h5>" +
                                      "<h6>Top 2 picks for you:</h6>"+
                                      "<li>" +
                                      response.response.groups[0].items[0].venue.name
                                      + "</li>" +
                                      "<li>" +
                                      response.response.groups[0].items[1].venue.name
                                      + "</li>"
                                      );
             }
          },
          error:  function(xhr,status,error){
            markerDetail.setContent("Something Wrong happened")
          }
        });
        markerDetail.open(map, marker);
        //marker animated
        this.animateMarker = function(marker) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 843);
        };

        this.animateMarker(marker);
    };
    //to fit map to the bounds
    map.fitBounds(bounds);

}
