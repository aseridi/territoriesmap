import * as d3 from "d3";
import dividedData from "../data/dividedfile.json";
// Extract states GeoJSON features
const states = dividedData;
// Mapping object for sales reps and their contact details
const salesRepData = {
    "Northeast": { salesRep: "Steven Suh", salesRepContact: "steven.suh@rayamerica.com", salesRepNum: "201-290-7848" },
    "Midwest1": { salesRep: "Jon Kratz", salesRepContact: "jon.kratz@rayamerica.com", salesRepNum: "513-346-8517" },
    "MidAtlantic": { salesRep: "Daniel Kang", salesRepContact: "daniel.kang@rayamerica.com", salesRepNum: "240-938-6318" },
    "Southeast1": { salesRep: "Jason Mastrean", salesRepContact: "jason.mastrean@rayamerica.com", salesRepNum: "980-259-2343" },
    "Southeast2": { salesRep: "Warren Miller", salesRepContact: "warren.miller@rayamerica.com", salesRepNum: "941-302-0991" },
    "Florida": { salesRep: "Warren Miller", salesRepContact: "warren.miller@rayamerica.com", salesRepNum: "941-302-0991" },
    "Midwest2": { salesRep: "Jon Kratz", salesRepContact: "jon.kratz@rayamerica.com", salesRepNum: "513-346-8517" },
    "SouthCentral1": { salesRep: "Richard Centala", salesRepContact: "richard.centala@rayamerica.com", salesRepNum: "214-850-0371" },
    "SouthCentral2": { salesRep: "Richard Centala", salesRepContact: "richard.centala@rayamerica.com", salesRepNum: "214-850-0371" },
    "TexasSouth": { salesRep: "Stefan Moser", salesRepContact: "stefan.moser@rayamerica.com", salesRepNum: "281-413-8670" },
    "Northwest": { salesRep: "Steve Pryce", salesRepContact: "steve.pryce@rayamerica.com", salesRepNum: "858-735-5442" },
    "MountainPlains": { salesRep: "Stefan Moser", salesRepContact: "stefan.moser@rayamerica.com", salesRepNum: "281-413-8670" },
    "Southwest": { salesRep: "Makia Kim", salesRepContact: "makia.kim@rayamerica.com", salesRepNum: "646-703-1155" },
    "CaliforniaNorth": { salesRep: "Steve Pryce", salesRepContact: "steve.pryce@rayamerica.com", salesRepNum: "858-735-5442" },
};
// Territories mapping
const territories = {
    Northeast: [
        "New York North",
        "New York South",
        "Vermont",
        "New Hampshire",
        "Connecticut",
        "Massachusetts",
        "New Jersey",
        "Rhode Island",
        "Maine",
    ],
    Midwest1: ["Michigan", "Indiana", "Ohio", "West Virginia", "Pennsylvania West"],
    MidAtlantic: [
        "Pennsylvania East",
        "Maryland",
        "Delaware",
        "District of Columbia",
        "Virginia",
    ],
    Southeast1: ["North Carolina", "South Carolina", "Tennessee", "Kentucky"],
    Southeast2: ["Georgia", "Alabama", "Mississippi"],
    Florida: ["Florida"],
    Midwest2: [
        "North Dakota",
        "South Dakota",
        "Illinois",
        "Wisconsin",
        "Minnesota",
        "Iowa",
    ],
    SouthCentral1: ["Arkansas", "Oklahoma", "Missouri"],
    SouthCentral2: ["Texas North"],
    TexasSouth: ["Louisiana", "Texas South"],
    Northwest: ["Washington", "Oregon", "Idaho", "Montana", "Alaska"],
    MountainPlains: [
        "Utah",
        "Colorado",
        "New Mexico",
        "Wyoming",
        "Nebraska",
        "Kansas",
    ],
    Southwest: ["Arizona", "California South", "Nevada East", "Hawaii"],
    CaliforniaNorth: ["California North", "Nevada West"],
};
// Enhance the GeoJSON features by appending sales rep data
states.features.forEach((feature) => {
    const stateName = feature.properties.name;
    // Find the territory that includes this state
    const territory = Object.keys(territories).find((territoryName) => territories[territoryName].includes(stateName));
    // Add salesRep, salesRepContact, and salesRepNum if the territory is found in salesRepData
    if (territory && salesRepData[territory]) {
        feature.properties.salesRep = salesRepData[territory].salesRep;
        feature.properties.salesRepContact = salesRepData[territory].salesRepContact;
        feature.properties.salesRepNum = salesRepData[territory].salesRepNum;
    }
    else {
        feature.properties.salesRep = "N/A";
        feature.properties.salesRepContact = "N/A";
        feature.properties.salesRepNum = "N/A";
    }
});
// Group territories by sales rep
const groupedBySalesRep = {};
states.features.forEach((feature) => {
    const { salesRep, salesRepContact, salesRepNum, name } = feature.properties;
    if (salesRep && salesRep !== "N/A") {
        if (!groupedBySalesRep[salesRep]) {
            groupedBySalesRep[salesRep] = { territories: [], contact: salesRepContact || "N/A", phone: salesRepNum || "N/A" };
        }
        groupedBySalesRep[salesRep].territories.push(name);
    }
});
// SVG setup
const width = 960;
const height = 600;
const svg = d3.select("#map").attr("width", width).attr("height", height);
// Projection and path
const projection = d3.geoAlbersUsa().scale(1300).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
// Tooltip
const tooltip = d3.select("body").append("div").attr("class", "tooltip")
    .style("opacity", 0).style("position", "absolute").style("background", "white")
    .style("border", "1px solid grey").style("border-radius", "5px").style("padding", "10px")
    .style("pointer-events", "none");
// Draw states with data and interactivity
svg.append("g")
    .selectAll("path")
    .data(states.features)
    .enter().append("path")
    .attr("d", (d) => path(d) || "")
    .attr("fill", "#303642")
    .attr("stroke", "#f0e2d8")
    .attr("id", (d) => d.properties.name.replace(/ /g, ""))
    .on("mouseover", (event, d) => {
    const currentStateName = d.properties.name;
    const salesRep = d.properties.salesRep;
    const salesRepContact = d.properties.salesRepContact;
    const salesRepNum = d.properties.salesRepNum;
    // Territory Highlighting (using groupedBySalesRep)
    if (salesRep && groupedBySalesRep[salesRep]) {
        groupedBySalesRep[salesRep].territories.forEach((territory) => {
            d3.select(`#${territory.replace(/ /g, "")}`).attr("fill", "rgba(37, 173, 229, 0.5)"); // Highlight all in territory
        });
        d3.select(`#${currentStateName.replace(/ /g, "")}`).attr("fill", "#25ade5"); // Highlight current state more distinctly
        // Tooltip Content (using groupedBySalesRep)
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${salesRep}</strong><br>
                ${salesRepContact}<br>
                ${salesRepNum}`).style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 20}px`);
    }
    else {
        // Handle cases where there is no sales rep data
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${currentStateName}</strong><br>No sales rep assigned.`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
    }
})
    .on("mouseout", (event, d) => {
    const salesRep = d.properties.salesRep;
    if (salesRep && groupedBySalesRep[salesRep]) {
        groupedBySalesRep[salesRep].territories.forEach((territory) => {
            d3.select(`#${territory.replace(/ /g, "")}`).attr("fill", "#303642");
        });
    }
    tooltip.transition().duration(500).style("opacity", 0);
})
    .on("mousemove", (event) => {
    tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 20}px`);
});
// Generate Sales Rep Tiles
const salesRepsContainer = d3.select("#sales-reps");
Object.keys(groupedBySalesRep).forEach((salesRep) => {
    const { territories, contact, phone } = groupedBySalesRep[salesRep];
    const tile = salesRepsContainer.append("div").attr("class", "tile").attr("id", `tile-${salesRep.replace(/ /g, "")}`)
        .html(`<strong>${salesRep}</strong><br>${contact}<br>${phone}`);
    territories.forEach((territory) => {
        d3.select(`#${territory.replace(/ /g, "")}`).on("click", () => {
            // Scroll to the sales rep tile
            document.getElementById(`tile-${salesRep.replace(/ /g, "")}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            // Highlight the sales rep tile
            d3.selectAll(".tile").classed("highlighted", false); // Remove highlight from all tiles
            d3.select(`#tile-${salesRep.replace(/ /g, "")}`).classed("highlighted", true); // Add highlight to the clicked tile
        });
    });
});
