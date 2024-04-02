let radiusChoose = 1;
const x = d3.scaleBand();
const y = d3.scaleLinear();
export const svgaxis = d3.create("svg");
export const gy = svgaxis.append("g");
document.addEventListener('DOMContentLoaded', async function () {
    let year = 2011;
    const radiusslide = document.getElementById('radiusSlider');

    // Declare the chart dimensions and margins.
    const height = 500;
    const marginTop = 10;
    const width = 60;
    const marginBottom = 50;
    const marginLeft = 50;
    // Loading CSV File here.
    const data = await d3.csv("../data_sets/yearwise.csv");

    // Create the svgaxis container.
    svgaxis
        .attr("width", width)
        .attr("height", height);

    // Append the svgaxis element.
    scatter_graph2.append(svgaxis.node());

    // Function to update slider id
    async function updateSliderId() {
        year = 2011;

        radiusChoose = radiusslide.value;
        console.log(radiusChoose);
        console.log(year);

        // Declare the y (vertical position) scale.
        y.domain([0, d3.max(data, d => +d['X' + year])])
            .range([height - marginBottom, marginTop]);

        // Add the y-axis with transition.
         gy 
            .attr("transform", `translate(${marginLeft },0)`)
            .attr("class", "yaxis")
            .call(d3.axisLeft(y));

      

        // Update Y Axis title.
        svgaxis.selectAll("text.yaxis").remove();
        svgaxis.append("text")
            .attr("class", "yaxis")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", marginLeft - 35)
            .attr("text-anchor", "middle")
            .text("Value");


    }

    // Initial update
    await updateSliderId();

    // Adding event listener to update slider id when value changes
    radiusslide.addEventListener('input', updateSliderId);

});
