var reusableWorldMap = function(targetContainer) {

	var me = this;

 	me.canvasHeight = Math.floor(document.getElementById(targetContainer).offsetWidth / 2),
	me.canvasWidth = document.getElementById(targetContainer).offsetWidth,
	me.chartInitialized = false,
	me.defaults = {
		fill: '#CCCCCC'
	},
	me.graticule = d3.geo.graticule(),
	me.path,
	me.projection,
	me.svg,
	me.tooltipFunction = function(d, i) { return 'tooltip'; },
	me.topo,
	me.topoUrl,
	me.zoom = d3.behavior.zoom().scaleExtent([1, 9]).on('zoom', function() {
	 	console.log('zooming');
	});
		
	/**
 	 * @function
 	 * @description Initialize chart components and draw
 	 * base map / paths
 	 */
	me.initChart = function() {
		me.projection = d3.geo.mercator()
			.translate([me.canvasWidth/2, me.canvasHeight/2])
			.scale(me.canvasWidth / 2 / Math.PI);
		
		me.path = d3.geo.path().projection(me.projection);

		me.svg = d3.select('#' + targetContainer)
			.append('svg')
			.attr('width', me.canvasWidth)
			.attr('height', me.canvasHeight);
			//.call(me.zoom);
			//.on('click', me.click);
		
		me.g = me.svg.append('svg:g');
		
		d3.json(me.topoUrl, function(err, dat) {
			if(err) { console.warn(err); return; }
			
			me.topo = topojson.feature(dat, dat.objects.countries).features;
			me.chartInitialized = true;
			me.renderMap();
		}, me);
	}
	
	/**
 	 * @function
 	 * @description Render the basic map paths
 	 */
	me.renderMap = function() {
		
		me.g.append('path')
			.datum(me.graticule)
			.attr('class', 'graticule')
			.attr('d', me.path);
			
		me.g.append('path')
			.datum({
				type: 'LineString',
				coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]
			})
			.attr('class', 'equator')
			.attr('d', me.path);
			
		var countrySelection = me.g.selectAll('.country')
			.data(me.topo);
		
		countrySelection.enter()
			.append('path')
			.attr('class', 'country')
			.attr('d', me.path)
			.attr('id', function(d, i) {
				return d.id;
			})
			.style('fill', function(d, i) {
				return me.defaults.fill;
			});
		
		countrySelection.call(d3.helper.tooltip().text(me.tooltipFunction));
	}
	
	me.foo = function() {
		var arr = ['United States', 'Canada', 'Mexico', 'Finland', 'Australia', 'Japan'];
	
	
	
	
	
	
	
		
		var sel = me.g.selectAll('.country');
		
		sel.filter(function(e, j) {
				return arr.indexOf(e.properties.name) >= 0;
			})
			.style('fill', '#0000FF')
			.style('opacity', .8);
			
		sel.filter(function(e, j) {
				return arr.indexOf(e.properties.name) < 0;
			})
			.style('fill', me.defaults.fill);

	
	
	
	}
	
	me.bar = function() {
		var arr = ['Cuba', 'Haiti', 'Norway', 'France', 'Spain'];
	
	
	
	
	
	
	
		
		var sel = me.g.selectAll('.country');
		
		sel.filter(function(e, j) {
				return arr.indexOf(e.properties.name) >= 0;
			})
			.style('fill', '#FFCC33');
			
		sel.filter(function(e, j) {
				return arr.indexOf(e.properties.name) < 0;
			})
			.style('fill', me.defaults.fill);

	
	
	
	}
	
	/******************************
	 *
	 * SETTERS
	 *
	 *
	 ******************************/
	me.setTooltipFunction = function(fn) {
		me.tooltipFunction = fn;
		return me;
	}
	
	me.setTopoUrl = function(url) {
		me.topoUrl = url;
		return me;
	}
	

			
			
	//me.g.call(me.tip);

 /* var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;

  country
    .on("mousemove", function(d,i) {

      var mouse = d3.mouse(me.svg.node()).map( function(d) { return parseInt(d); } );

      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      }); 


  d3.csv("data/country-capitals.csv", function(err, capitals) {

    capitals.forEach(function(i){
      addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName );
    });

  });*/

	

	
	/**
 	 * @function
 	 * @description Initialize chart components
 	 */
	
	


/*d3.json("data/world-topo-min.json", function(error, world) {

  var countries = topojson.feature(world, world.objects.countries).features;

  topo = countries;
  
  console.debug(topo);
  me.draw(topo);

}, me);

me.draw = function(topo) {

  me.svg.append("path")
     .datum(me.graticule)
     .attr("class", "graticule")
     .attr("d", me.path);


  me.g.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", me.path);

  var country = me.g.selectAll(".country").data(topo);

  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", me.path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", function(d, i) { return '#FFCC33';  }); // //return d.properties.color;

  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;

  country
    .on("mousemove", function(d,i) {

      var mouse = d3.mouse(me.svg.node()).map( function(d) { return parseInt(d); } );

      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      }); 


  d3.csv("data/country-capitals.csv", function(err, capitals) {

    capitals.forEach(function(i){
      addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName );
    });

  });

}*/


/*me.redraw = function() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  me.draw(topo);
}


me.move = function() {

  var t = d3.event.translate;
  var s = d3.event.scale; 
  zscale = s;
  var h = height/4;


  t[0] = Math.min(
    (width/height)  * (s - 1), 
    Math.max( width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s, 
    Math.max(height  * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  me.g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  d3.selectAll(".country").style("stroke-width", 1.5 / s);

}*/



var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      me.redraw();
    }, 200);
}


/*function click() {
  var latlon = projection.invert(d3.mouse(this));
  console.log(latlon);
}*/


/*function addpoint(lat,lon,text) {

  var gpoint = me.g.append("g").attr("class", "gpoint");
  var x = me.projection([lat,lon])[0];
  var y = me.projection([lat,lon])[1];

  gpoint.append("svg:circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("class","point")
        .attr("r", 1.5);

  if(text.length>0){

    gpoint.append("text")
          .attr("x", x+2)
          .attr("y", y+2)
          .attr("class","text")
          .text(text);
  }

}*/

/* var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset(custom_tip_location.offset)
        .direction(custom_tip_location.direction)
        .html(function(d) {
            if (d.html !== undefined) {
                return d.html;
            }
            else {
                var datum = d.data?
                    d.data:
                    d;
                var retVal = "<b>" + labelFn(d) + "</b>:";
                for (var i = 0; i < metrics.length; i++) {
                    var is_current_metric = metrics[i].metric === current_metric;
                    retVal += is_current_metric?
                        "<br>&nbsp;&nbsp;" + "<span class='current-metric-label'>" + metrics[i].label +"</span>:":
                        "<br>&nbsp;&nbsp;" + "<span>" + metrics[i].label +"</span>:";

                    retVal += is_current_metric?
                        "<span class='tip-data-value current-metric'><emph>&nbsp;&nbsp; " + metrics[i].formatter(datum) + "</emph></span>":
                        "<span class='tip-data-value'><emph>&nbsp;&nbsp; " + metrics[i].formatter(datum) + "</emph></span>";
                }
                


                return retVal;
                //return labelFn(d) + ":" +"<span class='tip-data-value'><emph>" + "&nbsp;&nbsp; " + metricFormatter(valueFn(d)) + "</emph></span><br/>";
            }
        });*/

}