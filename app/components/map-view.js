import Ember from 'ember';
import d3 from 'd3';
import topojson from 'topojson';

export default Ember.Component.extend({

  didRender() {

    let width = 960,
      height = 500,
      centered;

    let projection = d3.geoAlbersUsa()
      .scale(1070)
      .translate([width / 2, height / 2]);

    let path = d3.geoPath()
      .projection(projection);

    let svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height)
      .on("click", clicked);

    let g = svg.append("g");

    d3.json("vendor/us.json", function(error, us) {
      if (error) {
        throw error;
      }

      g.append("g")
          .attr("id", "counties")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.counties).features)
          .enter().append("path")
          .attr("d", path)
          .on("click", clicked);

      g.append("path")
          .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; }))
          .attr("id", "county-borders")
          .attr("d", path);
    });

    function clicked(d) {
      let x, y, k;

      if (d && centered !== d) {
        let centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
      } else {
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
      }

      g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

      g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
    }

  }

});

