var bbVis, brush, createVis, handle, height, margin, svg, svg2, width;

var color = d3.scale.category10();
	
    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    width = 1200 - margin.left - margin.right;

    height = 975 - margin.bottom - margin.top;

    bbVis = {
        x: 70,
        y: 0,
        w: width - 100,
        h: height + 0
    };
	
	padding = 1.5, //separation between same color nodes
	clusterPadding = 6; //separation between different color nodes

var dataSetA = [];
var dataSetM = [];

createVis = function(dataSetA, dataSetM) {
	
	console.log(dataSetA);

	
//	var nodes = d3.range(actorSet.length).map(function() {
//		var i = /* actors.length */,
//			r = /*total gross career*/,
//			d = {cluster: i, radius: r};
//			return d;
//		});
/*	
	var pack = d3.layout.pack()
    .sort(null)
    .size([975, 975])
    .value(function(d) { return d.radius * d.radius; })
    .padding(5);	

	var force = d3.layout.force()
    .nodes(nodes)
    .size([975, 975])
    .gravity(.02)
    .charge(0)
    .on("tick", tick)
    .start();
	
		  
	var svg = d3.select("body").append("svg")
    .attr("width", 975)
    .attr("height", 975);
	
	var node = svg.selectAll("circle")
    .data(nodes)
	.enter().append("circle")
    .call(force.drag);

	*/
};

function loadMovieData() {

	d3.json("../finalProject/data/actorDataTest.json", function(error,data){

		var obj = {1:1, 1:2, 1:3}
		
		_.toArray(obj);
		
			dataSetA.push(data);

		
    })

    d3.json("../finalProject/data/movieDataTest.json", function(error,data){
	
			dataSetM.push(data);

		
		createVis(dataSetA, dataSetM);
		
    })

};		

loadMovieData();





    
