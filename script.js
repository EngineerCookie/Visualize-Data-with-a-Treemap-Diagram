/*################
Source Links
################*/
const
    gameUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
    movieUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
    kickstartUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';

/*################
Source selector
################*/

async function getData(url) {
    try {
        const response = await fetch(url)
        return response.json();
    }
    catch (error) {
        console.log(error)
    }
}

let titleGame = 'Video Game Sales',
    titleMovie = 'Movie Sales',
    titleKickStart = 'Kickstarter Pledges',
    descriptionGame = 'Top 100 Most Sold Video Games Grouped by Platform',
    descriptionMovie = 'Top 100 Highest Grossing Movies Grouped By Genre',
    descriptionKickStart = 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category';

const sourceLink = document.querySelectorAll('[data-link]'),
    sourceTitle = document.querySelector('#title'),
    sourceDesc = document.querySelector('#description');

//Default values
sourceTitle.innerText = titleGame;
sourceDesc.innerText = descriptionGame;
let source = gameUrl; //<-- function for selecting source goes here
let data = await getData(source);

/*################
CANVAS: data-parameteres and variables
################*/
let colorBank = [
    'Pink',
    'Lavender',
    'Plum',
    'LightSalmon',
    'LightCoral',
    'OrangeRed',
    'Gold',
    'LightYellow',
    'Moccasin',
    'Khaki',
    'Lime',
    'MediumAquaMarine',
    'DarkSeaGreen',
    'Aqua',
    'CadetBlue',
    'DeepSkyBlue',
    'Cornsilk',
    'Wheat',
    'Ivory'
];

//Array of all the categories on data. Used to assign color for each category index to the colorBank
let categoryList = data.children.map(obj => { return Object.values(obj)[0] })

const width = 1000, height = 600, legendW = 650, legendH = 150;

const canvas = d3.select('.canvas')
    .attr('width', width)
    .attr('height', height);

const legend = d3.select('#legend')
    .attr('width', legendW)
    .attr('height', legendH);

let hierarchy = d3.hierarchy(data, (node) => { return node.children })
    .sum(node => { return node.value })
    .sort((a, b) => b.value - a.value);

let treeMap = d3.treemap().size([width, height])
treeMap(hierarchy);

let treeMapData = hierarchy.leaves();

let legendData = [...new Set(treeMapData.map(obj => { return Object.values(obj.data)[1] }))]

let tooltip = d3.select('#tooltip')
    .style('visibility', 'hidden')
    ;
let tooltipText = (data) => {
    return `Name: ${data.data.name}<br>
    Category: ${data.data.category}<br>
    Value: ${data.data.value}`
};

//from https://stackoverflow.com/questions/51520596/spread-d3-js-legend-on-two-columns
function position(d, i) {
    var c = 4;   // number of columns
    var h = 20;  // height of each entry
    var w = 150; // width of each entry (so you can position the next column)
    var tx = 10; // tx/ty are essentially margin values
    var ty = 10;
    var x = i % c * w + tx;
    var y = Math.floor(i / c) * h + ty;
    return "translate(" + x + "," + y + ")";
}

/*################
SVG INIT
################*/

let treeMapInit = () => {
    canvas.selectAll('g')
        .data(treeMapData)
        .enter()
        .append('g')
        .attr('class', 'group')
        .attr('transform', d => { return `translate(${d.x0}, ${d.y0})` })
        .call(g => g.append('rect')
            .attr('class', 'tile')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => {
                return colorBank[categoryList.indexOf(d.data.category)]
            })
            .attr('stroke', 'white')
            .attr('data-name', d => d.data.name)
            .attr('data-category', d => d.data.category)
            .attr('data-value', d => d.data.value))
        .call(g => g.append('foreignObject')
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .text(d => d.data.name))
        .on('mousemove', function (d, info) {
            tooltip.attr('data-value', info.data.value)
            tooltip.transition()
                .duration(200)
                .style('visibility', 'visible');
            tooltip.html(`${tooltipText(info)}`)
                .style('top', `${d.pageY}px`)
                .style('left', `${d.pageX + 20}px`)
        })
        .on('mouseout', function () {
            tooltip.transition()
                .duration(400)
                .style('visibility', 'hidden')
        })
        ;
}

let legendInit = () => {
    legend.selectAll('g')
        .data(legendData)
        .enter()
        .append('g')
        .attr('transform', position)
        .call(g => g.append('text')
            .attr('x', 18)
            .attr('y', 12)
            .text(d => d))
        .call(g => g.append('rect')
            .attr('class', 'legend-item')
            .attr('width', 10)
            .attr('height', 10)
            .attr('stroke', 'black')
            .attr('fill', d => {
                return colorBank[categoryList.indexOf(d)]
            }))
        ;
}

treeMapInit()
legendInit()