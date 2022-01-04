import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react'
import * as d3 from "d3";
import * as d3_box from 'd3-boxplot'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import data from './data.json'
import chroma from "chroma-js";
import { max } from 'd3';
const { innerWidth: width, innerHeight: height } = window;
let totalLinkValue = 0
const SankeyNode = ({ name, x0, x1, y0, y1, color }) => (
  <>
    <rect x={x0} y={y0} width={x1 - x0 + name.length * 6} height={y1 - y0} fill={color} />
    <text x={x0 < (width) / 2 ? x1 - 12 : x0 + 2} y={((y1 + y0) / 2) + 5} fontSize={15} fill={"black"} className='nodeRectText'>{name}</text>
  </>
)


const SankeyLink = ({ link, color }) => (
  <>
  <path
      d={sankeyLinkHorizontal()(link)}
      className='sankeyLink'
      style={{
        fill: 'none',
        strokeOpacity: '.5',
        stroke: color,
        strokeWidth: Math.max(1, link.width),
      }}
    ><title>
      <div className='sankeyLinkTitle'>
      {link.source.name + " -> " + link.target.name + " : " + link.value}
      </div>
      </title>
    </path>
  </>


)
const margin = {
  top: 40,
  bottom: 40,
  left: 40,
  right: 40
};



function App() {
  const [box, setBox] = useState("Year")
  const [scatter, setScatter] = useState("Year")
  const [sankey1, setSakey1] = useState("Year")
  const [sankey2, setSakey2] = useState("Technology")
  const [dataGraph, setDataGraph] = useState(null)
  useEffect(() => {
    setDataGraph(generateGraph([sankey1, sankey2], "RD (%)"))
  }, [sankey1, sankey2])
  const max_width = (width > 800 ? 800 : width)
  const max_height = height > 500 ? 500 : height
  if (dataGraph) {
    //let boxStats = generateStats("Year", "RD (%)")
    //var box_x = d3.scaleLinear().domain([minI, maxI]).range([height, 0]);
    //const svg = d3
    //  .select("#boxplot")
    //  .attr("width", max_width + margin.left + margin.right)
    //  .attr("height", max_height + margin.top + margin.bottom)
    //  .append("g")
    //  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //  svg
    //  .append("line")
    //  .attr("y1", max_height/2)
    //  .attr("y2", max_height/2)
    //  .attr("x1", box_x(boxStats["2002"].min))
    //  .attr("x2", box_x(boxStats["2002"].max))
    //  .attr("stroke", "#1C3978");
    //// Show the box
    //svg
    //  .append("rect")
    //  .attr("y", max_width / 2)
    //  .attr("x", box_x(boxStats["2002"].q3))
    //  .attr("width", box_x(boxStats["2002"].q1) - box_x(boxStats["2002"].q3))
    //  .attr("height", width)
    //  .attr("stroke", "#1C3978")
    //  .style("fill", "#fff");
    //svg
    //  .selectAll("toto")
    //  .data([boxStats["2002"].min, boxStats["2002"].median, boxStats["2002"].max])
    //  .enter()
    //  .append("line")
    //  .attr("y1", max_width / 2)
    //  .attr("y2", max_width / 2)
    //  .attr("x1", function (d) {
    //    return box_x(d);
    //  })
    //  .attr("x2", function (d) {
    //    return box_x(d);
    //  })
    //  .attr("stroke", "#1C3978");
    //
    const layout = sankey()(dataGraph)
    const color = chroma.scale("Set3").classes(dataGraph.nodes.length);
    const colorScale = d3.scaleLinear()
      .domain([0, dataGraph.nodes.length])
      .range([0, 1]);
    const { nodes, links } = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [max_width - 1, height - 5]])
      .nodeSort((a, b) => { if (a.name == b.name) return 0; else if (a.name < b.name) return 1; else return -1 })(dataGraph);
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => { if (Number(d[scatter])) return Number(d[scatter]) }))
      .range([25, max_width - 50]);
    console.log(links)
    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d["RD (%)"])))
      .range([0, max_height]);
    return (
      <div className="App">
        <div className='Intro'>
          <p className="IntroP">A visual analisys of multiple ways that techincal ceramics are made. The porpuse of this website is to enable any type of user to take conclusions on which is the most effective manufacturing process!</p>
          <p className="IntroP">
            The production of technical ceramics as a lof of variants. Diferent percentages of Al and Zr, the technology, the year, this are all variables that the user might control and relate.
          </p>
          <p className="IntroP">
            This project was developed for the University of Aveiro in the context of the Information Visualization discipline.
          </p>
        </div>

        <div className="SankeyGraph">
          <div className="GraphHeader">
            <p className="GraphTitle">Alluvial Plot</p>
          </div>
          <div className="Graph">
            <svg width={(width > 800 ? 820 : width)} height={height}>
              <g style={{ mixBlendMode: 'multiply' }}>
                {dataGraph.nodes.map((node, i) => (
                  <SankeyNode
                    {...node}
                    key={i}
                    color={color(colorScale(i)).hex()}
                  />
                ))}
                {dataGraph.links.map((link, i) => (
                  
                  <SankeyLink
                    link={link}
                    key={i}
                    color={color(colorScale(link.source.index)).hex()}

                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="GraphControlls">
            <div id='sankey1'>
              <p>1st paramether</p>
              <select value={sankey1} className="ParamSelect" onChange={key => { setSakey1(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != sankey2 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>
            <div id='sankey2'>
              <p>2nd paramether</p>
              <select value={sankey2} className="ParamSelect" onChange={key => { setSakey2(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != sankey1 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>

            <div id='sankey3'>
              <p>3rd paramether:</p>
              <p>RD(%)</p>
            </div>

          </div>
        </div>
        <div className="ScatterGraph">

          <div className="GraphHeader">
            <p className="GraphTitle">Scatter Plot</p>
          </div>
          <div id="scatter" className='Graph' >
            <svg width={max_width} height={max_height + 50} >
              <g >

                <AxisLeft yScale={yScale} width={max_width - 10} />
                <AxisBottom xScale={xScale} height={max_height} />
                <g >
                  {data.map((circle, i) => {
                    if (Number(circle["RD (%)"]))
                      return (
                        <circle
                          r={5}
                          cx={xScale(circle[scatter])}
                          cy={yScale(circle["RD (%)"])}
                          style={{ fill: 'black' }}
                          key={i}
                        />);
                    else {
                      return (<></>);
                    }
                  })}
                </g>
              </g>
            </svg>
          </div>
          <div className="GraphControlls">
            <div id="scatterX">
              <p>X-axis:</p>
              <select value={scatter} className="ParamSelect" onChange={key => { setScatter(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>

            <div id="scatterY" className="ParamSelect">
              <p>Y-axis:</p>
              <p>RD  %</p>
            </div>
          </div>
        </div>
        <div className="ScatterGraph">

        </div>
      </div>
    );

  }
  else {
    return (<div></div>);
  }
}

const generateStats = (input_var, output_var) => {
  let res = {}
  for (let node of data) {
    if (Number(node[output_var])) {
      let out_val = Number(node[output_var])
      if (node[input_var] in res)
        res[node[input_var]].push(out_val)
      else {
        res[node[input_var]] = [out_val]
      }
    }
  }
  for (let key in res) {
    res[key].sort((a, b) => a - b);
  }
  let stats = {}
  for (let key in res) {
    stats[key] = {
      min: res[key][0],
      max: res[key][res[key].length - 1],

    }
  }
  return res
}

//"RD (%)" will be divided into 10 categories: 90, 91, .. 99
const generateGraph = (sankeyNodes, output_var) => {
  var rels = {}
  var nodes = []
  for (let i = 0; i < sankeyNodes.length - 1; i++) {
    for (let node of data) {
      if (!Number(node[output_var]))
        continue
      let first = node[sankeyNodes[i]]
      let second = node[sankeyNodes[i + 1]]
      if (first == "" || second == "")
        continue
      if (sankeyNodes[i] != "Year" && Number(first) && first > 10)
        first -= first % 10
      if (sankeyNodes[i + 1] != "Year" && Number(second) && second > 10)
        second -= second % 10
      if (!(nodes.includes("" + first)))
        nodes.push("" + first)
      if (!(nodes.includes("" + second)))
        nodes.push("" + second)
      if (!(first in rels))
        rels[first] = {}
      if (!(second in rels[first])) {
        rels[first][second] = {}
        rels[first][second].sum = Number(node[output_var])
        rels[first][second].count = 1
      }
      else {
        rels[first][second].sum += Number(node[output_var])
        rels[first][second].count += 1
      }
    }
  }
  var links = []
  Object.keys(rels).map((first) => {
    Object.keys(rels[first]).map(second => {
      let rel_val = rels[first][second].sum / rels[first][second].count
      if (!(nodes.includes((rel_val | 0) + "%")))
        nodes.push((rel_val | 0) + "%")
      links.push({ "source": nodes.indexOf("" + first), "target": nodes.indexOf("" + second), "value": rels[first][second].count })

      links.push({ "source": nodes.indexOf("" + second), "target": nodes.indexOf((rel_val | 0) + "%"), "value": rels[first][second].count })
    })
    
  })
  var res_nodes = []
  nodes.map(node => res_nodes.push({ "name": node }))

  return { "nodes": res_nodes, "links": links }
}

function AxisLeft({ yScale, width }) {
  const textPadding = width - 10

  const axis = yScale.ticks(10).map((d, i) => (
    <g key={i} className="y-tick">
      <line
        style={{ stroke: "black" }}
        y1={yScale(d)}
        y2={yScale(d)}
        x1={25}
        x2={width - 15}
      />
      <text
        style={{ fontSize: 12 }}
        x={textPadding}
        dy=".71em"
        y={yScale(d)}
      >
        {d}
      </text>
    </g>
  ));
  return <>{axis}</>;
}
function AxisBottom({ xScale, height }) {
  const textPadding = 10;

  const axis = xScale.ticks(20).map((d, i) => (
    <g className="x-tick" key={i}>
      <line
        style={{ stroke: "black" }}
        y1={0}
        y2={height}
        x1={xScale(d)}
        x2={xScale(d)}
      />
      <text
        style={{ fontSize: '2vh', fontWeight: 'bolder' }}
        dy=".71em"
        x={xScale(d)}
        y={height + textPadding}
      >
        {d}
      </text>
    </g>
  ));
  return <>{axis}</>;
}
export default App;

