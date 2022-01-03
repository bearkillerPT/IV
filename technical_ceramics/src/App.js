import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react'
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import data from './data.json'
import chroma from "chroma-js";
import { max } from 'd3';
const { innerWidth: width, innerHeight: height } = window;

const SankeyNode = ({ name, x0, x1, y0, y1, color }) => (
  <>
    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={color} />
    <text x={x0 < (width) / 2 ? x1 + 6 : x0 - 40} y={((y1 + y0) / 2) + 5} fontSize={15} fill={"black"}>{name}</text>

  </>
)


const SankeyLink = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: '.5',
      stroke: color,
      strokeWidth: Math.max(1, link.width),
    }}
  />
)
const margin = {
  top: 40,
  bottom: 40,
  left: 40,
  right: 40
};



function App() {
  const [scatter, setScatter] = useState("Year")
  const [sankey1, setSakey1] = useState("Year")
  const [sankey2, setSakey2] = useState("Technology")
  const [dataGraph, setDataGraph] = useState(null)
  useEffect(() => {
    setDataGraph(generateGraph([sankey1, sankey2], "RD (%)"))
  }, [sankey1, sankey2])
  const max_width = (width > 800 ? 800 : width)
  const max_height = height > 500 ? 500: height
  if (dataGraph) {
    const layout = sankey()(dataGraph)
    const color = chroma.scale("Set3").classes(dataGraph.nodes.length);
    const colorScale = d3.scaleLinear()
      .domain([0, dataGraph.nodes.length])
      .range([0, 1]);
    const { nodes, links } = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [max_width - 1, height - 5]])
      .nodeSort((a,b)=>{if(a.index==b.index)return 0; else if(a.index<b.index) return -1; else return 1})(dataGraph);
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => { if (Number(d[scatter])) return Number(d[scatter]) }))
      .range([25, max_width - 50]);

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
            <svg width={(width > 800 ? 830 : width)} height={height}>
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
            <div>
              <p>1st paramether</p>
              <select value={sankey1} className="ParamSelect" onChange={key => { setSakey1(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != sankey2 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>
            <div>
              <p>2nd paramether</p>
              <select value={sankey2} className="ParamSelect" onChange={key => { setSakey2(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != sankey1 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>
          </div>
        </div>
        <div className="ScatterGraph">

          <div className="GraphHeader">
            <p className="GraphTitle">Scatter Plot (not yet implemented)</p>
          </div>
          <div id="scatter" className='Graph' >
            <svg width={max_width} height={max_height + 50} >
              <g >

                <AxisLeft yScale={yScale} />
                <AxisBottom xScale={xScale} height={max_height} />
                <g >
                  {data.map((circle, i) => {
                    console.log(circle)
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
            <div className="ParamSelect">
              <p>Y-axis:</p>
              <p>RD  %</p>
            </div>
            <div>
              <p>X-axis:</p>
              <select value={scatter} className="ParamSelect" onChange={key => { setScatter(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>
          </div>
        </div>
      </div>
    );

  }
  else {
    return (<div></div>);
  }
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
  const textPadding = -1

  const axis = yScale.ticks(10).map((d, i) => (
    <g key={i} className="y-tick">
      <line
        style={{ stroke: "black" }}
        y1={yScale(d)}
        y2={yScale(d)}
        x1={0}
        x2={width}
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

  const axis = xScale.ticks(10).map((d, i) => (
    <g className="x-tick" key={i}>
      <line
        style={{ stroke: "black" }}
        y1={0}
        y2={height}
        x1={xScale(d)}
        x2={xScale(d)}
      />
      <text
        style={{ fontSize: '2vh' }}
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
