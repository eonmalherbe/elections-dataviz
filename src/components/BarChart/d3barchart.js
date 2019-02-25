import * as d3 from "d3";

export function Chart(container, width, height, className, ) {
    var XaxisOffset = 70;
    var YaxisOffset = 20;
    var predefColors = ["blue", "yellow", "red"];
    var svg = container.append("svg")
        .attr("width", parseInt(width) + XaxisOffset)
        .attr("height", parseInt(height) + YaxisOffset);
  
    var tooltipDiv;
    if (document.getElementsByClassName("tooltip")[0]) {
      tooltipDiv = d3.select(".tooltip");
    } else {
      tooltipDiv = d3.select("body").append("div")	
        .attr("class", className("tooltip"))				
        .style("opacity", 0);
    }
  
    var x = d3.scaleBand()
      .rangeRound([XaxisOffset, width])
  
    var y = d3.scaleLinear()
      .rangeRound([height, YaxisOffset]);
  
    svg.append("g")
      .attr("transform", "translate(20,"+(height/2+YaxisOffset/2)+")")
      .append("text")
      .attr("class", className("percentage-label"))
      .attr("transform", "rotate(-90)")
      .text("PERCENTAGE VOTES")
      .attr("text-anchor", "middle");
  
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
  
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + XaxisOffset +", 0)")
  
    var barSvg = svg.append("g")
      .attr("class", className("bar-container"));
    var barTextSvg = svg.append("g")
      .attr("class", className("bartext-container"));
  
    this.draw = function(chartData, partyColorsData) {
      var partyColorByName = {};
      // partyColorsData["data"]["allParties"]["edges"].forEach(edge => {
      //   partyColorByName[edge.node.name] = edge.node.colour;
      // })
      x.domain(chartData.map(function (d) {
          return d.name;
        }));
      y.domain([0, 100]);
  
          svg.select(".x.axis").transition().duration(300).call(d3.axisBottom(x));
          svg.select(".y.axis").transition().duration(300).call(d3.axisLeft(y)
        .ticks(6)
        .tickFormat(function(d) { return d + "%"; })
      )
  
      var bars = barSvg.selectAll(`.${className("bar")}`).data(chartData);
  
      bars.exit()
        .transition()
        .duration(300)
        .attr("y", function(d) {
          return y(0);
        })
        .attr("height", 0)
        .style("fill-opacity", 1e-6)
        .remove();
  
      bars.enter()
          .append("rect")
          .attr("class", className("bar"))
          .attr("x", function (d) {
            return x(d.name)+x.bandwidth()/20;
          })
          .attr("width", x.bandwidth()*9/10)
          .attr("fill", (d,i) => partyColorByName[d.partyInfo.name.split("/")[0]] || predefColors[i%predefColors.length])
          .on("mousemove", function(d) {		
              d3.select(this)
                .attr("opacity", 0.8);
              tooltipDiv.transition()		
                  .duration(200)		
                  .style("opacity", .9);		
              function formatPartyName(name) {
                return name.split("/")[0].toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase() })
              }
              tooltipDiv.html(formatPartyName(d.partyInfo.name) + " : " + d.percOfVotes + "%")
                  .style("left", (d3.event.pageX) + "px")		
                  .style("top", (d3.event.pageY - 28) + "px");	
              })					
          .on("mouseout", function(d) {		
              d3.select(this)
                .attr("opacity", 1);
              tooltipDiv.transition()		
                  .duration(200)		
                  .style("opacity", 0);	
          })
          .attr("y", function(d) {
            return y(0);
          })
          .attr("height", 0)        
  
        barSvg.selectAll(`.${className("bar")}`).data(chartData)
          .transition()
          .duration(300)
          .attr("y", function (d) {
            return y(Number(d.percOfVotes));
          })
          .attr("height", function (d) {
            return height - y(Number(d.percOfVotes));
          })
          
        var barTexts = barTextSvg.selectAll(`.${className("bartext")}`).data(chartData);
  
        barTexts.exit()
          .transition()
          .duration(300)
          .attr("y", function(d) {
            return y(0) - 5;
          })
          .style("fill-opacity", 1e-6)
          .remove();
  
        barTexts.enter().append("text")
          .attr("class", className("bartext"))
          .attr("x", function (d) {
            return x(d.name)+x.bandwidth()/2;
          })
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("y", function(d) {
            return y(0) - 5;
          })
        barTextSvg.selectAll(`.${className("bartext")}`).data(chartData)
          .text(function(d) {
            return d.percOfVotes + "%";
          })
          .transition()
          .duration(300)
          .attr("y", function (d) {
            return y(Number(d.percOfVotes)) - 5;
          })
    }
    this.destroy = function() {
      svg.remove();
    }
  }