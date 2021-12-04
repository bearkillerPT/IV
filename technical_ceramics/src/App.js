import logo from './logo.svg';
import './App.css';
import { useState } from 'react'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import data from './data.json'

const width=700, height=600

const SankeyNode = ({ name, x0, x1, y0, y1, color }) => (
  <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={color}>
    <title>{name}</title>
  </rect>
)

const SankeyLink = ({ link, color }) => (
  <path
    d={sankeyLinkHorizontal()(link)}
    style={{
      fill: 'none',
      strokeOpacity: '.3',
      stroke: '#000',
      strokeWidth: Math.max(1, link.width),
    }}
  />
)

function App() {
  const [sankeyNodes, setSankeyNodes] = useState(["Year", "Technology"])
  var data_graph = generateGraph(sankeyNodes, "RD (%)")
  const layout = sankey()(data_graph)

  const { nodes, links } = sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 5]])(data_graph);

  return (
    <div className="App">
       <svg width={width} height={height} style={{padding:50}}>
        <g style={{ mixBlendMode: 'multiply' }}>
          {data_graph.nodes.map((node, i) => (
            <SankeyNode
              {...node}
              key={i}
            />
          ))}
          {data_graph.links.map((link, i) => (
            <SankeyLink
              link={link}
              key={i}
            />
          ))}
        </g>
        </svg>
    </div>
  );
}

const generateGraph = (sankeyNodes, output_var) => {
  var rels = {}
  var nodes = []
  for (let i = 0; i < sankeyNodes.length - 1; i++) {
    for (let node of data) {
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
      links.push({ "source": nodes.indexOf(first), "target": nodes.indexOf(second), "value":  rels[first][second].count})
    })
  })
  var res_nodes = []
  nodes.map(node => res_nodes.push({ "name": node }))
  return { "nodes": res_nodes, "links": links }
}

export default App;
