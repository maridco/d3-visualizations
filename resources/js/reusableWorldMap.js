var reusableWorldMap = function(targetContainer) {

	var me = this;

 	me.canvasHeight = Math.floor(document.getElementById(targetContainer).offsetWidth / 2),
	me.canvasWidth = document.getElementById(targetContainer).offsetWidth,
	me.centered,
	me.chartInitialized = false,
	me.defaults = {
		country: {
			fill: '#BBB',
			fillOver: '#BBB',
			stroke: 'none',
			strokeWidth: 1,
			strokeOver: 'white'
		}
	},
	me.graticule = d3.geo.graticule(),
	me.heightOffset = 1,
	me.path,
	me.projection,
	me.svg,
	me.tooltipFunction = function(d, i) { return 'tooltip'; },
	me.topo,
	me.topoUrl,
	me.widthOffset = 1,
	me.zoom;
		
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
			.attr('width', me.canvasWidth * me.widthOffset)
			.attr('height', me.canvasHeight * me.heightOffset);
		
		me.g = me.svg.append('svg:g');
		
		d3.json(me.topoUrl, function(err, dat) {
			if(err) { console.warn(err); return; }
			
			me.topo = topojson.feature(dat, dat.objects.countries).features;
			me.chartInitialized = true;
			me.renderMap();
		}, me);
		
		me.zoom = d3.behavior.zoom()
			.scaleExtent([1, 9])
			.on('zoom', me.zoomHandler);
			
		me.svg.call(me.zoom);
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
			.style('fill', me.defaults.country.fill)
			.style('stroke', me.defaults.country.stroke)
			.style('stroke-width', me.defaults.country.strokeWidth)
			.on('mouseover', function(d, i) {
				d3.select(this)
					.style('fill', me.defaults.country.fillOver)
					.style('stroke', me.defaults.country.strokeOver);
			})
			.on('mouseout', function(d, i) {
				d3.select(this)
					.style('fill', me.defaults.country.fill)
					.style('stroke', me.defaults.country.stroke);
			});
			//.on('dblclick', me.dblClickHandler);
		
		countrySelection.call(d3.helper.tooltip().text(me.tooltipFunction));
	}
	
	/**
 	 * double clicking a country
 	 */
	me.dblClickHandler = function(d, i) {
		var path = d3.geo.path().projection(me.projection),
			centroid = path.centroid(d),
			x, y, k;
			
		if(d && me.centered === undefined) {
			x = centroid[0],
				y = centroid[1],
				k = 4,
				me.centered = d;
		} else {
			x = me.canvasWidth/2,
				y = me.canvasHeight/2,
				k = 1,
				me.centered = undefined;
		}
		
		me.g.selectAll('path')
			.classed('active', me.centered && function(d) {
				return d === me.centered;
			});
			
		me.g.transition()
			.duration(750)
			.attr('transform', 'translate(' 
				+ me.canvasWidth / 2 
				+ ',' + me.canvasHeight / 2 
				+ ')scale(' 
				+ k 
				+ ')translate(' 
				+ -x 
				+ ',' 
				+ -y 
				+ ')');
	}
	
	me.zoomHandler = function() {
		console.log('zoom/pan...');
		
		var t = d3.event.translate,
			s = d3.event.scale,
			zscale = s,
			h = Math.floor(me.canvasHeight/4),
			width = me.canvasWidth,
			height = me.canvasHeight;
		
		t[0] = Math.min(
			(width/height) * (s - 1), 
			Math.max(width * (1-s), t[0])
		);
		t[1] = Math.min(
			h * (s-1) + h * s,
			Math.max(height  * (1-s) - h * s, t[1])
		);
		
		me.zoom.translate(t);
		
		me.g.attr('transform', 'translate(' + t  + ')scale(' + s + ')');
	}

	/******************************
	 *
	 * SETTERS
	 *
	 *
	 ******************************/
	me.setDefaults = function(obj) {
		me.defaults = obj;
		return me;
	},
	
	me.setHeightOffset = function(offset) {
		me.heightOffset = offset;
		return me;
	}
	
	me.setTooltipFunction = function(fn) {
		me.tooltipFunction = fn;
		return me;
	}
	
	me.setTopoUrl = function(url) {
		me.topoUrl = url;
		return me;
	}
	
	me.setWidthOffset = function(offset) {
		me.widthOffset = offset;
		return me;
	}
}