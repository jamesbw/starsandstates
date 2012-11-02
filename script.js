
  var albers_ratio = 960/500
  var svg_width = 1300,
      svg_height = 900


//Map setup
//------------------------------------------------------

  var map_width = svg_width * 2/3
  var map_height = map_width / albers_ratio
  var map_top_right = {x: 500, y: 200}


  var projection = d3.geo.albersUsa()
      .scale(map_width )
      .translate([0, 0]);

  var path = d3.geo.path()
      .projection(projection);

  var svg = d3.select("#svg_container").append("svg")
      .attr("width", svg_width)
      .attr("height", svg_height)


  svg.append("rect")
      .attr("class", "background")
      .attr("width", svg_width)
      .attr("height", svg_height)

  var map_group = svg.append("g")
      .attr("transform", "translate(" + (map_width * 1/ 2 + map_top_right.x)+ "," + (map_height * 1/ 2 + map_top_right.y) + ")")
      .attr("id", "map")
  
  var states_group = map_group.append("g")
      .attr("id", "states");

  var x_map_to_global = d3.scale.linear()
                          .domain([0, map_width])
                          .range([map_top_right.x + map_width * 1/ 2, map_top_right.x + map_width * 1/ 2 + map_width])

  var y_map_to_global = d3.scale.linear()
                          .domain([0, map_height])
                          .range([map_height * 1/ 2 + map_top_right.y, map_height * 1/ 2 + map_top_right.y + map_height])



  //----------------------------------------
  
  function deepCopy(obj) {
      if (Object.prototype.toString.call(obj) === '[object Array]') {
          var out = [], i = 0, len = obj.length;
          for ( ; i < len; i++ ) {
              out[i] = arguments.callee(obj[i]);
          }
          return out;
      }
      if (typeof obj === 'object') {
          var out = {}, i;
          for ( i in obj ) {
              out[i] = arguments.callee(obj[i]);
          }
          return out;
      }
      return obj;
  }


  //flag setup
  //------------------------------------------------------------------------------------------

  var flag_top_right = {x: 0 , y: 0}


  var flag_group = svg.append("g")
      .attr("transform", "translate(" +  flag_top_right.x+ "," + flag_top_right.y + ")")

  // flag_group.parentNode.insertBefore(flag_group, flag_group.parentNode.firstChild)
  map_group.node().parentNode.appendChild(map_group.node())

  // Constant variables
  var flag_width = svg_width ,
  flag_height = flag_width / 1.9,
  stripe_array = Array(13),
  stripe_h = flag_height/stripe_array.length,
  union_flag_h = stripe_h*7.,
  union_flag_w = flag_height*.76,
  star_r = stripe_h*1/125;


  // Flag - Stripes
  var stripes = flag_group.selectAll("rect.stripes")
  .data(stripe_array)
  .enter()
  .append("rect")
  .classed("stripes", true)
  .attr("width", flag_width)
  .attr("height", stripe_h)
  .style("fill", function(d, i) {
      return i % 2 ? "#fff" : "#CC0C2F";
  })
  .attr("y", function(d, i) {
      return i*stripe_h;
  });

  // Flag - Union Flag
  var union_flag = flag_group.append("rect")
  .classed("union_flag", true)
  .attr("width", union_flag_w)
  .attr("height", union_flag_h)
  .style("fill", "#002C77")
  // .on('click', moveStars);

  var x_flag_to_global = d3.scale.linear()
                          .domain([0, flag_width])
                          .range([flag_top_right.x, flag_top_right.x + flag_width])

  var y_flag_to_global = d3.scale.linear()
                          .domain([0, flag_height])
                          .range([flag_top_right.y, flag_top_right.y + flag_height])


  //-----------------------------------------------------------------------------------------


  //slider setup
  //---------------------------------------------------------------------------------------


  var slider_group = svg.append('g')
                        .attr("transform", "translate(50, " + (flag_height + 20) + ")")

  var slider_height = 40

  var x_slider = d3.scale.linear()
                 .range([0, flag_width -100])
                 .domain([1750, 2012])

  var slider_marker = slider_group.append('g')
  var slider_marker_color = '#cc0c2f'

  var slider_periods_group = slider_group.append('g')

  slider_marker.append('line')
    .attr('stroke', slider_marker_color)
    .attr('stroke_width', '3')
    .attr('y1', 0)
    .attr('y2', slider_height)
    .attr('x1', 0)
    .attr('x2', 0)

  var triangle = slider_marker.append('polygon')
    .attr('fill', slider_marker_color)
    .attr('points', '0,0  -7, -10 7, -10')

  var bottom_triangle = d3.select(triangle.node().cloneNode())
                            .attr("transform", "translate(0, " + slider_height +")scale(1, -1)")

  slider_marker.node().appendChild(bottom_triangle.node())

  var slider_text = slider_marker.append('g')
                      .attr('transform', "translate(0, " + (slider_height + 30) +")")

  slider_text.append('rect')
      .attr('stroke', slider_marker_color)
      .attr('stroke-width', 3)
      .attr('fill' , 'white')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', 300)
      .attr('height', 70)






  //---------------------------------------------------------------------------------------




  function color_states(state_names, class_name) {
    states_group.selectAll("path")
      .classed(class_name, function(d) { return state_names.indexOf(d.properties.name) > -1})
  }


  var join_years;
  var centroids;
  d3.json("join_years.json", function(json) { 
    join_years = json

    var slider_data = []
    slider_data.push({start: 1750, end: 1776, text:  ["Period:     - 1776",  "Still waiting for independence!"]})
    var state_counter = 0;
    for (var i = 1; i < join_years.length; i++) {
      var start =  join_years[i-1].year
      var end = join_years[i].year
      var new_states = join_years[i-1].states
      state_counter += new_states.length
      slider_data.push({ start: start,
                         end: end,
                         new_states: new_states,
                         text: ["Period: " + start + " - " + end ,
                               // "States joining the union: " + new_states ,
                               "States in the Union: " + state_counter ]})
    };
    slider_data.push({start: 1960, end: 2012, text: ["Period: 1960 -     ",
                               // "States joining the union: " + new_states ,
                               "States in the Union: " + 50 ]})
    console.log(slider_data)

    slider_periods_group.selectAll("rect")
    .data(slider_data)
    .enter().append("rect")
    .attr('fill', function(d, i){  
      if (i%2===0)  
        return '#76BCB7' 
      else  
        return '#58ADA7'})
    .attr('x', function(d) { return x_slider(d.start)})
    .attr('y', 0)
    .attr('height', slider_height)
    .attr('width', function(d){return x_slider(d.end) - x_slider(d.start)})

    slider_periods_group.selectAll('line')
      .data(d3.range(1760, 2012, 10))
      .enter()
      .append('line')
      .classed('tick', true)
      .attr('x1', x_slider)
      .attr('x2', x_slider)
      .attr('y1', slider_height)
      .attr('y2', slider_height + 10)
      .attr('stroke', 'black')

    slider_periods_group.selectAll('text')
      .data(d3.range(1760, 2012, 10))
      .enter()
      .append('text')
      .classed('tick_text', true)
      .attr('x', x_slider)
      .attr('y', slider_height + 20)
      .attr('stroke', 'black')
      .attr('font-size', 10)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'lighter')
      .text(String)
  })
  
  
  
  var flag_stars;

  
  d3.json("states_geo.json", function(json) {
    states_group.selectAll("path")
        .data(json.features)
      .enter().append("path")
        .attr("d", path)

    features = json.features
    centroids = json.features.map(function(feature){ return { name: feature.properties.name, centroid : path.centroid(feature)} })

    star_data = centroids.map(function(c){
      return {
        name: c.name,
        x: x_flag_to_global.invert( x_map_to_global(c.centroid[0])),
        y: y_flag_to_global.invert( y_map_to_global(c.centroid[1])),
        scale: 1,
        rotation: 0,
        opacity: 0
      }
    })
    
    // Initialize the flags_data array
    flags_data = join_years.map(function(d) {
        var s = new Array();
        s = deepCopy(star_data);
        return {
            year: d.year,
            version: 1,
            star_data: s
        }
    });
	
	function addAlternativeFlags() {
		a = [[1776, 2], [1776, 3], [1837, 2], [1847, 2], [1859, 2], [1859, 3], [1867, 2], [1877, 2], [1877, 3]];
		for (var i = 0; i < a.length ; i += 1) {
			console.log(a[i][0]);
			var s = new Array();
	        s = deepCopy(star_data);
			var n = new Object()
			n["year"] = a[i][0];
			n["version"] = a[i][1];
			n["star_data"] = s;
			flags_data.push(n);
		}
	}
	
	addAlternativeFlags();
    
    // Update the position of the stars in flags_array
    updateStarPosition = function(year, version, state, x, y, s, r, o) {
        flags_data.filter(function(d) {
            return (d.year == year && d.version == version)
        }).map(function(d) {
            d.star_data.filter(function(d){return d.name == state}).map(function(d){
                d.x = x;
                d.y = y;
                d.scale = s;
                d.rotation = r;
                d.opacity = o;
                })
        })
    }
    
    // Flag 1776 - 13 stars
    buildFlag1776_13_1 = function() {
        var h_step = union_flag_w/6;
        var v_step = union_flag_h/6;
        updateStarPosition(1776, 1, "Delaware", 1*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "Pennsylvania", 3*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "New Jersey", 5*h_step, 1*v_step, 1, 0, 1);
        
        updateStarPosition(1776, 1, "Georgia", 2*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "Connecticut", 4*h_step, 2*v_step, 1, 0, 1);
        
        updateStarPosition(1776, 1, "Massachusetts", 1*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "Maryland", 3*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "South Carolina", 5*h_step, 3*v_step, 1, 0, 1);
        
        updateStarPosition(1776, 1, "New Hampshire", 2*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "Virginia", 4*h_step, 4*v_step, 1, 0, 1);
        
        updateStarPosition(1776, 1, "New York", 1*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "North Carolina", 3*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1776, 1, "Rhode Island", 5*h_step, 5*v_step, 1, 0, 1);
    };
    
    buildFlag1776_13_2 = function() {
        var cx = union_flag_w/2;
        var cy = union_flag_h/2;
        var r = union_flag_h*0.4;
        updateStarPosition(1776, 2, "Delaware",       cx + r*Math.cos( 4*Math.PI/6), cy - r*Math.sin( 4*Math.PI/6), 1, -1*180/6, 1); //  2
        updateStarPosition(1776, 2, "Pennsylvania",   cx + r*Math.cos( 3*Math.PI/6), cy - r*Math.sin( 3*Math.PI/6), 1,        0, 1); //  1
        updateStarPosition(1776, 2, "New Jersey",     cx + r*Math.cos( 2*Math.PI/6), cy - r*Math.sin( 2*Math.PI/6), 1,  1*180/6, 1); // 12
        
        updateStarPosition(1776, 2, "Georgia",        cx + r*Math.cos( 5*Math.PI/6), cy - r*Math.sin( 5*Math.PI/6), 1, -2*180/6, 1); //  3
        updateStarPosition(1776, 2, "Connecticut",    cx + r*Math.cos( 1*Math.PI/6), cy - r*Math.sin( 1*Math.PI/6), 1,  2*180/6, 1); // 11
        
        updateStarPosition(1776, 2, "Massachusetts",  cx - r                       , cy                           , 1, -3*180/6, 1); //  4
        updateStarPosition(1776, 2, "Maryland",       cx                           , cy                           , 1,        0, 1);
        updateStarPosition(1776, 2, "South Carolina", cx + r                       , cy                           , 1,  3*180/6, 1); // 10
        
        updateStarPosition(1776, 2, "New Hampshire",  cx + r*Math.cos(-5*Math.PI/6), cy - r*Math.sin(-5*Math.PI/6), 1, -4*180/6, 1); //  5
        updateStarPosition(1776, 2, "Virginia",       cx + r*Math.cos(-1*Math.PI/6), cy - r*Math.sin(-1*Math.PI/6), 1,  4*180/6, 1); //  9
        
        updateStarPosition(1776, 2, "New York",       cx + r*Math.cos(-4*Math.PI/6), cy - r*Math.sin(-4*Math.PI/6), 1, -5*180/6, 1); //  6 
        updateStarPosition(1776, 2, "North Carolina", cx + r*Math.cos(-3*Math.PI/6), cy - r*Math.sin(-3*Math.PI/6), 1, -6*180/6, 1); //  7
        updateStarPosition(1776, 2, "Rhode Island",   cx + r*Math.cos(-2*Math.PI/6), cy - r*Math.sin(-2*Math.PI/6), 1,  5*180/6, 1); //  8
    };
    
    buildFlag1776_13_3 = function() {
        var cx = union_flag_w/2;
        var cy = union_flag_h/2;
        var r = union_flag_h*0.4;
        var deg = Math.PI/180
        updateStarPosition(1776, 3, "Delaware",       cx + r*Math.cos(21*Math.PI/26), cy - r*Math.sin(21*Math.PI/26), 1,  -4*180/13, 1); //  3
        updateStarPosition(1776, 3, "Pennsylvania",   cx + r*Math.cos(17*Math.PI/26), cy - r*Math.sin(17*Math.PI/26), 1,  -2*180/13, 1); //  2
        updateStarPosition(1776, 3, "New Jersey",     cx + r*Math.cos(61*Math.PI/26), cy - r*Math.sin(61*Math.PI/26), 1,   2*180/13, 1); // 13
        
        updateStarPosition(1776, 3, "Georgia",        cx + r*Math.cos(25*Math.PI/26), cy - r*Math.sin(25*Math.PI/26), 1,  -6*180/13, 1); //  4
        updateStarPosition(1776, 3, "Connecticut",    cx + r*Math.cos(57*Math.PI/26), cy - r*Math.sin(57*Math.PI/26), 1,   4*180/13, 1); // 12
        
        updateStarPosition(1776, 3, "Massachusetts",  cx + r*Math.cos(29*Math.PI/26), cy - r*Math.sin(29*Math.PI/26), 1,  -8*180/13, 1); //  5
        updateStarPosition(1776, 3, "Maryland",       cx + r*Math.cos(13*Math.PI/26), cy - r*Math.sin(13*Math.PI/26), 1,   0       , 1); //  1
        updateStarPosition(1776, 3, "South Carolina", cx + r*Math.cos(53*Math.PI/26), cy - r*Math.sin(53*Math.PI/26), 1,   6*180/13, 1); // 11
        
        updateStarPosition(1776, 3, "New Hampshire",  cx + r*Math.cos(33*Math.PI/26), cy - r*Math.sin(33*Math.PI/26), 1, -10*180/13, 1); //  6
        updateStarPosition(1776, 3, "Virginia",       cx + r*Math.cos(49*Math.PI/26), cy - r*Math.sin(49*Math.PI/26), 1,   8*180/13, 1); // 10
        
        updateStarPosition(1776, 3, "New York",       cx + r*Math.cos(37*Math.PI/26), cy - r*Math.sin(37*Math.PI/26), 1, -12*180/13, 1); //  7
        updateStarPosition(1776, 3, "North Carolina", cx + r*Math.cos(41*Math.PI/26), cy - r*Math.sin(41*Math.PI/26), 1,  12*180/13, 1); //  8
        updateStarPosition(1776, 3, "Rhode Island",   cx + r*Math.cos(45*Math.PI/26), cy - r*Math.sin(45*Math.PI/26), 1,  10*180/13, 1); //  9
    };
    
    buildFlag1795_15_1 = function() {
        var h_step = union_flag_w/7;
        var v_step = union_flag_h/6;
        updateStarPosition(1795, 1, "Delaware", 1*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Pennsylvania", 3*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "New Jersey", 5*h_step, 1*v_step, 1, 0, 1);
        
        updateStarPosition(1795, 1, "Georgia", 2*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Connecticut", 4*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Vermont", 6*h_step, 2*v_step, 1, 0, 1);
        
        updateStarPosition(1795, 1, "Massachusetts", 1*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Maryland", 3*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "South Carolina", 5*h_step, 3*v_step, 1, 0, 1);
        
        updateStarPosition(1795, 1, "New Hampshire", 2*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Virginia", 4*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Kentucky", 6*h_step, 4*v_step, 1, 0, 1);
        
        updateStarPosition(1795, 1, "New York", 1*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "North Carolina", 3*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1795, 1, "Rhode Island", 5*h_step, 5*v_step, 1, 0, 1);
    };
    
    buildFlag1818_20_1 = function() {
        var h_step = union_flag_w/5;
        var v_step = union_flag_h/4;
        updateStarPosition(1818, 1, "Delaware", 0.5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Georgia", 1.5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Pennsylvania", 2.5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Connecticut", 3.5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "New Jersey", 4.5*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1818, 1, "Massachusetts", 0.5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Maryland", 1.5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "South Carolina", 2.5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Vermont", 3.5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Kentucky", 4.5*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1818, 1, "New York", 0.5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "New Hampshire", 1.5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "North Carolina", 2.5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Virginia", 3.5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Rhode Island", 4.5*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1818, 1, "Indiana", 0.5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Louisiana", 1.5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Mississippi", 2.5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Ohio", 3.5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1818, 1, "Tennessee", 4.5*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1819_21_1 = function() {
        var h_step = union_flag_w/12;
        var v_step = union_flag_h/4;
        updateStarPosition(1819, 1, "Delaware", 2*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Georgia", 4*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Pennsylvania", 6*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Connecticut", 8*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "New Jersey", 10*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1819, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1819, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1819, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1819, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1820_23_1 = function() {
        var h_step = union_flag_w/12;
        var v_step = union_flag_h/4;
        updateStarPosition(1820, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1820, 1, "Massachusetts", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Maryland", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "South Carolina", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Vermont", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Alabama", 10*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1820, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1820, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1820, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1822_24_1 = function() {
        var h_step = union_flag_w/12;
        var v_step = union_flag_h/4;
        updateStarPosition(1822, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1822, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Alabama", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Missouri", 11*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1822, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1822, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1822, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1836_25_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/4;
        updateStarPosition(1836, 1, "Delaware", 2*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Georgia", 4*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Pennsylvania", 6*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Connecticut", 8*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "New Jersey", 10*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Maine", 12*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1836, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Alabama", 11*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1836, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Missouri", 13*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1836, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1836, 1, "Arkansas", 13*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1837_26_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/4;
        updateStarPosition(1837, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Michigan", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1837, 1, "Massachusetts", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Maryland", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "South Carolina", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Vermont", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Alabama", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Missouri", 12*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1837, 1, "New York", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "New Hampshire", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "North Carolina", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Virginia", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Rhode Island", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Kentucky", 12*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1837, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1837, 1, "Arkansas", 13*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1837_26_2 = function() {
        var cx = union_flag_w/2;
        var cy = 5*union_flag_h/11;
        var r4 = union_flag_h*0.46;
        var r3 = union_flag_h*0.35;
        var r2 = union_flag_h*0.26;
        var r1 = union_flag_h*0.2;
        updateStarPosition(1837, 2, "Delaware",       cx + r4*Math.cos(  7*Math.PI/10), cy - r4*Math.sin(  7*Math.PI/10), 0.8,          0, 1); //                 r4 4
        updateStarPosition(1837, 2, "Georgia",        cx + r3*Math.cos( 19*Math.PI/30), cy - r3*Math.sin( 19*Math.PI/30), 1.0,   5*180/15, 1); //           r3  2
        updateStarPosition(1837, 2, "Pennsylvania",   cx + r1*Math.cos(  7*Math.PI/10), cy - r1*Math.sin(  7*Math.PI/10), 1.3,    2*180/5, 1); // r1 4
        updateStarPosition(1837, 2, "Connecticut",    cx + r2*Math.cos(  5*Math.PI/10), cy - r2*Math.sin(  5*Math.PI/10), 1.1,   -1*180/5, 1); //      r2 1
        updateStarPosition(1837, 2, "New Jersey",     cx + r1*Math.cos(  3*Math.PI/10), cy - r1*Math.sin(  3*Math.PI/10), 1.3,   -2*180/5, 1); // r1 3
        updateStarPosition(1837, 2, "Maine",          cx + r3*Math.cos( 71*Math.PI/30), cy - r3*Math.sin( 71*Math.PI/30), 1.0,  -5*180/15, 1); //           r3 15
        updateStarPosition(1837, 2, "Michigan",       cx + r4*Math.cos(  3*Math.PI/10), cy - r4*Math.sin(  3*Math.PI/10), 0.8,          0, 1); //                 r4 2
        
        updateStarPosition(1837, 2, "Massachusetts",  cx + r3*Math.cos( 23*Math.PI/30), cy - r3*Math.sin( 23*Math.PI/30), 1.0,   1*180/15, 1); //           r3  3
        updateStarPosition(1837, 2, "Maryland",       cx + r2*Math.cos(  9*Math.PI/10), cy - r2*Math.sin(  9*Math.PI/10), 1.1,    1*180/5, 1); //       r2 2
        updateStarPosition(1837, 2, "South Carolina", cx                              ,                               cy, 2.0,          0, 1); // center
        updateStarPosition(1837, 2, "Vermont",        cx + r1*Math.cos( -5*Math.PI/10), cy - r1*Math.sin( -5*Math.PI/10), 1.3,          0, 1); // r1 1
        updateStarPosition(1837, 2, "Alabama",        cx + r2*Math.cos( 21*Math.PI/10), cy - r2*Math.sin( 21*Math.PI/10), 1.1,   -1*180/5, 1); //      r2 5
        updateStarPosition(1837, 2, "Missouri",       cx + r3*Math.cos( 67*Math.PI/30), cy - r3*Math.sin( 67*Math.PI/30), 1.0,  -1*180/15, 1); //           r3 14
        
        updateStarPosition(1837, 2, "New York",       cx + r3*Math.cos( 31*Math.PI/30), cy - r3*Math.sin( 31*Math.PI/30), 1.0,   5*180/15, 1); //           r3  5
        updateStarPosition(1837, 2, "New Hampshire",  cx + r1*Math.cos( 11*Math.PI/10), cy - r1*Math.sin( 11*Math.PI/10), 1.3,    2*180/5, 1); // r1 5
        updateStarPosition(1837, 2, "North Carolina", cx + r3*Math.cos( 43*Math.PI/30), cy - r3*Math.sin( 43*Math.PI/30), 1.0,   1*180/15, 1); //           r3  8
        updateStarPosition(1837, 2, "Virginia",       cx + r3*Math.cos( 47*Math.PI/30), cy - r3*Math.sin( 47*Math.PI/30), 1.0,  -1*180/15, 1); //           r3  9
        updateStarPosition(1837, 2, "Rhode Island",   cx + r1*Math.cos( -1*Math.PI/10), cy - r1*Math.sin( -1*Math.PI/10), 1.3,   -2*180/5, 1); // r1 2
        updateStarPosition(1837, 2, "Kentucky",       cx + r3*Math.cos( 59*Math.PI/30), cy - r3*Math.sin( 59*Math.PI/30), 1.0,  -5*180/15, 1); //           r3 12
        
        updateStarPosition(1837, 2, "Indiana",        cx + r4*Math.cos( 11*Math.PI/10), cy - r4*Math.sin( 11*Math.PI/10), 0.8,          0, 1); //                 r4 5
        updateStarPosition(1837, 2, "Louisiana",      cx + r3*Math.cos( 35*Math.PI/30), cy - r3*Math.sin( 35*Math.PI/30), 1.0,   1*180/15, 1); //           r3  6
        updateStarPosition(1837, 2, "Mississippi",    cx + r2*Math.cos( 13*Math.PI/10), cy - r2*Math.sin( 13*Math.PI/10), 1.1,      180/5, 1); //      r2 3
        updateStarPosition(1837, 2, "Ohio",           cx + r4*Math.cos( -5*Math.PI/10), cy - r4*Math.sin( -5*Math.PI/10), 0.8,          0, 1); //                 r4 1
        updateStarPosition(1837, 2, "Tennessee",      cx + r2*Math.cos( 17*Math.PI/10), cy - r2*Math.sin( 17*Math.PI/10), 1.1,   -1*180/5, 1); //      r2 4
        updateStarPosition(1837, 2, "Illinois",       cx + r3*Math.cos( 55*Math.PI/30), cy - r3*Math.sin( 55*Math.PI/30), 1.0,  -1*180/15, 1); //           r3 11
        updateStarPosition(1837, 2, "Arkansas",       cx + r4*Math.cos( -1*Math.PI/10), cy - r4*Math.sin( -1*Math.PI/10), 0.8,          0, 1); //                 r4 2
    };
    
    buildFlag1845_27_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/4;
        updateStarPosition(1845, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Michigan", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1845, 1, "Massachusetts", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Maryland", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "South Carolina", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Vermont", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Alabama", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Missouri", 12*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1845, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Florida", 13*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1845, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1845, 1, "Arkansas", 13*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1846_28_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/4;
        updateStarPosition(1846, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Michigan", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1846, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Alabama", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Missouri", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Texas", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1846, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Virginia", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Rhode Island", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Kentucky", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Florida", 13*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1846, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1846, 1, "Arkansas", 13*h_step, 3.5*v_step, 1, 0, 1);
    };
    
    buildFlag1847_29_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/4;
        updateStarPosition(1847, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Michigan", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Iowa", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1847, 1, "Massachusetts", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Maryland", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "South Carolina", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Vermont", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Alabama", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Missouri", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Texas", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1847, 1, "New York", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "New Hampshire", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "North Carolina", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Virginia", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Rhode Island", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Kentucky", 13*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1847, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Ohio", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Tennessee", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Illinois", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Arkansas", 13*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1847, 1, "Florida", 15*h_step, 3.5*v_step, 1, 0, 1);
    }

	buildFlag1847_29_2 = function() {
        var h_step = union_flag_w/8;
        var v_step = union_flag_h/8;
        updateStarPosition(1847, 2, "Delaware", 1*h_step, 1.5*v_step, 1, 0, 1);			// OK
        updateStarPosition(1847, 2, "Georgia", 2*h_step, 3*v_step, 1, 0, 1);			// 			3.1
        updateStarPosition(1847, 2, "Pennsylvania", 3*h_step, 2*v_step, 1, 0, 1);		// 		2.1
        updateStarPosition(1847, 2, "Connecticut", 4*h_step, 2*v_step, 1, 0, 1);		// 		2.2
        updateStarPosition(1847, 2, "New Jersey", 4*h_step, 1*v_step, 1, 0, 1);			// 	1.1
        updateStarPosition(1847, 2, "Maine", 5*h_step, 2*v_step, 1, 0, 1);				// 		2.3
        updateStarPosition(1847, 2, "Michigan", 6*h_step, 3*v_step, 1, 0, 1);			// 			3.5
        updateStarPosition(1847, 2, "Iowa", 7*h_step, 1.5*v_step, 1, 0, 1);				// 	OK
        
        updateStarPosition(1847, 2, "Massachusetts", 1*h_step, 4*v_step, 1, 0, 1);		// 				4.1
        updateStarPosition(1847, 2, "Maryland", 2*h_step, 4*v_step, 1, 0, 1);			// 				4.2
        updateStarPosition(1847, 2, "South Carolina", 3*h_step, 3*v_step, 1, 0, 1);		// 			3.2
        updateStarPosition(1847, 2, "Vermont", 4*h_step, 3*v_step, 1, 0, 1);			// 			3.3
        updateStarPosition(1847, 2, "Alabama", 5*h_step, 3*v_step, 1, 0, 1);			// 			3.4
        updateStarPosition(1847, 2, "Missouri", 6*h_step, 4*v_step, 1, 0, 1);			//				4.6
        updateStarPosition(1847, 2, "Texas", 7*h_step, 4*v_step, 1, 0, 1);				//				4.7
        
        updateStarPosition(1847, 2, "New York", 2*h_step, 5*v_step, 1, 0, 1);			//					5.1
        updateStarPosition(1847, 2, "New Hampshire", 3*h_step, 5*v_step, 1, 0, 1);		//					5.2
        updateStarPosition(1847, 2, "North Carolina", 3*h_step, 4*v_step, 1, 0, 1);		//				4.3
        updateStarPosition(1847, 2, "Virginia", 4*h_step, 4*v_step, 1, 0, 1);			//				4.4
        updateStarPosition(1847, 2, "Rhode Island", 5*h_step, 4*v_step, 1, 0, 1);		//				4.5
        updateStarPosition(1847, 2, "Kentucky", 6*h_step, 5*v_step, 1, 0, 1);			//					5.5
        
        updateStarPosition(1847, 2, "Indiana", 1*h_step, 6.5*v_step, 1, 0, 1);			// OK
        updateStarPosition(1847, 2, "Louisiana", 3*h_step, 6*v_step, 1, 0, 1);			//						6.1
        updateStarPosition(1847, 2, "Mississippi", 4*h_step, 6*v_step, 1, 0, 1);		//						6.2
        updateStarPosition(1847, 2, "Ohio", 4*h_step, 5*v_step, 1, 0, 1);				//					5.3
        updateStarPosition(1847, 2, "Tennessee", 5*h_step, 5*v_step, 1, 0, 1);			//					5.4
        updateStarPosition(1847, 2, "Illinois", 4*h_step, 7*v_step, 1, 0, 1);			//							7.1
        updateStarPosition(1847, 2, "Arkansas", 5*h_step, 6*v_step, 1, 0, 1);			//						6.3
        updateStarPosition(1847, 2, "Florida", 7*h_step, 6.5*v_step, 1, 0, 1);			// OK
    }
    
    buildFlag1848_30_1 = function() {
        var h_step = union_flag_w/12;
        var v_step = union_flag_h/5;
        updateStarPosition(1848, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1848, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Michigan", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Iowa", 11*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1848, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Alabama", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Missouri", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Texas", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1848, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1848, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1848, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1851_31_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/5;
        updateStarPosition(1851, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1851, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Michigan", 11*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1851, 1, "New York", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "New Hampshire", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "North Carolina", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Alabama", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Missouri", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Texas", 12*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1851, 1, "Indiana", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1851, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1851, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1858_32_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/5;
        updateStarPosition(1858, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1858, 1, "Massachusetts", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Maryland", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "South Carolina", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Vermont", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Michigan", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Minnesota", 12*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1858, 1, "New York", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "New Hampshire", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "North Carolina", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Alabama", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Missouri", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Texas", 12*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1858, 1, "Indiana", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1858, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1858, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1859_33_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/5;
        updateStarPosition(1859, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1859, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Michigan", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Minnesota", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Texas", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1859, 1, "New York", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "New Hampshire", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "North Carolina", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Alabama", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Missouri", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1859, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Oregon", 13*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1859, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1859, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
    }

    buildFlag1859_33_2 = function() {
        var h_step = union_flag_w/8;
        var v_step = union_flag_h/8;
        updateStarPosition(1859, 2, "Delaware",       1*h_step, 1*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 2, "Georgia", 	      3*h_step, 2*v_step, 1, 0, 1);		// 2.1
        updateStarPosition(1859, 2, "Pennsylvania",   4*h_step, 2*v_step, 1, 0, 1);		// 2.2
        updateStarPosition(1859, 2, "Connecticut",    4*h_step, 1*v_step, 1, 0, 1);		// 1.1
        updateStarPosition(1859, 2, "New Jersey",     5*h_step, 2*v_step, 1, 0, 1);		// 2.3
        updateStarPosition(1859, 2, "Maine", 		  6*h_step, 3*v_step, 1, 0, 1);		// 3.5
        updateStarPosition(1859, 2, "Iowa", 		  7*h_step, 1*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 2, "Massachusetts",  1*h_step, 2*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 2, "Maryland", 	  2*h_step, 3*v_step, 1, 0, 1);		// 3.1
        updateStarPosition(1859, 2, "South Carolina", 3*h_step, 3*v_step, 1, 0, 1);		// 3.2
        updateStarPosition(1859, 2, "Vermont", 		  4*h_step, 3*v_step, 1, 0, 1);		// 3.3
        updateStarPosition(1859, 2, "Michigan",       5*h_step, 3*v_step, 1, 0, 1);		// 3.4
        updateStarPosition(1859, 2, "Minnesota",      7*h_step, 4*v_step, 1, 0, 1);		// 4.7
        updateStarPosition(1859, 2, "Texas",          7*h_step, 2*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 2, "New York",       2*h_step, 4*v_step, 1, 0, 1);		// 4.2
        updateStarPosition(1859, 2, "New Hampshire",  3*h_step, 4*v_step, 1, 0, 1);		// 4.3
        updateStarPosition(1859, 2, "North Carolina", 4*h_step, 4*v_step, 1, 0, 1);		// 4.4
        updateStarPosition(1859, 2, "Alabama",        5*h_step, 4*v_step, 1, 0, 1);		// 4.5
        updateStarPosition(1859, 2, "Missouri",       6*h_step, 4*v_step, 1, 0, 1);		// 4.6
        
        updateStarPosition(1859, 2, "Indiana",        1*h_step, 6*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 2, "Louisiana",      1*h_step, 4*v_step, 1, 0, 1);		// 4.7
        updateStarPosition(1859, 2, "Mississippi",    3*h_step, 5*v_step, 1, 0, 1);		// 5.2
        updateStarPosition(1859, 2, "Virginia",       4*h_step, 5*v_step, 1, 0, 1);		// 5.3
        updateStarPosition(1859, 2, "Rhode Island",   5*h_step, 5*v_step, 1, 0, 1);		// 5.4
        updateStarPosition(1859, 2, "Kentucky",       6*h_step, 5*v_step, 1, 0, 1);		// 5.5
        updateStarPosition(1859, 2, "Oregon",         7*h_step, 6*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 2, "Ohio",           1*h_step, 7*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 2, "Tennessee",      2*h_step, 5*v_step, 1, 0, 1);		// 5.1
        updateStarPosition(1859, 2, "Illinois",       3*h_step, 6*v_step, 1, 0, 1);		// 6.1
        updateStarPosition(1859, 2, "Arkansas",       4*h_step, 7*v_step, 1, 0, 1);		// 7.1
        updateStarPosition(1859, 2, "Florida",        4*h_step, 6*v_step, 1, 0, 1);		// 6.2
        updateStarPosition(1859, 2, "Wisconsin",      5*h_step, 6*v_step, 1, 0, 1);		// 6.3
        updateStarPosition(1859, 2, "California",     7*h_step, 7*v_step, 1, 0, 1);		// conrer
    }

    buildFlag1859_33_3 = function() {
        var h_step = union_flag_w/8;
        var v_step = union_flag_h/8;
        updateStarPosition(1859, 3, "Delaware",       1*h_step, 2*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 3, "Georgia", 	      3*h_step, 2*v_step, 1, 0, 1);		// 2.1
        updateStarPosition(1859, 3, "Pennsylvania",   4*h_step, 2*v_step, 1, 0, 1);		// 2.2
        updateStarPosition(1859, 3, "Connecticut",    4*h_step, 1*v_step, 1, 0, 1);		// 1.1
        updateStarPosition(1859, 3, "New Jersey",     5*h_step, 2*v_step, 1, 0, 1);		// 2.3
        updateStarPosition(1859, 3, "Maine", 		  6*h_step, 3*v_step, 1, 0, 1);		// 3.5
        updateStarPosition(1859, 3, "Iowa", 		  7*h_step, 2*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 3, "Massachusetts",  1*h_step, 3*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 3, "Maryland", 	  2*h_step, 3*v_step, 1, 0, 1);		// 3.1
        updateStarPosition(1859, 3, "South Carolina", 3*h_step, 3*v_step, 1, 0, 1);		// 3.2
        updateStarPosition(1859, 3, "Vermont", 		  4*h_step, 3*v_step, 1, 0, 1);		// 3.3
        updateStarPosition(1859, 3, "Michigan",       5*h_step, 3*v_step, 1, 0, 1);		// 3.4
        updateStarPosition(1859, 3, "Minnesota",      7*h_step, 4*v_step, 1, 0, 1);		// 4.7
        updateStarPosition(1859, 3, "Texas",          7*h_step, 3*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 3, "New York",       2*h_step, 4*v_step, 1, 0, 1);		// 4.2
        updateStarPosition(1859, 3, "New Hampshire",  3*h_step, 4*v_step, 1, 0, 1);		// 4.3
        updateStarPosition(1859, 3, "North Carolina", 4*h_step, 4*v_step, 1, 0, 1);		// 4.4
        updateStarPosition(1859, 3, "Alabama",        5*h_step, 4*v_step, 1, 0, 1);		// 4.5
        updateStarPosition(1859, 3, "Missouri",       6*h_step, 4*v_step, 1, 0, 1);		// 4.6
        
        updateStarPosition(1859, 3, "Indiana",        1*h_step, 5*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 3, "Louisiana",      1*h_step, 4*v_step, 1, 0, 1);		// 4.7
        updateStarPosition(1859, 3, "Mississippi",    3*h_step, 5*v_step, 1, 0, 1);		// 5.2
        updateStarPosition(1859, 3, "Virginia",       4*h_step, 5*v_step, 1, 0, 1);		// 5.3
        updateStarPosition(1859, 3, "Rhode Island",   5*h_step, 5*v_step, 1, 0, 1);		// 5.4
        updateStarPosition(1859, 3, "Kentucky",       6*h_step, 5*v_step, 1, 0, 1);		// 5.5
        updateStarPosition(1859, 3, "Oregon",         7*h_step, 5*v_step, 1, 0, 1);		// corner
        
        updateStarPosition(1859, 3, "Ohio",           1*h_step, 6*v_step, 1, 0, 1);		// corner
        updateStarPosition(1859, 3, "Tennessee",      2*h_step, 5*v_step, 1, 0, 1);		// 5.1
        updateStarPosition(1859, 3, "Illinois",       3*h_step, 6*v_step, 1, 0, 1);		// 6.1
        updateStarPosition(1859, 3, "Arkansas",       4*h_step, 7*v_step, 1, 0, 1);		// 7.1
        updateStarPosition(1859, 3, "Florida",        4*h_step, 6*v_step, 1, 0, 1);		// 6.2
        updateStarPosition(1859, 3, "Wisconsin",      5*h_step, 6*v_step, 1, 0, 1);		// 6.3
        updateStarPosition(1859, 3, "California",     7*h_step, 6*v_step, 1, 0, 1);		// conrer
    }
    
    buildFlag1861_34_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/5;
        updateStarPosition(1861, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1861, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Michigan", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Minnesota", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Texas", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1861, 1, "New York", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "New Hampshire", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "North Carolina", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Alabama", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Missouri", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Kansas", 12*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1861, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Oregon", 13*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1861, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1861, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1863_35_1 = function() {
        var h_step = union_flag_w/14;
        var v_step = union_flag_h/5;
        updateStarPosition(1863, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1863, 1, "Massachusetts", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Maryland", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "South Carolina", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Vermont", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Michigan", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Minnesota", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Texas", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1863, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Alabama", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Missouri", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Kansas", 11*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1863, 1, "West Virginia", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Oregon", 13*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1863, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1863, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1865_36_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/5;
        updateStarPosition(1865, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1865, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Michigan", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Minnesota", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1865, 1, "New York", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "New Hampshire", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "North Carolina", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Alabama", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Missouri", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Kansas", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "West Virginia", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Nevada", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1865, 1, "Indiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Louisiana", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Mississippi", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Virginia", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Rhode Island", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Kentucky", 13*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1865, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1865, 1, "Oregon", 15*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1867_37_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/5;
        updateStarPosition(1867, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1867, 1, "New York", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Massachusetts", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Maryland", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "South Carolina", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Vermont", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Michigan", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Minnesota", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1867, 1, "New Hampshire", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "North Carolina", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Alabama", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Missouri", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Kansas", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "West Virginia", 12*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Nevada", 14*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1867, 1, "Indiana", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Nebraska", 14*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1867, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1867, 1, "Oregon", 15*h_step, 4.5*v_step, 1, 0, 1);
    }

	buildFlag1867_37_2 = function() {
		var cx = union_flag_w/2;
        var cy = union_flag_h/2;
        var r2 = union_flag_h*0.42;
        var r1 = union_flag_h*0.25;
        updateStarPosition(1867, 2, "Delaware",       cx + r2*Math.cos(19*Math.PI/24), cy - r2*Math.sin(19*Math.PI/24), 0.9, 0, 1); // 		r2  4
        updateStarPosition(1867, 2, "Georgia",        cx + r2*Math.cos(17*Math.PI/24), cy - r2*Math.sin(17*Math.PI/24), 0.9, 0, 1); // 		r2  3
        updateStarPosition(1867, 2, "Pennsylvania",   cx + r2*Math.cos(15*Math.PI/24), cy - r2*Math.sin(15*Math.PI/24), 0.9, 0, 1); // 		r2  2
        updateStarPosition(1867, 2, "Connecticut",    cx + r2*Math.cos(13*Math.PI/24), cy - r2*Math.sin(13*Math.PI/24), 0.9, 0, 1); // 		r2  1
        updateStarPosition(1867, 2, "New Jersey",     cx + r2*Math.cos(11*Math.PI/24), cy - r2*Math.sin(11*Math.PI/24), 0.9, 0, 1); // 		r2 24
        updateStarPosition(1867, 2, "Maine",          cx + r2*Math.cos( 9*Math.PI/24), cy - r2*Math.sin( 9*Math.PI/24), 0.9, 0, 1); // 		r2 23
        updateStarPosition(1867, 2, "Iowa",           cx + r2*Math.cos( 7*Math.PI/24), cy - r2*Math.sin( 7*Math.PI/24), 0.9, 0, 1); // 		r2 22
        updateStarPosition(1867, 2, "Texas",          cx + r2*Math.cos( 5*Math.PI/24), cy - r2*Math.sin( 5*Math.PI/24), 0.9, 0, 1); // 		r2 21
        
        updateStarPosition(1867, 2, "New York",	      cx + r2*Math.cos(21*Math.PI/24), cy - r2*Math.sin(21*Math.PI/24), 0.9, 0, 1); // 		r2  5
        updateStarPosition(1867, 2, "Massachusetts",  cx + r1*Math.cos(21*Math.PI/26), cy - r1*Math.sin(21*Math.PI/26), 0.9, 0, 1); // r1  3
        updateStarPosition(1867, 2, "Maryland",       cx + r1*Math.cos(17*Math.PI/26), cy - r1*Math.sin(17*Math.PI/26), 0.9, 0, 1); // r1  2
        updateStarPosition(1867, 2, "South Carolina", cx + r1*Math.cos(13*Math.PI/26), cy - r1*Math.sin(13*Math.PI/26), 0.9, 0, 1); // r1  1
        updateStarPosition(1867, 2, "Vermont",        cx + r1*Math.cos(61*Math.PI/26), cy - r1*Math.sin(61*Math.PI/26), 0.9, 0, 1); // r1 13
        updateStarPosition(1867, 2, "Michigan",       cx + r1*Math.cos(57*Math.PI/26), cy - r1*Math.sin(57*Math.PI/26), 0.9, 0, 1); // r1 12
        updateStarPosition(1867, 2, "Minnesota",      cx + r2*Math.cos(51*Math.PI/24), cy - r2*Math.sin( 3*Math.PI/24), 0.9, 0, 1); // 		r2 20
        
        updateStarPosition(1867, 2, "New Hampshire",  cx + r2*Math.cos(23*Math.PI/24), cy - r2*Math.sin(23*Math.PI/24), 0.9, 0, 1); // 		r2  6
        updateStarPosition(1867, 2, "North Carolina", cx + r2*Math.cos(25*Math.PI/24), cy - r2*Math.sin(25*Math.PI/24), 0.9, 0, 1); // 		r2  7
        updateStarPosition(1867, 2, "Alabama",        cx + r1*Math.cos(25*Math.PI/26), cy - r1*Math.sin(25*Math.PI/26), 0.9, 0, 1); // r1  4
        updateStarPosition(1867, 2, "Missouri",       cx + r1*Math.cos(53*Math.PI/26), cy - r1*Math.sin(53*Math.PI/26), 0.9, 0, 1); // r1 11
        updateStarPosition(1867, 2, "Kansas",         cx + r1*Math.cos(49*Math.PI/26), cy - r1*Math.sin(49*Math.PI/26), 0.9, 0, 1); // r1 10
        updateStarPosition(1867, 2, "West Virginia",  cx + r2*Math.cos(49*Math.PI/24), cy - r2*Math.sin( 1*Math.PI/24), 0.9, 0, 1); // 		r2 19
        updateStarPosition(1867, 2, "Nevada",         cx + r2*Math.cos(47*Math.PI/24), cy - r2*Math.sin(47*Math.PI/24), 0.9, 0, 1); // 		r2 18
        
        updateStarPosition(1867, 2, "Indiana",        cx + r2*Math.cos(27*Math.PI/24), cy - r2*Math.sin(27*Math.PI/24), 0.9, 0, 1); // 		r2  8
        updateStarPosition(1867, 2, "Louisiana",      cx + r1*Math.cos(29*Math.PI/26), cy - r1*Math.sin(29*Math.PI/26), 0.9, 0, 1); // r1  5
        updateStarPosition(1867, 2, "Mississippi",    cx + r1*Math.cos(33*Math.PI/26), cy - r1*Math.sin(33*Math.PI/26), 0.9, 0, 1); // r1  6
        updateStarPosition(1867, 2, "Virginia",       cx + r1*Math.cos(37*Math.PI/26), cy - r1*Math.sin(37*Math.PI/26), 0.9, 0, 1); // r1  7
        updateStarPosition(1867, 2, "Rhode Island",   cx + r1*Math.cos(41*Math.PI/26), cy - r1*Math.sin(41*Math.PI/26), 0.9, 0, 1); // r1  8
        updateStarPosition(1867, 2, "Kentucky",       cx + r1*Math.cos(45*Math.PI/26), cy - r1*Math.sin(45*Math.PI/26), 0.9, 0, 1); // r1  9
        updateStarPosition(1867, 2, "Nebraska",       cx + r2*Math.cos(45*Math.PI/24), cy - r2*Math.sin(45*Math.PI/24), 0.9, 0, 1); // 		r2  17
        
        updateStarPosition(1867, 2, "Ohio",           cx + r2*Math.cos(29*Math.PI/24), cy - r2*Math.sin(29*Math.PI/24), 0.9, 0, 1); // 		r2  9
        updateStarPosition(1867, 2, "Tennessee",      cx + r2*Math.cos(31*Math.PI/24), cy - r2*Math.sin(31*Math.PI/24), 0.9, 0, 1); // 		r2 10
        updateStarPosition(1867, 2, "Illinois",       cx + r2*Math.cos(33*Math.PI/24), cy - r2*Math.sin(33*Math.PI/24), 0.9, 0, 1); // 		r2 11
        updateStarPosition(1867, 2, "Arkansas",       cx + r2*Math.cos(35*Math.PI/24), cy - r2*Math.sin(35*Math.PI/24), 0.9, 0, 1); // 		r2 12
        updateStarPosition(1867, 2, "Florida",        cx + r2*Math.cos(37*Math.PI/24), cy - r2*Math.sin(37*Math.PI/24), 0.9, 0, 1); // 		r2 13
        updateStarPosition(1867, 2, "Wisconsin",      cx + r2*Math.cos(39*Math.PI/24), cy - r2*Math.sin(39*Math.PI/24), 0.9, 0, 1); // 		r2 14
        updateStarPosition(1867, 2, "California",     cx + r2*Math.cos(41*Math.PI/24), cy - r2*Math.sin(41*Math.PI/24), 0.9, 0, 1); // 		r2 15
        updateStarPosition(1867, 2, "Oregon",         cx + r2*Math.cos(43*Math.PI/24), cy - r2*Math.sin(43*Math.PI/24), 0.9, 0, 1); // 		r2 16
    }
    
    buildFlag1877_38_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/5;
        updateStarPosition(1877, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 1, "New York", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Michigan", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Minnesota", 13*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 1, "New Hampshire", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "North Carolina", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Alabama", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Missouri", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Kansas", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "West Virginia", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Nevada", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Colorado", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 1, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Nebraska", 13*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 1, "Ohio", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Tennessee", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 1, "Oregon", 15*h_step, 4.5*v_step, 1, 0, 1);
    }

    buildFlag1877_38_2 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/5;
        updateStarPosition(1877, 2, "Delaware", 2*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Georgia", 4*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Pennsylvania", 6*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Connecticut", 8*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "New Jersey", 10*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Maine", 12*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Iowa", 14*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 2, "New York", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Michigan", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Minnesota", 13*h_step, 1.5*v_step, 1, 0, 1);
		updateStarPosition(1877, 2, "Texas", 15*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 2, "New Hampshire", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "North Carolina", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Alabama", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Missouri", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Kansas", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "West Virginia", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Nevada", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Colorado", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 2, "Indiana", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Nebraska", 13*h_step, 3.5*v_step, 1, 0, 1);
		updateStarPosition(1877, 2, "Oregon", 15*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 2, "Ohio", 2*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Tennessee", 4*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Illinois", 6*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Arkansas", 8*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Florida", 10*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "Wisconsin", 12*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 2, "California", 14*h_step, 4.5*v_step, 1, 0, 1);
    }

	buildFlag1877_38_3 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/5;
		var cx = union_flag_w/2;
        var cy = union_flag_h/2;
        var r2 = union_flag_h*0.42;
        var r1 = union_flag_h*0.25;
        updateStarPosition(1877, 3, "Delaware",       1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 3, "Georgia",        cx + r2*Math.cos( 13*Math.PI/20), cy - r2*Math.sin( 13*Math.PI/20), 0.9, -3*180/20, 1); // 		r2  2
        updateStarPosition(1877, 3, "Pennsylvania",   cx + r2*Math.cos( 11*Math.PI/20), cy - r2*Math.sin( 11*Math.PI/20), 0.9, -1*180/20, 1); // 		r2  1
        updateStarPosition(1877, 3, "Connecticut",    cx + r2*Math.cos(  9*Math.PI/20), cy - r2*Math.sin(  9*Math.PI/20), 0.9,  1*180/20, 1); // 		r2 20
        updateStarPosition(1877, 3, "New Jersey",     cx + r2*Math.cos(  7*Math.PI/20), cy - r2*Math.sin(  7*Math.PI/20), 0.9,  3*180/20, 1); // 		r2 19
        updateStarPosition(1877, 3, "Maine",          cx + r2*Math.cos(  5*Math.PI/20), cy - r2*Math.sin(  5*Math.PI/20), 0.9,  5*180/20, 1); // 		r2 18
        updateStarPosition(1877, 3, "Iowa",           15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1877, 3, "New York",       cx + r2*Math.cos( 17*Math.PI/20), cy - r2*Math.sin( 17*Math.PI/20), 0.9, -7*180/20, 1); // 		r2  4
        updateStarPosition(1877, 3, "Massachusetts",  cx + r2*Math.cos( 15*Math.PI/20), cy - r2*Math.sin( 15*Math.PI/20), 0.9, -5*180/20, 1); // 		r2  3
        updateStarPosition(1877, 3, "Maryland",       cx + r1*Math.cos( 19*Math.PI/26), cy - r1*Math.sin( 19*Math.PI/26), 0.9,  4*180/26, 1); // r1  8
        updateStarPosition(1877, 3, "South Carolina", cx + r1*Math.cos( 15*Math.PI/26), cy - r1*Math.sin( 15*Math.PI/26), 0.9, -1*180/26, 1); // r1  7
        updateStarPosition(1877, 3, "Vermont",        cx + r1*Math.cos( 11*Math.PI/26), cy - r1*Math.sin( 11*Math.PI/26), 0.9,  1*180/26, 1); // r1  6
        updateStarPosition(1877, 3, "Michigan",       cx + r1*Math.cos(  7*Math.PI/26), cy - r1*Math.sin(  7*Math.PI/26), 0.9, -4*180/26, 1); // r1  5
        updateStarPosition(1877, 3, "Minnesota",      cx + r2*Math.cos(  3*Math.PI/20), cy - r2*Math.sin(  3*Math.PI/20), 0.9,  7*180/20, 1); // 		r2 17
		updateStarPosition(1877, 3, "Texas",          cx + r2*Math.cos(  1*Math.PI/20), cy - r2*Math.sin(  1*Math.PI/20), 0.9,  9*180/20, 1); // 		r2 16
        
        updateStarPosition(1877, 3, "New Hampshire",  cx + r2*Math.cos( 19*Math.PI/20), cy - r2*Math.sin( 19*Math.PI/20), 0.9, -1*180/20, 1); // 		r2  5
        updateStarPosition(1877, 3, "North Carolina", cx + r1*Math.cos( 23*Math.PI/26), cy - r1*Math.sin( 23*Math.PI/26), 0.9,         0, 1); // r1  9
        updateStarPosition(1877, 3, "Alabama",        cx + r1*Math.cos( 27*Math.PI/26), cy - r1*Math.sin( 27*Math.PI/26), 0.9,  7*180/26, 1); // r1 10
        updateStarPosition(1877, 3, "Missouri",       cx + r1*Math.cos( 31*Math.PI/26), cy - r1*Math.sin( 31*Math.PI/26), 0.9,  3*180/26, 1); // r1 11
        updateStarPosition(1877, 3, "Kansas", 		  cx                              , cy                              , 1.5,    180/ 5, 1); // center
        updateStarPosition(1877, 3, "West Virginia",  cx + r1*Math.cos( -1*Math.PI/26), cy - r1*Math.sin( -1*Math.PI/26), 0.9,  4*180/26, 1); // r1  3
        updateStarPosition(1877, 3, "Nevada",         cx + r1*Math.cos(  3*Math.PI/26), cy - r1*Math.sin(  3*Math.PI/26), 0.9,  0*180/26, 1); // r1  4
        updateStarPosition(1877, 3, "Colorado",       cx + r2*Math.cos( 39*Math.PI/20), cy - r2*Math.sin( 39*Math.PI/20), 0.9,  3*180/20, 1); // 			r2 15
        
        updateStarPosition(1877, 3, "Indiana",        cx + r2*Math.cos( 21*Math.PI/20), cy - r2*Math.sin( 21*Math.PI/20), 0.9, -3*180/20, 1); // 		r2  6
        updateStarPosition(1877, 3, "Louisiana",      cx + r2*Math.cos( 23*Math.PI/20), cy - r2*Math.sin( 23*Math.PI/20), 0.9, -5*180/20, 1); // 		r2  7
        updateStarPosition(1877, 3, "Mississippi",    cx + r1*Math.cos( 35*Math.PI/26), cy - r1*Math.sin( 35*Math.PI/26), 0.9, -1*180/26, 1); // r1 12
        updateStarPosition(1877, 3, "Virginia",       cx + r1*Math.cos(-13*Math.PI/26), cy - r1*Math.sin(-13*Math.PI/26), 0.9,  5*180/26, 1); // r1 13
        updateStarPosition(1877, 3, "Rhode Island",   cx + r1*Math.cos( -9*Math.PI/26), cy - r1*Math.sin( -9*Math.PI/26), 0.9,  1*180/26, 1); // r1  1
        updateStarPosition(1877, 3, "Kentucky",       cx + r1*Math.cos( -5*Math.PI/26), cy - r1*Math.sin( -5*Math.PI/26), 0.9, -3*180/26, 1); // r1  2
        updateStarPosition(1877, 3, "Nebraska",       cx + r2*Math.cos( 35*Math.PI/20), cy - r2*Math.sin( 35*Math.PI/20), 0.9,  7*180/20, 1); // 		r2 13
		updateStarPosition(1877, 3, "Oregon",         cx + r2*Math.cos( 37*Math.PI/20), cy - r2*Math.sin( 37*Math.PI/20), 0.9,  5*180/20, 1); // 		r2 14
        
        updateStarPosition(1877, 3, "Ohio",           1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1877, 3, "Tennessee",      cx + r2*Math.cos( 25*Math.PI/20), cy - r2*Math.sin( 25*Math.PI/20), 0.9, -7*180/20, 1); // 			r2  8
        updateStarPosition(1877, 3, "Illinois",       cx + r2*Math.cos( 27*Math.PI/20), cy - r2*Math.sin( 27*Math.PI/20), 0.9, -1*180/20, 1); // 			r2  9
        updateStarPosition(1877, 3, "Arkansas",       cx + r2*Math.cos( 29*Math.PI/20), cy - r2*Math.sin( 29*Math.PI/20), 0.9, -3*180/20, 1); // 			r2 10
        updateStarPosition(1877, 3, "Florida",        cx + r2*Math.cos( 31*Math.PI/20), cy - r2*Math.sin( 31*Math.PI/20), 0.9,  3*180/20, 1); // 			r2 11
        updateStarPosition(1877, 3, "Wisconsin",      cx + r2*Math.cos( 33*Math.PI/20), cy - r2*Math.sin( 33*Math.PI/20), 0.9,  1*180/20, 1); // 			r2 12
        updateStarPosition(1877, 3, "California",     15*h_step, 4.5*v_step, 1, 0, 1);
    }
    
    buildFlag1890_43_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/6;
        updateStarPosition(1890, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1890, 1, "New York", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Massachusetts", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Maryland", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "South Carolina", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Vermont", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Michigan", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Minnesota", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1890, 1, "North Carolina", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Alabama", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Missouri", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Kansas", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "West Virginia", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Nevada", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Colorado", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1890, 1, "New Hampshire", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Nebraska", 14*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1890, 1, "Indiana", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Illinois", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Arkansas", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Florida", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Wisconsin", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "California", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Oregon", 15*h_step, 4.5*v_step, 1, 0, 1);
        
        updateStarPosition(1890, 1, "Ohio", 2*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Tennessee", 4*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Washington", 6*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Idaho", 8*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "Montana", 10*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "North Dakota", 12*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1890, 1, "South Dakota", 14*h_step, 5.5*v_step, 1, 0, 1);
    }
    
    buildFlag1891_44_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/6;
        updateStarPosition(1891, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1891, 1, "New York", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Massachusetts", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Maryland", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "South Carolina", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Vermont", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Michigan", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Minnesota", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1891, 1, "North Carolina", 2*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Alabama", 4*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Missouri", 6*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Kansas", 8*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "West Virginia", 10*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Nevada", 12*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Colorado", 14*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1891, 1, "New Hampshire", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Nebraska", 14*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1891, 1, "Indiana", 2*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Illinois", 4*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Arkansas", 6*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Florida", 8*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Wisconsin", 10*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "California", 12*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Oregon", 14*h_step, 4.5*v_step, 1, 0, 1);
        
        updateStarPosition(1891, 1, "Ohio", 1*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Tennessee", 3*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Washington", 5*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Idaho", 7*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Montana", 9*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "North Dakota", 11*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "South Dakota", 13*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1891, 1, "Wyoming", 15*h_step, 5.5*v_step, 1, 0, 1);
    }
    
    buildFlag1896_45_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/6;
        updateStarPosition(1896, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1896, 1, "New York", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Massachusetts", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Maryland", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "South Carolina", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Vermont", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Michigan", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Minnesota", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1896, 1, "North Carolina", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Alabama", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Missouri", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Kansas", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "West Virginia", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Nevada", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Colorado", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Utah", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1896, 1, "New Hampshire", 2*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Louisiana", 4*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Mississippi", 6*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Virginia", 8*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Rhode Island", 10*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Kentucky", 12*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Nebraska", 14*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1896, 1, "Indiana", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Illinois", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Arkansas", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Florida", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Wisconsin", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "California", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Oregon", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Wyoming", 15*h_step, 4.5*v_step, 1, 0, 1);
        
        updateStarPosition(1896, 1, "Ohio", 2*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Tennessee", 4*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Washington", 6*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Idaho", 8*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "Montana", 10*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "North Dakota", 12*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1896, 1, "South Dakota", 14*h_step, 5.5*v_step, 1, 0, 1);
    }
    
    buildFlag1908_46_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/6;
        updateStarPosition(1908, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1908, 1, "New York", 2*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Massachusetts", 4*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Maryland", 6*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "South Carolina", 8*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Vermont", 10*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Michigan", 12*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Minnesota", 14*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1908, 1, "North Carolina", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Alabama", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Missouri", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Kansas", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "West Virginia", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Nevada", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Colorado", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Utah", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1908, 1, "New Hampshire", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Nebraska", 13*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Wyoming", 15*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1908, 1, "Indiana", 2*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Illinois", 4*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Arkansas", 6*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Florida", 8*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Wisconsin", 10*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "California", 12*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Oregon", 14*h_step, 4.5*v_step, 1, 0, 1);
        
        updateStarPosition(1908, 1, "Ohio", 1*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Tennessee", 3*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Washington", 5*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Idaho", 7*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Montana", 9*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "North Dakota", 11*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "South Dakota", 13*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1908, 1, "Oklahoma", 15*h_step, 5.5*v_step, 1, 0, 1);
    }

    buildFlag1912_48_1 = function() {
        var h_step = union_flag_w/16;
        var v_step = union_flag_h/6;
        updateStarPosition(1912, 1, "Delaware", 1*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Georgia", 3*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Pennsylvania", 5*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Connecticut", 7*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "New Jersey", 9*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Maine", 11*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Iowa", 13*h_step, 0.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Texas", 15*h_step, 0.5*v_step, 1, 0, 1);
        
        updateStarPosition(1912, 1, "New York", 1*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Massachusetts", 3*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Maryland", 5*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "South Carolina", 7*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Vermont", 9*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Michigan", 11*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Minnesota", 13*h_step, 1.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Arizona", 15*h_step, 1.5*v_step, 1, 0, 1);
        
        updateStarPosition(1912, 1, "North Carolina", 1*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Alabama", 3*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Missouri", 5*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Kansas", 7*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "West Virginia", 9*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Nevada", 11*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Colorado", 13*h_step, 2.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Utah", 15*h_step, 2.5*v_step, 1, 0, 1);
        
        updateStarPosition(1912, 1, "New Hampshire", 1*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Louisiana", 3*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Mississippi", 5*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Virginia", 7*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Rhode Island", 9*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Kentucky", 11*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Nebraska", 13*h_step, 3.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Wyoming", 15*h_step, 3.5*v_step, 1, 0, 1);
        
        updateStarPosition(1912, 1, "Indiana", 1*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Illinois", 3*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Arkansas", 5*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Florida", 7*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Wisconsin", 9*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "California", 11*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Oregon", 13*h_step, 4.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "New Mexico", 15*h_step, 4.5*v_step, 1, 0, 1);
        
        updateStarPosition(1912, 1, "Ohio", 1*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Tennessee", 3*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Washington", 5*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Idaho", 7*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Montana", 9*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "North Dakota", 11*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "South Dakota", 13*h_step, 5.5*v_step, 1, 0, 1);
        updateStarPosition(1912, 1, "Oklahoma", 15*h_step, 5.5*v_step, 1, 0, 1);
    }
    
    buildFlag1959_49_1 = function() {
        var h_step = union_flag_w/15;
        var v_step = union_flag_h/8;
        updateStarPosition(1959, 1, "Delaware", 1*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Georgia", 3*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Pennsylvania", 5*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Connecticut", 7*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "New Jersey", 9*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Maine", 11*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Iowa", 13*h_step, 1*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "New York", 2*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Massachusetts", 4*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Maryland", 6*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "South Carolina", 8*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Vermont", 10*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Michigan", 12*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Texas", 14*h_step, 2*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "North Carolina", 1*h_step, 3*v_step, 1, 0, 1);   
        updateStarPosition(1959, 1, "Alabama", 3*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Missouri", 5*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Kansas", 7*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "West Virginia", 9*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Minnesota", 11*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Arizona", 13*h_step, 3*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "New Hampshire", 2*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Louisiana", 4*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Mississippi", 6*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Virginia", 8*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Nevada", 10*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Colorado", 12*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Utah", 14*h_step, 4*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "Indiana", 1*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Illinois", 3*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Arkansas", 5*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Rhode Island", 7*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Kentucky", 9*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Nebraska", 11*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Wyoming", 13*h_step, 5*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "Ohio", 2*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Tennessee", 4*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Florida", 6*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Wisconsin", 8*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "California", 10*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Oregon", 12*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "New Mexico", 14*h_step, 6*v_step, 1, 0, 1);
        
        updateStarPosition(1959, 1, "Washington", 1*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Idaho", 3*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Montana", 5*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "North Dakota", 7*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "South Dakota", 9*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Oklahoma", 11*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1959, 1, "Alaska", 13*h_step, 7*v_step, 1, 0, 1);
    }
    
    buildFlag1960_50_1 = function() {
        var h_step = union_flag_w/12;
        var v_step = union_flag_h/10;
        updateStarPosition(1960, 1, "Delaware", 1*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Georgia", 3*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Pennsylvania", 5*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Connecticut", 7*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "New Jersey", 9*h_step, 1*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Maine", 11*h_step, 1*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "New York", 2*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Massachusetts", 4*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Maryland", 6*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "South Carolina", 8*h_step, 2*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Iowa", 10*h_step, 2*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "North Carolina", 1*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Alabama", 3*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Missouri", 5*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Vermont", 7*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Michigan", 9*h_step, 3*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Texas", 11*h_step, 3*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "New Hampshire", 2*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Kansas", 4*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "West Virginia", 6*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Minnesota", 8*h_step, 4*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Arizona", 10*h_step, 4*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "Louisiana", 1*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Mississippi", 3*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Virginia", 5*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Nevada", 7*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Colorado", 9*h_step, 5*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Utah", 11*h_step, 5*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "Indiana", 2*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Illinois", 4*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Arkansas", 6*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Rhode Island", 8*h_step, 6*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Kentucky", 10*h_step, 6*v_step, 1, 0, 1);

        updateStarPosition(1960, 1, "Ohio", 1*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Tennessee", 3*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Florida", 5*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Wisconsin", 7*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Nebraska", 9*h_step, 7*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Wyoming", 11*h_step, 7*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "Washington", 2*h_step, 8*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Idaho", 4*h_step, 8*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "California", 6*h_step, 8*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Oregon", 8*h_step, 8*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "New Mexico", 10*h_step, 8*v_step, 1, 0, 1);
        
        updateStarPosition(1960, 1, "Montana", 1*h_step, 9*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "North Dakota", 3*h_step, 9*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "South Dakota", 5*h_step, 9*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Oklahoma", 7*h_step, 9*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Alaska", 9*h_step, 9*v_step, 1, 0, 1);
        updateStarPosition(1960, 1, "Hawaii", 11*h_step, 9*v_step, 1, 0, 1);
    }

      
    buildFlag1776_13_1();
    buildFlag1776_13_2();
    buildFlag1776_13_3();
    buildFlag1795_15_1();
    buildFlag1818_20_1();
    buildFlag1819_21_1();
    buildFlag1820_23_1();
    buildFlag1822_24_1();
    buildFlag1836_25_1();
    buildFlag1837_26_1();
    buildFlag1837_26_2();
    buildFlag1845_27_1();
    buildFlag1846_28_1();
    buildFlag1847_29_1();
	buildFlag1847_29_2();
    buildFlag1848_30_1();
    buildFlag1851_31_1();
    buildFlag1858_32_1();
    buildFlag1859_33_1();
    buildFlag1859_33_2();
 	buildFlag1859_33_3();
    buildFlag1861_34_1();
    buildFlag1863_35_1();
    buildFlag1865_36_1();
    buildFlag1867_37_1();
	buildFlag1867_37_2();
    buildFlag1877_38_1();
    buildFlag1877_38_2();
	buildFlag1877_38_3();
    buildFlag1890_43_1();
    buildFlag1891_44_1();
    buildFlag1896_45_1();
    buildFlag1908_46_1();
    buildFlag1912_48_1();
    buildFlag1959_49_1();
    buildFlag1960_50_1();
    
    
    // star_data.filter(function(d){return d.name == "Wisconsin"}).map(function(d){ d.scale = 5; d.x = 2})
      
    run();
  });
  
  

  var current_states = []


  var slider = d3.select("#slider")
  var year_el = d3.select("#year")















function run() {

    year = 1752

    slider_periods_group.selectAll("rect")
      .on('click', function(d){ year = d.start; update()})

    var slider_drag = d3.behavior.drag().on("drag", function(d){
      year = Math.max(1752, Math.min( 2012, Math.round(x_slider.invert(d3.event.x))))
      update()

    });

    slider_marker.call(slider_drag)

    alternate_versions = {1776: 3, 1837: 2, 1847:2 , 1859: 3, 1867: 2, 1877:3}


    function update_slider()
    {
      var rect_width
      slider_periods_group.selectAll("rect")
        .classed('active', function(d){ return  d.start <= year && d.end > year})
        .each(function(d) { 
          if(d.start <= year && d.end > year) 
          {
              var sel = slider_text.selectAll('text')
                .data(d.text)
                
              sel.exit().remove()

              sel.enter()
                .append('text')
                .attr('xml:space', 'preserve')
                .attr('y', function(d,i){return i* 15 + 20})
                .attr('x', 10)

              sel.text(String)

              if (alternate_versions[d.start] > 1) {
                var num_versions = alternate_versions[d.start]
                slider_text.append('text')
                .attr('x',10)
                .attr('y', d.text.length *15 + 20)
                .attr('xml:space', 'preserve')
                .attr('font-weight', 'bold')
                .attr('text-decoration', 'underline')
                .attr('fill', 'blue')
                .text('Show alternate flag (' + (num_versions - 1) + ')')
                .on("click", function(){
                  console.log("Toggle")
                  toggle_flag(d.start)
                })
              };

              rect_width =  d3.max(slider_text.selectAll("text")[0], function(el){return el.textLength.baseVal.value}) + 20

              slider_text.select("rect")
                .attr('height', slider_text.selectAll("text")[0].length * 20)
                .attr('width', rect_width)

              

              slider_marker.attr("transform", "translate(" + x_slider(year) +",0)")
              var correction = Math.max(x_slider(year) -  (x_slider(2012) - rect_width), 0);
              slider_text.select("rect")
                .attr('x', -correction)
              slider_text.selectAll('text')
                .attr('x', 10 - correction)
              slider_marker.node().parentNode.appendChild(slider_marker.node())
          }
        })


    }
    function update() {
      
      update_slider()
      map_callback(year)
      flag_callback(year)
    }

    update_slider()


    // Allow the arrow keys to change the displayed year.
    d3.select(window).on("keydown", function() {
        console.log(d3.event.keyCode)
      switch (d3.event.keyCode) {
        case 37: {
          console.log("left")
          var past_periods = join_years.filter( function(d) { return d.year <= year})
          if (past_periods.length > 1) {
            year = past_periods[past_periods.length - 2].year
          }
          if (past_periods.length === 1) {
            year = 1752
          }
          update();
          break;
        }
        case 39: {
          var future_periods = join_years.filter( function(d) { return d.year > year})
          if (future_periods.length > 0) {
            year = future_periods[0].year
          }
          update();
          break;
        }
      }
      
    });



    function map_callback(year) {

      var states = join_years.filter( function(d) { return d.year <= year})
                                  .map( function(d) {return d.states})
                                  .reduce( function(s1, s2){ return s1.concat(s2)}, [])

      var new_states = states.filter( function(state) { return current_states.indexOf(state) < 0})

      var past_states = states.filter( function(state) { return current_states.indexOf(state) > -1})

      var states_for_this_year = join_years.filter( function(d) { return d.year === year})
                                  .map( function(d) {return d.states})
                                  .reduce( function(s1, s2){ return s1.concat(s2)}, [])

      current_states = states


      color_states(past_states, "past")
      color_states(new_states, "new")

      states_group.selectAll(".new")
       .classed("motion", true)
       .transition()
       .duration(300)
       .attr("transform", function(d) {
         var centroid = path.centroid(d),
         x = centroid[0],
         y = centroid[1];
          return "translate(" + x + "," + y + ")"
         + "scale(" + 1.1 + ")"
         + "translate(" + -x + "," + -y + ")";
       })
       .each(function(){this.parentNode.appendChild(this)})
         .transition()
         .delay(300)
         .duration(300)
         .attr("transform", "")
         .each("end", function(){ 
          d3.select(this).classed("motion", false)
                         .classed("new", function(d){ return states_for_this_year.indexOf(d.properties.name) > -1})
                         .classed("past", function(d){ return states_for_this_year.indexOf(d.properties.name) < 0})
          })

      console.log(states_for_this_year) 
      color_states(states_for_this_year, "new")
    }

  /*
  /* Including the stars
  /* * * * * * * * * * * */

  // Star shape in SVG
  var star_shape = [[0, -52.5746], [11.8020, -16.2478], [50, -16.2478], [19.1, 6.2043], [30.9, 42.5375], [0, 20.0811], [-30.8978, 42.5375], [-19.0979, 6.2043], [-50, -16.2478], [-11.8054, -16.2478]];

  // At scale given the size of the flag (determined by h)
  for (var i = 0; i < star_shape.length; i += 1) {
      star_shape[i][0] *= star_r;
      star_shape[i][1] *= star_r;
  }

  // Function to draw the SVG shape from the star_shape array
  var lineFn = d3.svg.line()
  .x(function(d) { return d[0] })
  .y(function(d) { return d[1] });
  


  // Drawing the stars
  var stars = svg.selectAll(".star")
  .data(star_data)
  .enter()
  .append("path")
  .attr("d", lineFn(star_shape))
  .attr("class", "star")
  .style("fill", "#fff")
  .style("opacity", function(d) {
      return d.opacity;
  })
  .attr("transform", function(d, i) {
      return "translate("+ d.x +", "+ d.y +")" + "scale("+ d.scale +")" + "rotate("+ d.rotation +")";
  });




  years = join_years.map(function(d) {return d.year});

  function findPrecedingYear(year) {
      for (var i = 0; i < years.length-1; i += 1) {
          if (year < years[i+1]) return years[i]
      }
      return years[years.length-1];
  }

  var current_version = 1;
  function toggle_flag(year)
  {
    var precedingYear = findPrecedingYear(year);
    var num_versions = alternate_versions[precedingYear]
    flag_callback(year, current_version % num_versions + 1)
  }



  function flag_callback(year, version) {
      if (version === undefined) version = 1
      if (year < years[0]) {flag_stars = star_data; current_version = 1}
      else {
      var precedingYear = findPrecedingYear(year);
      flag_data = flags_data.filter(function(d) {
                return d.year === precedingYear && d.version === version;
            })[0];
      flag_stars = flag_data.star_data  
      }

        current_version = flag_data.version
          // Transitions
          stars.data(flag_stars)
          .transition()
          .duration(1000)
          .style("opacity", function(d) {
              return d.opacity;
          })
          .attr("transform", function(d, i) {
              return "translate("+ d.x +", "+ d.y +")" + "scale("+ d.scale +")" + "rotate("+ d.rotation +")";
          });
  
  }

}


