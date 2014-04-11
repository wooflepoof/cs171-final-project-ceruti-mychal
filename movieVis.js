var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

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


dataSet = [];
dataSet2 = [];


createVis = function(data) {
	
	var pack = d3.layout.pack()
    .sort(null)
    .size([975, 975])
    .value(function(d) { return d.radius * d.radius; })
    .padding(5);			
		  
	var svg = d3.select("body").append("svg")
    .attr("width", 975)
    .attr("height", 975);

	
};

function loadMovieData() {

	d3.json("../finalProject/data/actorDataTest.json", function(error,data){
	
		console.log(data);
		completeDataSet= data;
		
    })

    d3.json("../finalProject/data/movieDataTest.json", function(error,data){
	
		console.log(data);
		completeDataSet2= data;
		
		createVis();
		
    })

};		

loadMovieData();





    
