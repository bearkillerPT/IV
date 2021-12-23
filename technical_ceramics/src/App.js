import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react'
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import data from './data.json'
import chroma from "chroma-js";

const width = 600, height = 400

const SankeyNode = ({ name, x0, x1, y0, y1, color }) => (
  <>
    <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={color}/>
    <text x={x0 < width / 2 ? x1 + 6 : x0 - 40} y={((y1 + y0) / 2)+5} fontSize={15} fill={"black"}>{name}</text>

  </>
)


const SankeyLink = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: '.3',
      stroke: color,
      strokeWidth: Math.max(1, link.width),
    }}
  />
)


function App() {
  const [sankey1, setSakey1] = useState("Year")
  const [sankey2, setSakey2] = useState("Technology")
  const [dataGraph, setDataGraph] = useState(null)
  useEffect(()=>{
  setDataGraph(generateGraph([sankey1, sankey2], "RD (%)")) 
  }, [sankey1, sankey2])
  if(dataGraph) {
    console.log(dataGraph.links)
    const layout = sankey()(dataGraph)
    const color = chroma.scale("Set3").classes(dataGraph.nodes.length);
    const colorScale = d3.scaleLinear()
      .domain([0, dataGraph.nodes.length])
      .range([0, 1]);
    const { nodes, links } = sankey()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[1, 1], [width - 1, height - 5]])(dataGraph);
  
    return (
      <div className="App">
        <div class="sankeyGraph">
        <svg width={width} height={height} style={{ padding: 50 }}>
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
        <div class="graphControlls">
          <select value={sankey1} class="paramSelect" onChange={key=>{setSakey1(key.currentTarget.value)}}>
            {Object.keys(data[0]).map((key,i) => {
            return <option value={key} key={i}>{key}</option>
            })
            }
          </select>
          <select value={sankey2} class="paramSelect" onChange={key=>{setSakey2(key.currentTarget.value)}}>
          {Object.keys(data[0]).map((key,i) => {
            if(key != sankey1)
              return <option value={key} key={i}>{key}</option>
            })
            }
          </select>
        </div>
        </div>
      </div>
    );  

  }
  else{
    return(<div></div>);
  }  
}

//"RD (%)" will be divided into 10 categories: 90, 91, .. 99
const generateGraph = (sankeyNodes, output_var) => {
  var rels = {}
  var nodes = []
  for (let i = 0; i < sankeyNodes.length - 1; i++) {
    for (let node of data) {
      if(!Number(node[output_var]) && !String(node[output_var]))
        continue
      let first = node[sankeyNodes[i]]
      let second = node[sankeyNodes[i + 1]]
      if (!(nodes.includes("" + first)))
        nodes.push("" + first)
      else if (!(nodes.includes("" + second)))
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
      links.push({ "source": nodes.indexOf(first), "target": nodes.indexOf(second), "value": rels[first][second].count })
      
      links.push({ "source": nodes.indexOf(second), "target": nodes.length + (Math.abs(90-rel_val)|0), "value": rels[first][second].count  })
      console.log(nodes.length-1 + (Math.abs(90-rel_val)|0))
      console.log("r_val:" + rel_val)
    })
  })
  var res_nodes = []
  nodes.map(node => res_nodes.push({ "name": node }))
  for(let i = 90; i < 100; i++)
    res_nodes.push({"name": i + "%"})
  return { "nodes": res_nodes, "links": links }
}

export default App;
