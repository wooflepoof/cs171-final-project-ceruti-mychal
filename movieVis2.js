var bbVis, brush, createVis, handle, height, margin, svg, svg2, width;

    margin = {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
    };

    mainVis = {
		width: 800,
		height: 500
	};
	
	detailVis = {
		width:400,
		height:500
	};

    bbVis = {
        x: 70,
        y: 0,
        w: width - 100,
        h: height + 0
    };
	
var dataSetM;
var dataSetA;



createVis = function(actors, movies) {
	
	function getTotalGross(name, date){ 
		var totalGross = 0;
		_.each(actors[name].movies, function(d, i){
			if (_.contains(_.keys(dataSetM), d) == true){
				totalGross += dataSetM[d].total
			};
		});
		return totalGross;
	};
	
	
	//Building the Vis	
	var padding = 1.5, //separation between same color nodes
		clusterPadding = 3, //separation between different color nodes
		maxRadius = 30,
		m = 5; // number of distinct clusters
	
	var color = d3.scale.category10()
    .domain(d3.range(m));

	
	var radScale = d3.scale.pow().exponent(0.5).domain([0,1500000000]).range([1,50]); //Fix max
	
	var clusters = new Array(m);
	
	var nodes = _.map(actors, function(value, key) {
	  var i = Math.floor(1 * m),
		  r = radScale(getTotalGross(key)),
		  d = {
			cluster: i,
			radius: r
		  };
		console.log(r)
	  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
	  return d;
	});
		
	var pack = d3.layout.pack()
		.sort(null)
		.size([mainVis.width, mainVis.height])
		.padding(padding);
		
	var force = d3.layout.force()
		.nodes(nodes)
		.size([mainVis.width - margin.left - margin.right, mainVis.height - margin.bottom - margin.top])
		.gravity(.05)
		.charge(0)
		.on("tick", tick)
		.start();
		
	var svg = d3.select("#mainVis").append("svg")
		.attr("width", mainVis.width)
		.attr("height", mainVis.height)
		.attr("class", "chart");
		
	var node = svg.selectAll("circle")
		.data(nodes)
		.attr("r", function(d) { return d.radius; })
		.enter().append("circle")
		.style("fill", "steelblue")
		.call(force.drag);		
		
		
node.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });
	

	function tick(e) {
	  node
		  .each(cluster(10 * e.alpha * e.alpha))
		  .each(collide(.5))
		  .attr("cx", function(d) { return d.x; })
		  .attr("cy", function(d) { return d.y; });
	}
	

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  return function(d) {
    var cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
}
	
// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
        if (l < r) {
          l = (l - r) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}
/*
	
	
	var nodes = d3.range(2).map(function(actors, j){
		var i = _.keys(actors).length,
			r = getTotalGross("Tom Cruise"),
			d = {cluster: i, radius: r};
			return d;
		});
		
		
	var pack = d3.layout.pack()
    .sort(null)
    .size([975, 975])
    .value(function(d) { return d.radius; })
    .padding(5);
	

	var force = d3.layout.force()
    .nodes(nodes)
    .size([975, 975])
    .gravity(.02)
    .charge(0)
//    .on("tick", tick)
    .start();
	
		  
	var svg = d3.select("body").append("svg")
    .attr("width", 975)
    .attr("height", 975);
	
	var node = svg.selectAll("circle")
    .data(nodes)
	.enter().append("circle")
    .call(force.drag);
	
	
	node.transition()
    .duration(750)
    .delay(function(d, i) { return i * 5; })
    .attrTween("r", function(d) {
      var i = d3.interpolate(0, d.radius);
      return function(t) { return d.radius = i(t); };
    });	


	function tick(e) {
	node
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
	}

	
	// Move d to be adjacent to the cluster node.
	function cluster(alpha) {
	  return function(d) {
		var cluster = clusters[d.cluster];
		if (cluster === d) return;
		var x = d.x - cluster.x,
			y = d.y - cluster.y,
			l = Math.sqrt(x * x + y * y),
			r = d.radius + cluster.radius;
		if (l != r) {
		  l = (l - r) / l * alpha;
		  d.x -= x *= l;
		  d.y -= y *= l;
		  cluster.x += x;
		  cluster.y += y;
		}
	  };
	}
		

	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
		var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
			nx1 = d.x - r,
			nx2 = d.x + r,
			ny1 = d.y - r,
			ny2 = d.y + r;
		quadtree.visit(function(quad, x1, y1, x2, y2) {
		  if (quad.point && (quad.point !== d)) {
			var x = d.x - quad.point.x,
				y = d.y - quad.point.y,
				l = Math.sqrt(x * x + y * y),
				r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
			if (l < r) {
			  l = (l - r) / l * alpha;
			  d.x -= x *= l;
			  d.y -= y *= l;
			  quad.point.x += x;
			  quad.point.y += y;
			}
		  }
		  return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
		});
	  };
	}
*/

};

function loadMovieData() {

	d3.json("../finalProject/data/actorDataTest.json", function(error,data){

		
			dataSetA = data

		
    })

    d3.json("../finalProject/data/movieDataTest.json", function(error,data){
	
			dataSetM = data

		
		createVis(dataSetA, dataSetM);
		
    })

};		

loadMovieData();