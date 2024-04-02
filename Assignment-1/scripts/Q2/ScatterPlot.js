let radiusChoose = 1;
const x = d3.scaleBand();
const y = d3.scaleLinear();
import { svgaxis, gy } from "./ScatterAxis.js";
document.addEventListener('DOMContentLoaded', async function () {

    let year = 2011;
    const radiusslide = document.getElementById('radiusSlider');
    const radiusslider2 = document.getElementById('radiusSlider2');

    // Declare the chart dimensions and margins.
    const width = 500;
    const height = 500;
    const marginTop = 10;
    const marginRight = 0;
    const marginBottom = 50;
    const marginLeft = 0;

    // Loading CSV File here.
    const data = await d3.csv("../data_sets/yearwise.csv");

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);

    // Append the SVG element.
    scatter_plot2.append(svg.node());

    // Define a brush
    const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", brushed);

    // Append brush group
    const brushGroup = svg.append("g")
        .attr("class", "brush");

    // Append a rectangle to capture brush events
    brushGroup.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .attr("cursor", "crosshair");

    // Function to handle brushing
    function brushed(event) {
        if (!event.selection) {
            // No selection, reset all circles to steelblue
            svg.selectAll("circle")
                .style("fill", "steelblue");
            return;
        }

        const [[x0, y0], [x1, y1]] = event.selection;

        svg.selectAll("circle")
            .style("fill", function (d) {
                const cx = x(d.Name) + (x.bandwidth() / 2) - (d[('R' + year)] * 2 / 2);
                const cy = y(d['X' + year]);

                // Check if circle center coordinates are within the brushed area
                if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
                    return "orange"; // Change color to orange for selected circles
                } else {
                    return "steelblue"; // Reset color for circles outside the brushed area
                }
            });
    }

    // Function to update slider id
    async function updateSliderId() {
        year = 2011;

        radiusChoose = radiusslide.value;
        const zoomOrBrush = radiusslider2.value;

        // Remove previous y-axis elements
        svg.selectAll(".yaxis").remove();
        svg.selectAll(".xaxis").remove();

        // Declare the x (horizontal position) scale.
        x.domain(data.map(d => d.Name))
            .range([marginLeft, width - marginRight]);

        // Declare the y (vertical position) scale.
        y.domain([0, d3.max(data, d => +d['X' + year])])
            .range([height - marginBottom, marginTop]);

        // Add the x-axis without transition.
        const gx = svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .attr("class", "xaxis")
            .call(d3.axisBottom(x));

        // Update X Axis title.
        svg.selectAll("text.xaxis").remove();
        svg.append("text")
            .attr("class", "xaxis")
            .attr("x", width / 2)
            .attr("y", height - marginBottom + 40)
            .attr("text-anchor", "middle")
            .text("Name " + year);

        // Update Y Axis title.
        svg.selectAll("text.yaxis").remove();
        svg.append("text")
            .attr("class", "yaxis")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", marginLeft - 35)
            .attr("text-anchor", "middle")
            .text("Value");

        // Remove previous circles
        svg.selectAll("circle").remove();

        // Add a circle for each data point.
        const view = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return x(d.Name) + (x.bandwidth() / 2) - (d[('R' + year)] * 2 / 2);
            })
            .attr("cy", function (d) {
                return y(d['X' + year]);
            })
            .attr("r", function (d) { return d[('R' + year)] * 2; })
            .attr("class", function (d, i) {
                return "point" + i
            })
            .style("fill", "steelblue")
            .style("fill-opacity", function (d) {
                // Calculate opacity based on the radius value
                // Adjust the scale as per your requirements
                return d.R2011 / d3.max(data, d => d.R2011);
            })

            .on("mouseover", function (event, d, i) {
                let point = this.getAttribute('class');
                console.log(point);

                console.log(this);
                d3.select(this).style("fill", "orange");
                // Calculate the position of the tooltip relative to the SVG container
                const tooltipX = event.offsetX + 500;
                const tooltipY = event.offsetY + 1000;

                tooltipCircle2.html(`Name: ${d.Name}<br/>Value: ${d['X' + year]}<br/> Radius: ${d['R' + year]}`)
                    .style("left", tooltipX + "px")
                    .style("top", tooltipY + "px")
                    .style("opacity", 1)
                    .style('visibility', "visible");

            })
            .on("mouseout", (d) => {
                d3.selectAll("circle")
                    .style("fill", "steelblue");
                tooltipCircle2.style('visibility', "hidden");
            });

        // Adding Tool Tip to the Graphs
        const tooltipCircle2 = d3.select("#scatter_plot2").append("div")
            .attr("class", "tooltipCircle2")
            .style("opacity", 1)
            .style("position", "absolute");

        // Update visibility of circles based on radiusChoose
        d3.selectAll("#scatter_plot2 circle")
            .style("visibility", function (d) {
                // Condition to show circles with radius greater than 5 when year is 2011
                if (d["R" + year] <= radiusChoose) {
                    return "hidden";
                } else {
                    return "visible";
                }
            });

        if (zoomOrBrush == 1) {
            // Remove the brush functionality
            brushGroup.selectAll(".overlay").remove();

            // Applying Zoom Effect 
            const zoom = d3.zoom()
                .scaleExtent([.5, 5])
                .on("zoom", zoomed);

            function zoomed({ transform }) {
                // Update the circle position 
                view.attr("transform", transform);

                // Update the range of the x-scale
                const newXRange = [
                    transform.applyX(marginLeft),
                    transform.applyX(width - marginRight)
                ];

                // Update the x-scale with the new range and remove the x axis scale created previously.
                x.range(newXRange);
                gx
                    .attr("transform", `translate(0,${height - marginBottom})`)
                    .attr("class", "xaxis")
                    .call(d3.axisBottom(x));

                gy.call(d3.axisLeft(y).scale(transform.rescaleY(y)));
            }
            svg.call(zoom);
        } else if (zoomOrBrush == 2) {
            // Activate brush functionality
            brushGroup.call(brush);

            svg.on(".zoom", null);
        }
    }

    // Initial update
    await updateSliderId();

    radiusslide.addEventListener('input', updateSliderId);
    radiusslider2.addEventListener('input', updateSliderId);
});
