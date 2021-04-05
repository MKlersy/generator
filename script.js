var map;
var marker;
var geocoder;
var cityCircle;
myApp = {};
myApp.address = "";
myApp.lat = "";
myApp.lng = "";
myApp.numRue = "";
myApp.rue = "";
myApp.ville = "";
myApp.pays = "";
myApp.codeP = "";
myApp.lastname = "";
myApp.name = "";
myApp.gender = "";
function initMap() {
geocoder = new google.maps.Geocoder();

map = new google.maps.Map(document.getElementById("map"), {
    zoom:12,
    center: { lat: -34.397, lng: 150.644 }
});
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        myApp.lat = position.coords.latitude;
        myApp.lng = position.coords.longitude;
        map.setCenter(initialLocation);
        var marker = new google.maps.Marker({
            // draggable:true,
            position:new google.maps.LatLng(myApp.lat, myApp.lng),
            map,
            label:"Votre position"
        });

        cityCircle = new google.maps.Circle({
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35,
            map,
            center: new google.maps.LatLng(myApp.lat, myApp.lng),
            radius: 8000,
        });

        // var markerProposition = new google.maps.Marker({
        //     draggable:true,
        //     position:new google.maps.LatLng(myApp.lat + Math.random() * 0.2, myApp.lng + Math.random() * 0.2),
        //     map,
        //     label:"Nouvelle position"
        // });
findPin();
    });
}

}

function findPin() {
var bounds = cityCircle.getBounds();
map.fitBounds(bounds);
var sw = bounds.getSouthWest();
var ne = bounds.getNorthEast();
for (var i = 0; i < 1; i++) {
    var ptLat = Math.random() * (ne.lat() - sw.lat()) + sw.lat();
    var ptLng = Math.random() * (ne.lng() - sw.lng()) + sw.lng();
    var point = new google.maps.LatLng(ptLat, ptLng);
    if (google.maps.geometry.spherical.computeDistanceBetween(point, cityCircle.getCenter()) < cityCircle.getRadius()) {
        var markerProposition = new google.maps.Marker({
            // draggable:true,
            position:point,
            map,
            label:"Nouvelle position"
        });
        geocodePosition(point);
    }
}
}


function geocodePosition(pos) {
geocoder.geocode({
    latLng: pos
}, function(responses) {
    if (responses && responses.length > 0 ) {
        var address = responses[0].formatted_address;
        myApp.address = address;
        myApp.address = myApp.address.toUpperCase();
        var regex = /([0-9]){1,} ([\s\S]){1,}, ([0-9]){5} ([\s\S]){1,}/g;
        if(address.match(regex)) {
            alert(responses[0].formatted_address);
            myApp.numRue = responses[0]["address_components"][0]["long_name"];
            myApp.numRue = myApp.numRue.toUpperCase(); 
            myApp.rue = responses[0]["address_components"][1]["short_name"];
            myApp.rue = myApp.rue.toUpperCase();
            myApp.ville = responses[0]["address_components"][2]["long_name"];
            myApp.ville = myApp.ville.toUpperCase();
            myApp.pays = responses[0]["address_components"][5]["long_name"];
            myApp.pays = myApp.pays.toUpperCase();
            myApp.codeP = responses[0]["address_components"][6]["long_name"];
            myApp.codeP = myApp.codeP.toUpperCase();
            console.log(myApp.numRue, myApp.rue, myApp.ville, myApp.pays, myApp.codeP);

            myApp.lastname = prompt("Entrez votre nom:", "Ici...");
            myApp.lastname = myApp.lastname.toUpperCase();
            myApp.name = prompt("Entrez votre prenom:", "Ici...");
            myApp.name = myApp.name.toUpperCase()
            myApp.gender = prompt("Entrez votre genre (M ou Mme):", "Ici...");
            console.log(address, myApp.gender + ".", myApp.lastname, myApp.name);
            outputPdf();
        } else {
            findPin();
        }
    } else {
        findPin();
        console.log('Cannot determine address at this location.');
    }
});
}


var url = "./EDF_JUSTIFICATIF.pdf";
function outputPdf() {
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.responseType = 'arraybuffer';

xhr.onload = function() {
    if (this.status == 200) {
        on_file(url.split(/\//).pop(), this.response);
    } else {
        on_error('failed to load URL (code: ' + this.status + ')');
    }
};

xhr.send();

}
var current_buffer;  
function on_file(filename, buf) {
current_buffer = buf;
list(current_buffer)
}
function list(buf) {
var field_specs;
field_specs = pdfform(minipdf).list_fields(buf);
console.log(field_specs);
var fields = {};//19

for (let x = 0; x < 11; x++) {//10 -> Nombre d'input
    var keys = Object.keys(field_specs);
    
    var node = keys[x];
    fields[node] = [];
    var index = parseInt(0, 10);
    console.log(keys, node, index);
    switch (x) {
        case 0:
            fields[node][index] = myApp.lastname + " " + myApp.name;
            break;
        case 1://Numero de compte
            fields[node][index] = myApp.numRue + " " + myApp.rue;
            break;
        case 2://Genre titulaire
            fields[node][index] = myApp.codeP + " " + myApp.ville;
            break;
        case 3://GROS TEXTE
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth();
            var monthArray = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
            var day = today.getDate();
            fields[node][index] = `Par la présente, EDF atteste que `+myApp.gender+`. `+myApp.name+` `+myApp.lastname+` est actuellement titulaire d'un contrat auprès d'EDF pour le logement situé au `+myApp.address+`.

Ce contrat a été établi au nom de `+myApp.gender+`. `+myApp.name+` `+myApp.lastname+` sur la base de ses déclarations.


Pour servir et valoir ce que de droit.


A Paris, le `+day+` `+monthArray[month]+` `+year+`.`;
            
            break;
        case 4:
            fields[node][index] = "2819892140";

            break;
        case 5:
            fields[node][index] = "2819892140";
            break;
        case 6:
            fields[node][index] = "1 34 3 314 659 291";

            break;
        case 7:
            fields[node][index] = myApp.numRue + " " + myApp.rue;
            break;
        case 8:
            fields[node][index] = myApp.codeP + " " + myApp.ville;
            break;
        case 9:
            fields[node][index] = myApp.gender + ".";
            break;
        case 10:
            fields[node][index] = myApp.lastname + " " + myApp.name;
            break;
        default:
            console.log("ERROR")
            break;
    }
    console.log(fields);
}


var filled_pdf;
try{
    filled_pdf = pdfform(minipdf).transform(buf, fields);
} catch(e) {
    return on_error(e);
};

var blob = new Blob([filled_pdf], {type: 'application/pdf'});
saveAs(blob, 'justificatif_domicile.pdf');
}

function on_error(e) {
console.error(e, e.stack);
}
