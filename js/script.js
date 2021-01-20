$(document).ready(function(){

    var map;
    var pageData;

    var filterMap = {
        "at-home-sample": "At-home Sample",
        "driven-in-test": "Drive-in",
        "walk-in-test": "Walk-in",
        "at-home-test": "At-home Test",
        "community-test": "Community test",
        "Antigen": "AntigenTests",
        "PCR_Molecular": "PCR Molecular Tests",
        "Serology": "Serology Tests",
        "pooled-testing": "Pooled Testing",
        "saliva": "Saliva Test",
        "oral_swab_sample": "Oropharyngeal Swab Test",
        "nasal_swab_sample": "Nasopharyngeal Swab Test",
        "serology_sample": "Serum Test",
        "less_than_30mins": "less_than_30 mins",
        "less_than_24hrs": "Less than 24 hrs",
        "24-48hrs": "Within 24-48 hrs",
        "48-72hrs": "48-72 hrs",
        "72-96hrs": "72-96hrs"
    }

    function fetchLabInfo() {
        $(".spinner-wrapper").show()
        $.ajax({
			type: "POST",
			url: "https://ncoviq.com:9090/v2/api/getLabs",
			// The key needs to match your method's input parameter (case-sensitive).
			data: JSON.stringify({ "state": "all" }),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data){
                $(".spinner-wrapper").hide();
                pageData = data.response.labData;
                displayLabs(data.response.labData);
                initMap(data.response.labData);
			},
			error: function(errMsg) {
                $(".spinner-wrapper").hide();
				alert(errMsg);
            }
        });
    }
    fetchLabInfo()

    // Initialize and add the map
    function initMap(data) {
        // The location of Uluru
        // const initialPositon = { lat: parseFloat(data[0].latitude), lng: parseFloat(data[0].longitude) };
        // map = new google.maps.Map(document.getElementById("map"), {
        //     zoom: 4,
        // });
        // map.setCenter(initialPositon);

        // var infowindow = new google.maps.InfoWindow();

        // for(let i=0; i<data.length;i+=1) {
        //     let labData = data[i];
        //     // The marker, positioned at Uluru
        //     const marker = new google.maps.Marker({
        //         position: new google.maps.LatLng(labData.latitude, labData.longitude),
        //         map: map,
        //     });

        //     google.maps.event.addListener(marker, 'click', (function(marker, i) {
        //         return function() {
        //             console.log($('#'+labData.labId).position().top);
        //             $("#lab-list-screen").scrollTop(0);
        //             console.log($('#'+labData.labId).position().top);

        //             setTimeout(function(){ 
        //                 $("#lab-list-screen").animate({ scrollTop: $('#'+labData.labId).position().top + - 25 }, { duration: 'medium', easing: 'swing' });
        //             }, 100);                    
        //             infowindow.setContent(labData.managingOrganization);
        //             infowindow.open(map, marker);
        //         }
        //     })(marker, i));
        // }

        map = L.map('map').setView([parseFloat(data[0].latitude), parseFloat(data[0].longitude)], 2);
        var virusIQmarker = L.icon({
            iconUrl: 'img/inactive.svg',
            shadowUrl: 'img/iq_marker_shadow.png',
        
            iconSize:     [40, 60], // size of the icon
            shadowSize:   [41, 41], // size of the shadow
            iconAnchor:   [20, 60], // point of the icon which will correspond to marker's location
            shadowAnchor: [10, 41],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });

        L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);
        for(let i=0; i<data.length;i+=1) {
            let labData = data[i];
            L.marker([labData.latitude, labData.longitude], {icon: virusIQmarker}).addTo(map)
            .bindPopup(labData.managingOrganization)
            .on('click', function(e) {
                console.log($('#'+labData.labId).position().top);
                $("#lab-list-screen").scrollTop(0);
                console.log($('#'+labData.labId).position().top);

                setTimeout(function(){ 
                    $("#lab-list-screen").animate({ scrollTop: $('#'+labData.labId).position().top + - 25 }, { duration: 'medium', easing: 'swing' });
                }, 100);                    
            });
        }
    }

    function displayLabs(data) {
        $("#lab-list-screen").empty();
        $(".lab-count").empty();
        $(".lab-count").append(data.filter(function(e) { return e.is_valid_lab; }).length);
        for(let i=0; i<data.length;i+=1) {
            let labData = data[i];
            if(labData.is_valid_lab) {
                $("#lab-list-screen").append(`<div class="card card-section" id="${labData.labId}"	>   
                    <div class="card-body">			
                        <h5 class="card-title">${labData.managingOrganization}</h5>
                        <p class="card-text">${labData.serviceCapabilities}</p>			
                        <p class="card-text">${labData.typeOfCovidTest}</p>			
                        <p class="card-text">${labData.testTurnaround}</p>		  
                    </div>		
                </div>`)
            }
        }
    }

    $(".filter-option-wrapper").click(function(e){
        e.stopPropagation();
    })
    $(document).on("click", function () {
        if($(".filter-container").length>0) {
            $(".filter-container").hide();
        }
    });

    $(document).on("click",".card-section",function() {
        var self = this;
        let index = pageData.findIndex(function(lab){
            return parseInt($(self).attr("id")) == lab.labId;
        });
        map.setView([parseFloat(pageData[0].latitude), parseFloat(pageData[0].longitude)], 2)
        if(pageData[index].latitude && pageData[index].longitude) {
            // map.setZoom(17);
            // map.panTo({ lat: parseFloat(pageData[index].latitude), lng: parseFloat(pageData[index].longitude) });
            map.setView([parseFloat(pageData[index].latitude), parseFloat(pageData[index].longitude)], 13);

        }
    });


    // filter functionality
    var selectedFilter = [];
    var appliedFilter = [];

    $(".apply_filters_btn").click(function(){
        appliedFilter = [];
        $(".filter-checkbox").each(function(i, obj) {
            if(obj.checked) {
                appliedFilter.push(obj.id);
            } 
        });
        
        $(".filter-container").hide();

        if(appliedFilter.length <= 0) {
            displayLabs(pageData);
            return
        }
        let filteredLab = [];
        $.each(pageData, function(i, lab) {
            $.each(appliedFilter, function(idx, filter) {
                let filterValue = filterMap[filter].toLowerCase().replace(/ /g,'');
                if(filteredLab.map(function(e) { return e.labId; }).indexOf(lab.labId) === -1) {
                    if(lab.serviceCapabilities.toLowerCase().replace(/ /g,'').includes(filterValue)) {
                        filteredLab.push(lab);
                    }
                    if(lab.typeOfCovidTest.toLowerCase().replace(/ /g,'').includes(filterValue)) {
                        filteredLab.push(lab);
                    }
                    if(lab.typeOfSpecimenCollected.toLowerCase().replace(/ /g,'').includes(filterValue)) {
                        filteredLab.push(lab);
                    }
                    if(lab.testTurnaround.toLowerCase().replace(/ /g,'').includes(filterValue)) {
                        filteredLab.push(lab);
                    }
                }
            });
        });
        displayLabs(filteredLab);
    });

    $(".filter-checkbox").change(function() {
        var self = this;
        if (this.checked) {
            // the checkbox is now checked 
            selectedFilter.push(this.id);
        } else {
            // the checkbox is now no longer checked
            selectedFilter = $.grep(selectedFilter, function(value) {
                return value != self.id;
            });
        }
    });
    
    $("#lab_filter_button").click(function(e){
        selectedFilter = [];
        $(".filter-checkbox").each(function(i, obj) {
            obj.checked = appliedFilter.includes(obj.id);
        });

        $(".filter-container").toggle();
        e.stopPropagation();
    })
    
});






L.TileLayer.Grayscale = L.TileLayer.extend({
	options: {
		quotaRed: 21,
		quotaGreen: 71,
		quotaBlue: 8,
		quotaDividerTune: 0,
		quotaDivider: function() {
			return this.quotaRed + this.quotaGreen + this.quotaBlue + this.quotaDividerTune;
		}
	},

	initialize: function (url, options) {
		options = options || {}
		options.crossOrigin = true;
		L.TileLayer.prototype.initialize.call(this, url, options);

		this.on('tileload', function(e) {
			this._makeGrayscale(e.tile);
		});
	},

	_createTile: function () {
		var tile = L.TileLayer.prototype._createTile.call(this);
		tile.crossOrigin = "Anonymous";
		return tile;
	},

	_makeGrayscale: function (img) {
		if (img.getAttribute('data-grayscaled'))
			return;

                img.crossOrigin = '';
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		var ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var pix = imgd.data;
		for (var i = 0, n = pix.length; i < n; i += 4) {
                        pix[i] = pix[i + 1] = pix[i + 2] = (this.options.quotaRed * pix[i] + this.options.quotaGreen * pix[i + 1] + this.options.quotaBlue * pix[i + 2]) / this.options.quotaDivider();
		}
		ctx.putImageData(imgd, 0, 0);
		img.setAttribute('data-grayscaled', true);
		img.src = canvas.toDataURL();
	}
});

L.tileLayer.grayscale = function (url, options) {
	return new L.TileLayer.Grayscale(url, options);
};