var bbVis, brush, createVis, handle, height, margin, svg, svg2, width;

    margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
    };
	
	var width = 1200 - margin.left - margin.right;

	var height = 500 - margin.bottom - margin.top;

    mainVis = {
		width: width,
		height: 500
	};
	
	timeVis = d3.select("#timeVis").append("svg").attr({
		width: width + 20,
		height: 150	
	})

    bbOverview = {
        x: 20,
        y: 0,
        w: width,
        h: 100
    };
	
var dataSetM;
var dataSetA;
var dataset = []


var format = d3.time.format("%Y-%m-%d").parse;

createVis = function(movies) {
	
	var movArray = (_.toArray(movies))
	
	var colorScale = d3.scale.linear()
	.domain([10, 90])
	.interpolate(d3.interpolateRgb)
	.range(["#CB6D51", "#C0C0C0", "#FFDF00"])
	
	var movieColorScale = d3.scale.linear()
	.domain([10, 90])
	.interpolate(d3.interpolateRgb)
	.range(["#339933", "#FF0000"])
	
	//create nodes
	getNodes = function(){
		var actorlist = [];
		var limitGross = 3000000000; //limit the number of actors on the screen by filtering by the total gross
		
		_.each(movies, function(d){
			_.each(d.cast, function(e){
				actorlist.push(e);	
			});
		});
		
		actorList = _.uniq(actorlist);
		
		// start building the actor dataset
		_.each(actorList, function(d){
			var gross = 0,
				scores = 0,
				counter = 0;
				movIDArr = [];
			
			_.each(movies, function(e){ //adds the revenue up for each movie the actor is in
				if(_.contains(e.cast, d)){
					movIDArr.push(e.id)
					gross += e.revenue
					scores+= e.metascore
					counter ++
				};
			});
			
			if( gross >= limitGross){ 
				avgScores = scores/counter;
				dataset.push({"actor": d, "sum": gross, "score": avgScores, "movies": movIDArr});
			};
		});
		

	};
	
	getNodes();
	
	//Color and size scales
	
	var grossMinMax =  d3.extent(dataset, function(d){
					sum = 0
					_.each(movArray, function(e){
						if(_.contains(d.movies, e.id)){
							sum += (e.revenue)
						};
					});
					return sum
				});	

	var radiusScale = d3.scale.linear().domain(grossMinMax).range([10,50]); 
		
	_.each(dataset, function(d){ //add the radius to the dataset
		radius = radiusScale(d.sum);
		_.extend(d, {"radius": radius});
	});
	
	//Build the force Layout inspired by http://bl.ocks.org/mbostock/7882658 
	var padding = 1.5,
		clusterPadding = 6
	
	var pack = d3.layout.pack()
		.sort(null)
		.size([mainVis.width, mainVis.height])
		.padding(padding);
		
	var force = d3.layout.force()
		.nodes(dataset)
		.size([mainVis.width - margin.left - margin.right, mainVis.height - margin.bottom - margin.top])
		.gravity(0.05)
		.charge(function(d, i) { return i ? 0 : -500; })
		.start();
		
	force.on("tick", function(e) {
	  var q = d3.geom.quadtree(dataset),
		  i = 0,
		  n = dataset.length;

	  while (++i < n) q.visit(collide(dataset[i]));
	  
	  svg.selectAll("circle")
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; });
		  
	  svg.selectAll("text")
		.attr("transform", function(d) { 
			return "translate(" + d.x + "," + d.y + ")"; 
		});
	})
		
	var svg = d3.select("#mainVis").append("svg")
		.attr("width", mainVis.width)
		.attr("height", mainVis.height)
		.attr("class", "chart");
		
	var node = svg.selectAll("circle")
			.data(dataset)
		.enter().append("circle")
			.attr("class", "actors")
			.attr("id", function(d) {return d.actor})
			.attr("r", function(d) { return d.radius})
			.style("fill", function(d){return colorScale(d.score)})
			.call(force.drag)
			/*.on("mouseover", function(d){
					_.each(d.movies, function(e){
						d3.select("#id"+e).attr("r",6).classed("highlighted", true);
					})
			})
			.on("mouseout", function(d){
				if((this).classed("highlighted") === false){
					_.each(d.movies, function(e){
						d3.select("#id"+e).attr("r",2).classed("highlighted", false)
					})
				}
			})*/
			.on("click", function(d){
				if (d3.select(this).classed("highlighted") === false){
					d3.select(this).classed("highlighted", true)
					_.each(d.movies, function(e){
						d3.select("#id"+e).attr("r",6).classed("highlighted", true);
					})
				}
				else{
					d3.select(this).classed("highlighted", false)
					_.each(d.movies, function(e){
						d3.select("#id"+e).attr("r",2).classed("highlighted", false)
						})
					}
				});
			
		
	var text = svg.append("g")
			.selectAll("text")
			.data(dataset)
		.enter().append("text")
			.attr("class", "name")
			.attr("text-anchor", "middle")
			.text(function(d) {
				   return d.actor;
				})
			.on("click", function(d){
				d3.select(this).classed("select", true)
			})


// Resolves collisions between d and all other circles. https://gist.github.com/GerHobbelt/3116713
	function collide(node) {
	  var r = node.radius + 16,
		  nx1 = node.x - r,
		  nx2 = node.x + r,
		  ny1 = node.y - r,
		  ny2 = node.y + r;
	  return function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== node)) {
		  var x = node.x - quad.point.x,
			  y = node.y - quad.point.y,
			  l = Math.sqrt(x * x + y * y),
			  r = node.radius + quad.point.radius;
		  if (l < r) {
			l = (l - r) / l * .5;
			node.x -= x *= l;
			node.y -= y *= l;
			quad.point.x += x;
			quad.point.y += y;
		  }
		}
		return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	  };
	}

	
	//Detail Vis
	
	var x = d3.time.scale().range([bbOverview.x, bbOverview.w - margin.right])
		.domain(d3.extent(movArray, function(d){return format(d.release_date)})),
		
		y = d3.scale.linear().range([bbOverview.h, bbOverview.y]).domain([0,100]);
		
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom")

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
		
	var xTicks = xAxis.ticks(20),
		yTicks = yAxis.ticks(5);
		
	
	timeVis.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + (bbOverview.x + 5) + ", "  + (bbOverview.y +5) + ")")
	.call(yAxis);
	
	timeVis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" +bbOverview.x + "," + (bbOverview.h + 5) + ")")
      .call(xAxis);
	  
	
	var data = d3.values(movies).map(function(d) { return [x(format(d.release_date)), y(d.metascore), d.id, d.revenue, d.metascore]; })
	
	var quadtree = d3.geom.quadtree()
    .extent([[-1, -1], [width + 1, height + 1]])
    (data);
	
	//[new Date(2011, 1, 1), new Date(2012, 1, 1)]
		
	var brush = d3.svg.brush()
		.x(d3.scale.identity().domain([bbOverview.x, width]))
		.y(d3.scale.identity().domain([0,(bbOverview.h + 15)]))
		.on("brush", brushed)
		.on("brushend", updateVis)

	
	timeVis.selectAll(".node")
		.data(nodes(quadtree))
	.enter().append("rect")
		.attr("class", "node")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; });
	
	var point = timeVis.selectAll(".point")
		.data(data)
	.enter().append("circle")
		//.attr("id", function(d){return "mov" + d.id})
		.attr("class", "point")
		.attr("gross", function(d) { return d[3]})
		.attr("score", function(d) {return d[4]})
		.attr("id", function(d) { return "id" + d[2]})
		.attr("cx", function(d) { return d[0]})
		.attr("cy", function(d) { return d[1]})
		.attr("r", 2)
		.attr("fill", function(d){ return movieColorScale(d[4])})
	

		
		
	timeVis.append("g")
		.attr("class", "brush")
		.call(brush);
	
	function brushed() {
		var extent = brush.extent();
			point.each(function(d) { d.scanned = d.selected = false; });
			search(quadtree, extent[0][0], extent[0][1], extent[1][0], extent[1][1]);
			point.classed("scanned", function(d) { return d.scanned; });
			point.classed("selected", function(d) { return d.selected; });
	}
	
		
	function nodes(quadtree) {
		var nodes = [];
		quadtree.visit(function(node, x1, y1, x2, y2) {
			nodes.push({x: x1, y: y1, width: x2 - x1, height: y2 - y1});
		});
		return nodes;
	}
	
	function search(quadtree, x0, y0, x3, y3) {
		quadtree.visit(function(node, x1, y1, x2, y2) {
			var p = node.point;
			if (p) {
			p.scanned = true;
			p.selected = (p[0] >= x0) && (p[0] < x3) && (p[1] >= y0) && (p[1] < y3);
		}
		return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
	  });
	}		


	
		
	function updateVis(){
	
		var mID = [];
		timeVis.selectAll(".selected").each(function(d){
			a = this.__data__[2]
			b = this.__data__[3]
			c = this.__data__[4]
			mID.push({id :a, value: [b,c]})
		});
		
		var gMinMax = d3.extent(dataset, function(d){
					sum = 0
					_.each(mID, function(e){
						if(_.contains(d.movies, e.id)){
							sum += (e.value[0])
						};
					});
					return sum
				});		
		
		var rS = d3.scale.linear().domain(gMinMax).range([0,50])
		
		svg.selectAll("circle")
		.data(dataset)
		.transition()
		  .duration(700)
		  .attr("r", function(d){
				var sum = 0
				_.each(mID, function(e){
					if(_.contains(d.movies, e.id)){
						sum += (e.value[0])

					};
				});
			if (rS(sum) <= 3){

				return 1
			}
			else{
				return rS(sum)
			}
			})
		  .attr("fill", function(d){
		  	var score = 0
			var counter = 0
			_.each(mID, function(e){
				if(_.contains(d.movies, e.id)){
					if(e.value[1] > 0){
						counter ++
						score += e.value[1]
					};
				};
			});
			if (_.isNaN(score/counter)){
				return "brown"
				}
			else{
				return colorScale((score/counter))
				}
			});

			
			force.start()
	
	};

};
	


function loadMovieData() {

	d3.json("../finalProject/data/movieData_noRevenue.json", function(error,data){
	
		dataSetA = data
		
	
	})

    d3.json("../finalProject/data/movieData.json", function(error,data){
	
			dataSetM = data

		
		createVis(_.extend(dataSetA, dataSetM));
		
    })

};		

loadMovieData();