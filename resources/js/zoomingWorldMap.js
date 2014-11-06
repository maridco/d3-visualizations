var zoomingWorldMap = function(targetContainer) {

	var me = this;

	me.active = d3.select(null),
 	me.canvasHeight = Math.floor(document.getElementById(targetContainer).offsetWidth / 2),
	me.canvasWidth = document.getElementById(targetContainer).offsetWidth,
	me.centered,
	me.chartInitialized = false,
	me.defaults = {
		country: {
			fill: '#ECEECE',
			fillActive: '#FF8C00',
			stroke: '#A7A7A7',
			strokeWidth: 1
		}
	},
	me.gGrid = null,
	me.gMap = null,
	me.gTitle = null,
	me.graticule = d3.geo.graticule(),
	me.heightOffset = 1,
	me.path,
	me.projection,
	me.svg,
	me.tooltipFunction = function(d, i) { return 'tooltip'; },
	me.topoFeature,
	me.topoMesh,
	me.topoUrl,
	me.widthOffset = 1;
		
	/**
 	 * @function
 	 * @description Initialize chart components and draw
 	 * base map / paths
 	 */
	me.initChart = function() {
		me.projection = d3.geo.mercator()
			.translate([me.canvasWidth/2, me.canvasHeight/2])
			.scale(Math.max(me.canvasHeight, me.canvasWidth) / 2 / Math.PI);
		
		me.path = d3.geo.path().projection(me.projection);

		me.svg = d3.select('#' + targetContainer)
			.append('svg')
			.attr('width', me.canvasWidth * me.widthOffset)
			.attr('height', me.canvasHeight * me.heightOffset);
			
		me.svg.append('rect')
			.attr('class', 'background')
			.attr('width', me.canvasWidth)
			.attr('height', me.canvasHeight);
			
		me.gGrid = me.svg.append('svg:g');
		
		me.gMap = me.svg.append('svg:g');
		
		me.gTitle = me.svg.append('svg:g')
			.attr('transform', 'translate(20, 20)')
			.append('svg:text')
			.attr('class', 'mapText')
			.text('');
		
		d3.json(me.topoUrl, function(err, dat) {
			if(err) { console.warn(err); return; }
			
      		me.topoFeature = topojson.feature(dat, dat.objects.countries).features;
      		me.topoMesh = topojson.mesh(dat, dat.objects.countries, function(a, b) { return a !== b; });
      		me.chartInitialized = true;
      		me.renderMap();
		}, me);
	}
	
	/**
 	 * @function
 	 * @description Render the basic map paths
 	 */
	me.renderMap = function() {
	
		// graticule (long/lat grid)
		me.gGrid.append('path')
			.datum(me.graticule)
			.attr('class', 'graticule')
			.attr('d', me.path);
			
		// equator
		me.gGrid.append('path')
			.datum({
				type: 'LineString',
				coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]
			})
			.attr('class', 'equator')
			.attr('d', me.path);
			
		// handle countries
		var countrySelection = me.gMap.selectAll('path')
			.data(me.topoFeature);
			
		countrySelection.enter()
			.append('path')
			.attr('d', me.path)
			.attr('id', function(d, i) {
				return d.id;
			})
			.style('fill', me.defaults.country.fill)
			.style('stroke', me.defaults.country.stroke)
			.style('stroke-width', me.defaults.country.strokeWidth)
			.attr('class', 'country')
			.on('click', me.countryClickHandler);
			
		countrySelection.call(d3.helper.tooltip().text(me.tooltipFunction));
			
		// mesh
		me.gMap.append('path')
			.datum(me.topoMesh)
			.attr('class', 'mesh')
			.attr('d', me.path);
	}
	
	/**
 	 * @function
 	 * @description Handle country click
 	 */
	me.countryClickHandler = function(d, i) {
		
		// clicking on element w/ opacity = 0, then pass
		if(d3.select(this).style('opacity') == 0) {
			return;
		}
		
		// zoom out on clicking active node
		if(me.active.node() === this) {
			return me.resetMap();
		}
		
		// active is now "this"
		me.active = d3.select(this);
		me.active.style('fill', me.defaults.country.fillActive)
			.style('opacity', 1);
			
		me.handleTitle(d.properties.name);
		
		var bounds = me.path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = .9 / Math.max(dx/me.canvasWidth, dy/me.canvasHeight),
			translate = [me.canvasWidth / 2 - scale * x, me.canvasHeight / 2 - scale * y];
			
			
		// change stroke width for all paths
		me.gMap.selectAll('path')
			.transition()
			.duration(500)
			.style('stroke-width', me.defaults.country.strokeWidth / scale);
			
		// zoom in, isolate to bounding box and fade others
		me.gMap.transition()
			.duration(500)
			.attr('transform', 'translate(' + translate + ')scale(' + scale + ')')
			.each('end', function() {
				d3.selectAll('path.country')
					.transition()
					.duration(500)
					.filter(function(e, j) {
						return d !== e;
					})
					.style('fill', me.defaults.country.fill)
					.style('opacity', .3);
			});
			
		// grid off
		me.setGridDisabled(true);
	}
	
	/**
 	 * @function
 	 * @description Reset map to full state
 	 */
	me.resetMap = function() {
		// reset fill
		me.active.style('fill', me.defaults.country.fill);
		
		// nullify active
		me.active = d3.select(null);
		
		me.handleTitle('');
		
		// zoom back out
		me.gMap.transition()
			.duration(500)
			.attr('transform', '');
			
		// revert opacity
		d3.selectAll('path.country')
			.transition()
			.duration(500)
			.style('stroke-width', me.defaults.country.strokeWidth)
			.style('opacity', 1);
			
		// grid back on
		me.setGridDisabled(false);
	}
	
	/**
 	 * @function
 	 * @description Enable or disable the grid/equator
 	 */
	me.setGridDisabled = function(bool) {
		if(bool) {
			// off
			me.gGrid.selectAll('path')
				.transition()
				.duration(500)
				.style('opacity', 0);
		} else {
			me.gGrid.selectAll('path')
				.transition()
				.duration(500)
				.style('opacity', 1);
		
		}
	}
	
	me.handleTitle = function(title) {
		me.gTitle.text(title || '');
	}
	
	/******************************
	 * 
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