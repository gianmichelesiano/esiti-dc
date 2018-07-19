console.log('sort');
var map = L.map('map');
var breweryMarkers = new L.FeatureGroup();

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);


d3.json('untappd1.json', function(error, data) {
	var gare = data.response.gare.items;

	var fullDateFormat = d3.time.format('%Y-%m-%d');
	var yearFormat = d3.time.format('%Y');
	var monthFormat = d3.time.format('%m');
	var dayOfWeekFormat = d3.time.format('%d');

	//normalize/parse data so dc can coorrectly sort and bin them
	gare.forEach(function(d) {

		d.RIBASSO = parseFloat(+d._source.RIBASSO);
		d.IMPORTO = parseFloat(+d._source.IMPORTO);
		d.IMPORTO_AGG = parseFloat(+d._source.IMPORTO_AGG);
		d.TIPOLOGIA = d._source.TIPOLOGIA;
		d.REGIONE = d._source.REGIONE;
		d.PROVINCIA = d._source.PROVINCIA;
		d.CITTA = d._source.CITTA;
		d.DATA_AGG = fullDateFormat.parse(d._source.DATA_AGG);
		d.ANNO = +yearFormat(d.DATA_AGG);
		d.MESE = +monthFormat(d.DATA_AGG);
		d.GIORNO = +dayOfWeekFormat(d.DATA_AGG);
		//problema
		d.lat = parseFloat(+d._source.lat)/10000000000000;
		d.lng = parseFloat(+d._source.lng)/10000000000000;

	});

	//set crossfilter
	var ndx = crossfilter(gare);

	//create dimensions (x-axis values)
	var annoDim = ndx.dimension(function(d) {return d.ANNO;}),
		regioneDim = ndx.dimension(function(d) {return d.REGIONE;})
		ribassoDim = ndx.dimension(function(d) {return d.RIBASSO;})
		allDim = ndx.dimension(function(d) {return d;});



	var all = ndx.groupAll();
	var countAnno = annoDim.group().reduceCount(),
	    countRegione = regioneDim.group().reduceCount()

	var mediaRibassoGroup = ndx.groupAll().reduce(
		function (p, v) {
			++p.n;
			p.tot += v.RIBASSO;
			return p;
		},
		function (p, v) {
			--p.n;
			p.tot -= v.RIBASSO;
			return p;
		},
		function () { return {n:0,tot:0}; }
	);

	var average = function(d) {
		return d.n ? d.tot / d.n : 0;
	};
	// //creating groups (y-axis values)
	// var all = ndx.groupAll();
	// var countPerYear = yearDim.group().reduceCount(),
	// 		countPerMonth = monthDim.group().reduceCount(),
	// 		countPerDay = dayOfWeekDim.group().reduceCount(),
	// 		countPerRating = ratingDim.group().reduceCount(),
	// 		countPerCommRating = commRatingDim.group().reduceCount(),
	// 		countPerABV = abvDim.group().reduceCount(),
	// 		countPerIBU = ibuDim.group().reduceCount();

	// //creating charts
	var yearChart = dc.pieChart('#chart-ring-year');
	var regioneChart = dc.pieChart('#chart-ring-regione');
	// 		monthChart = dc.pieChart('#chart-ring-month'),
	// 		dayChart = dc.pieChart('#chart-ring-day'),
	// 		ratingCountChart = dc.barChart('#chart-rating-count'),
	// 		commRatingCountChart = dc.barChart('#chart-community-rating-count'),
	// 		abvCountChart = dc.barChart('#chart-abv-count'),
	// 		ibuCountChart = dc.barChart('#chart-ibu-count'),
	// 		dataCount = dc.dataCount('#data-count'),
	var dataTable = dc.dataTable('#data-table');

	// ////chart configuration

	//circle charts
	yearChart
		.width(150)
		.height(150)
		.dimension(annoDim)
		.group(countAnno)
		.innerRadius(20);

	regioneChart
		.width(150)
		.height(150)
		.dimension(regioneDim)
		.group(countRegione)
		.innerRadius(20);



	//bar charts
	// ratingCountChart
	// 	.width(300)
	// 	.height(180)
	// 	.dimension(ratingDim)
	// 	.group(countPerRating)
	// 	.x(d3.scale.linear().domain([0,5.2]))
	// 	.elasticY(true)
	// 	.centerBar(true)
	// 	.barPadding(5)
	// 	.xAxisLabel('My rating')
	// 	.yAxisLabel('Count')
	// 	.margins({top: 10, right: 20, bottom: 50, left: 50});
	// ratingCountChart.xAxis().tickValues([0,1,2,3,4,5]);

	// commRatingCountChart
	// 	.width(300)
	// 	.height(180)
	// 	.dimension(commRatingDim)
	// 	.group(countPerCommRating)
	// 	.x(d3.scale.linear().domain([0,5.2]))
	// 	.elasticY(true)
	// 	.centerBar(true)
	// 	.barPadding(5)
	// 	.xAxisLabel('Community rating')
	// 	.yAxisLabel('Count')
	// 	.margins({top:10, right: 20, bottom: 50, left: 50});
	// 	commRatingCountChart.xAxis().tickValues([0,1,2,3,4,5]);

	// abvCountChart
	// 	.width(300)
	// 	.height(180)
	// 	.dimension(abvDim)
	// 	.group(countPerABV)
	// 	.x(d3.scale.linear().domain([-9.2, d3.max(beerData, function(d) {return d.beer.beer_abv; }) + 0.2]))
	// 	.elasticY(true)
	// 	.centerBar(true)
	// 	.barPadding(2)
	// 	.xAxisLabel('Alcohol By Volume (%)')
	// 	.yAxisLabel('Count')
	// 	.margins({top:10, right:20, bottom:50, left:50});

	// ibuCountChart
	// 	.width(300)
	// 	.height(180)
	// 	.dimension(ibuDim)
	// 	.group(countPerIBU)
	// 	.x(d3.scale.linear().domain([-2, d3.max(beerData, function(d){return d.beer.beer_ibu; }) +2]))
	// 	.elasticY(true)
	// 	.centerBar(true)
	// 	.barPadding(5)
	// 	.xAxisLabel('International Bitterness Units')
	// 	.yAxisLabel('Count')
	// 	.xUnits(function(d){ return 5;})
	// 	.margins({top:10, right:20, bottom:50, left:50});

	// dataCount
	// 	.dimension(ndx)
	// 	.group(all);

	// //data table
	// dataTable
	// 	.dimension(allDim)
	// 	.group(function (d) { return 'dc.js insists on putting a row here so I remove it using js'; })
	// 	.size(100)
	// 	.columns([
	// 		function (d) { return d.brewery.brewery_name; },
	// 		function (d) { return d.beer.beer_name; },
	// 		function (d) { return d.beer.beer_style; },
	// 		function (d) { return d.rating_score; },
	// 		function (d) { return d.beer.rating_score; },
	// 		function (d) { return d.beer.beer_abv; },
	// 		function (d) { return d.beer.beer_ibu; },
	// 	])
	// 	.sortBy(function (d) { return d.rating_score; })
	// 	.order(d3.descending)
	// 	.on('renderlet', function (table) {
	// 		//each time table is rendered remove extra row dc.js insists on adding
	// 		table.select('tr.dc-table-group').remove();

	//   breweryMarkers.clearLayers();
	//   _.each(allDim.top(Infinity), function (d) {
	// 	var loc = d.brewery.location;
	// 	var name = d.brewery.brewery_name;
	// 	var marker = L.marker([loc.lat, loc.lng]);
	// 	marker.bindPopup("<p>" + name + " " + loc.brewery_city + " " + loc.brewery_state + "</p>");
	// 	breweryMarkers.addLayer(marker);
	//   });
	//   map.addLayer(breweryMarkers);
	//   map.fitBounds(breweryMarkers.getBounds());
	// });


	dataTable
		.dimension(allDim)
		.group(function (d) { return 'dc.js insists on putting a row here so I remove it using js'; })
		.size(100)
		.columns([
			function (d) { return d.DATA_AGG },
			function (d) { return d.TIPOLOGIA },
			function (d) { return d.PROVINCIA },
			function (d) { return d.CITTA },
			function (d) { return d.REGIONE },
			function (d) { return d.RIBASSO },
			function (d) { return d.lat },
			function (d) { return d.lng },
			
		])
		.sortBy(function (d) { return d.DATA_AGG; })
		.order(d3.descending)
		.on('renderlet', function (table) {
			table.select('tr.dc-table-group').remove();
			breweryMarkers.clearLayers();
			_.each(allDim.top(Infinity), function (d) {

			  //var loc = d.brewery.location;
			  //var name = d.brewery.brewery_name;
			  var marker = L.marker([d.lat, d.lng]);
			  marker.bindPopup("<p>Ribasso" + d.RIBASSO + ", Citta:" + d.CITTA + " </p>");
			  breweryMarkers.addLayer(marker);
			});
			map.addLayer(breweryMarkers);
			map.fitBounds(breweryMarkers.getBounds());
		});

	d3.selectAll('a#all').on('click', function() {
		dc.filterAll();
		dc.renderAll();
	});

	d3.selectAll('a#year').on('click', function() {
		yearChart.filterAll();
		dc.redrawAll();
	});

	d3.selectAll('a#regione').on('click', function() {
		regioneChart.filterAll();
		dc.redrawAll();
	});

	// d3.selectAll('a#day').on('click', function() {
	// 	dayChart.filterAll();
	// 	dc.redrawAll();
	// });

	var numberRecordsND = dc.numberDisplay("#number-records-nd");
	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	var sommaRibassoND = dc.numberDisplay("#somma-ribasso-nd");

	sommaRibassoND.group(mediaRibassoGroup).valueAccessor(average).formatNumber(d3.format(".2f"));

	dc.renderAll();


	
	
});


