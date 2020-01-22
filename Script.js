function Init(){
    Qva.LoadCSS("/QvAJAXZfc/QvsViewClient.aspx?public=only&name=Extensions/PieChartBarChartLegend/css/materialize.min.css");
    Qva.LoadScript("/QvAJAXZfc/QvsViewClient.aspx?public=only&name=Extensions/PieChartBarChartLegend/js/d3.v4.js", EnterPoint);
}

var colorsForGraph = [];

function prepareData(hypercube){
    dataDohnut = {};
    dataDohnutOld = {};
    dataBarchart = [];
    hypercube.map(function(val){
        if(val[1].data>0.01){
            dataDohnutOld[val[0].text] = parseFloat(val[1].text.substring(0,val[1].text.length-1).replace(",","."));
            dataBarchart.push({"Type":val[0].text,"Value":-parseFloat(val[1].text.substring(0,val[1].text.length-1).replace(",","."))});
        }
    });
    dataBarchart.columns = ["Type","Value"];
    dataBarchart.sort(function(a,b){ return a["Value"]-b["Value"];});
    for(var i=0;i<dataBarchart.length;i++){
        dataDohnut[dataBarchart[i].Type] = -dataBarchart[i].Value;
    }
    //dataDohnut.sort(function(a,b){ console.log(a);});
    var preparedData = [];
    preparedData["doughnut"] = dataDohnut;
    preparedData["barchart"] = dataBarchart;
    return preparedData;
}

function drawDoughnut(objId,height,width,data,colors,borderColor,pieBorderWeight){
    var width_Dohnut = width/1.5,
    height_Dohnut = width/1.5,
    margin_Dohnut = 20;
    var radius = Math.min(width_Dohnut, height_Dohnut) / 2 - margin_Dohnut;


    

    var margin_left = (width-width_Dohnut)/2-20;
    // append the svg object to the div called 'my_dataviz'
    var svgDohnut = d3.select("#dohnutchart_"+objId)
    .append("svg")
        .attr("width", width_Dohnut)
        .attr("height", height_Dohnut)
        .style('display','block')
        .style('margin-left',margin_left+'px')
        //.style('margin-right','auto')
    .append("g")
        .attr("transform", "translate(" + width_Dohnut / 2 + "," + height_Dohnut / 2 + ")");

    var pie = d3.pie().value(function(d) {return d.value; });
    var data_ready = pie(d3.entries(data));

    colorsForGraph = d3.scaleOrdinal().domain(data_ready).range(colors);

    svgDohnut
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(radius/2)         // This is the size of the donut hole
        .outerRadius(radius)
    )
    .attr('fill', function(d){ return(colorsForGraph(d.data.key)); })
    .attr("stroke", borderColor)
    .style("stroke-width", pieBorderWeight+"px")
    .style("opacity", 0.7);
}

function drawBarchart(objId,height,width,data,colors,textColor){
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = width/2,
    height = height-width*1.9;
    // set the ranges
    var y = d3.scaleBand()
        .range([height, 0])
        .padding(0.7);

    var x = d3.scaleLinear()
        .range([0, width]);
    x.clamp(true);
    // Scale the range of the data in the domains
    x.domain(
    [-100,10]
    //   d3.extent(data, function (d) {
    //     return d.Value;
    // })
    );
    y.domain(data.map(function (d) {
        return d.Type;
    }));

    colorsForGraph = d3.scaleOrdinal().domain(data).range(colors);

    var table = d3.select('#table_'+objId)
        .append('table')
        .append('tbody');
    for(var i=0;i<data.length;i++){
        var tr = table.append('tr');
        tr.append('td')
        .style("height","20px")
        .append('text')
        .text(data[i].Type)
        .style("color",textColor)
        .style("font-size","26px");
        var svg = tr.append('td')
        .append('svg').attr('width', width + margin.left + margin.right).attr('height', (height + margin.top + margin.bottom)/data.length).append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append("rect")
        .attr("x",  x(Math.min(0, data[i].Value)))
        .attr("y", height/(data.length*2))
        .attr("width", Math.abs(x(data[i].Value) - x(0)))
        .attr("height", y.bandwidth())
        .attr("rx", "10")
        .attr("ry", "10")
        .attr('fill', colorsForGraph(data[i].Type));

        svg.append("text")
            .attr("x", x(Math.max(0, data[i].Value))-(data[i].Value.toString().length*12))
            .attr("y", height/(data.length*2)-7)
            .attr("width", "20px")
            .attr("height", y.bandwidth())
            .text(-data[i].Value+"%")
            .style("font-size","26px")
            .style("fill",textColor);
    }
}

function EnterPoint(){
    Qv.AddExtension("PieChartBarChartLegend",
    function(){
        var objId = this.Layout.ObjectId.replace('\\','__');
        //todo. Add dynamic class using objId, to make possibility use more than 1 chart on page.
        this.Element.innerHTML = "<div class='row'><div class='col s12'><div id='dohnutchart_"+objId+"'></div></div></div><div class='row'><div class='col s12'><div id='table_"+objId+"'></div></div></div>";
        // this.Element.innerHTML = "<div class='container'><div class='chart chart_main_"+objId+"'></div><div class='chart'><table class='chart_table_"+objId+"'></table></div></div>";
        var height = this.Layout.Super.GetHeight();
        var width = this.Layout.Super.GetWidth();
        var colorsForGraph = this.Layout.Text0.text.split(';');
        var colorForDoughnatBorder = this.Layout.Text1.text;
        var textColor = this.Layout.Text2.text;
        var pieBorderWeight = this.Layout.Text3.text;
        var data = prepareData(this.Data.Rows);  
        drawDoughnut(objId,height,width,data["doughnut"],colorsForGraph,colorForDoughnatBorder,pieBorderWeight);
        drawBarchart(objId,height,width,data["barchart"],colorsForGraph,textColor);
    });
}

Init();