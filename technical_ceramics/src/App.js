import './App.css';
import { useState, useEffect } from 'react'
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'
import data from './data.json'
import chroma from "chroma-js";

const valueParams = [
  "#",
  "# old",
  "Check",
  "Year",
  "1=Powder or 0=Suspension-based",
  "UP Pressure (MPa)",
  "CIP Pressure (MPa)",
  "HIP (MPa)",
  "HIP (1=yes or 0=no)",
  "ND (mm)",
  "Zr (vol.%)",
  "Al (vol.%)",
  "Zr + Al (vol.%)",
  "0=Al or 1=Zr",
  "PS Zr (μm)",
  "PS Al (μm)",
  "PS (μm)",
  "Amount of zirconia dopant (mol.%)",
  "Sloading (vol.%)",
  "ST (ºC)",
  "t (h)",
  "LS (%)",
  "s.d.",
  "n",
  "VS (%)",


  "s.d..1",
  "n.1",
  "Gr Zr (μm)",
  "s.d..2",
  "n.2",
  "Gr Al (μm)",
  "s.d..3",
  "n.3",
  "E (GPa)",
  "s.d..4",
  "n.4",
  
  "H (GPa)",
  "s.d..5",
  "n.5",
  
  "Indentation load (N)",
  "FS 3pt (MPa)",
  "s.d..6",
  "n.6",
  "FS 4pt (MPa)",
  "s.d..7",
  "n.7",
  "B3B (MPa)",
  "s.d..8",
  "n.8",
  "Weibull (m)",
  "s.d..9",
  "n.9",
  "ORIGINAL KIc média",
  "ORIGINAL d.p.",
  "KIc (MPa (m)^1",
  "s.d..10",
  "n.10",
  "CTE (10-6 ºC-1)",
  "s.d..11",
  "n.11",
  "K (W",
  "s.d..12",
  "n.12"
]
const categoryParams = ["Estudo",
"Screening",
"Technology Macro Group",
"Technology",
"Category",
"PP Category",
"CCT Category",
"AM Category",
"Additives",
"Method E",
"Method H",
"Method KI",
"Zirconia dopant",
"Observações" ]
const { innerWidth: width, innerHeight: height } = window;
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

function App() {
  const [param1, setParam1] = useState("Al (vol.%)")
  const [param2, setParam2] = useState("Technology")
  const [dataGraph, setDataGraph] = useState(null)
  useEffect(() => {
    setDataGraph(generateGraph([param1, param2], "RD (%)"))
  }, [param1, param2])
  console.log(Object.keys(data[0]))
  const max_width = (width > 800 ? 800 : width)
  const max_height = height > 500 ? 500 : height
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
      .nodeSort((a, b) => {
        let aname = a.name;
        let bname = b.name;
        if (Number(a.name))
          aname = Number(a.name)
        else if (a.name[a.name.length - 1] == "%")
          aname = Number(a.name.substring(0, a.name.length - 1))
        if (Number(b.name))
          bname = Number(b.name)
        else if (b.name[b.name.length - 1] == "%")
          bname = Number(b.name.substring(0, b.name.length - 1))
        if (aname == bname)
          return 0;
        else if (aname < bname) return 1;
        else return -1
      })(dataGraph);
      const param1domain = data.map(d => { return "" + d[param1] }).sort(function(a, b){return a - b}); 
      const param2domain = data.map(d => { return "" + d[param2] }).sort(function(a, b){return a - b}); 
    const param1Scale = d3.scaleBand()
      .domain(param1domain)
      .range([10, max_height]);
    const param2Scale = d3.scaleBand()
      .domain(param2domain)
      .range([10, max_height]);
    const rdScale = d3.scaleLinear()
      .domain(d3.extent(data, d => Number(d["RD (%)"])))
      .range([25, max_width - 50]);
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
            <div id='param1'>
              <div className='paramColorContainer'>
                <p>1st paramether</p>

                <div id="param1Color" />

              </div>
              <select value={param1} className="ParamSelect" onChange={key => { setParam1(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != param2 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>
            <div id='param2'>
              <div className='paramColorContainer'>
                <p>2nd paramether</p>

                <div id="param2Color" />

              </div>
              <select value={param2} className="ParamSelect" onChange={key => { setParam2(key.currentTarget.value) }}>
                {Object.keys(data[0]).map((key, i) => {
                  if (key != param1 && key != "RD (%)")
                    return <option value={key} key={i}>{key}</option>
                })
                }
              </select>
            </div>

            <div id='param3'>
              <p>3rd paramether:</p>
              <p >RD(%)</p>
            </div>

          </div>
        </div>
        <div className="ScatterGraph">

          <div className="GraphHeader">
            <p className="GraphTitle">Scatter Plot</p>
          </div>
          <div className='Graph' >
            <svg width={max_width+ 50} height={max_height + 50} >
              <g >

                <AxisRight param2Scale={param2Scale} width={max_width} />
                <AxisLeft param1Scale={param1Scale} width={max_width} />
                <AxisBottom rdScale={rdScale} height={max_height - 30} />
                <g >
                  {data.map((circle, i) => {
                    if (Number(circle["RD (%)"]))
                      return (
                        <>
                          <circle
                            className='scatterCircle'
                            r={5}
                            cx={rdScale(circle["RD (%)"])}
                            cy={param1Scale("" + circle[param1])}
                            style={{ fill: '#fb0c1d' }}
                            key={param1 + i}
                          ><title>{param1 + " : " + circle[param1] + ", RD (%): " + circle["RD (%)"]}</title></circle>
                          <circle
                            className='scatterCircle'
                            r={5}
                            cx={rdScale(circle["RD (%)"])}
                            cy={param2Scale("" + circle[param2])}
                            style={{ fill: '#0d0da3' }}
                            key={param2 + i}
                          ><title>{param2 + " : " + circle[param2] + ", RD (%): " + circle["RD (%)"]}</title></circle>
                        </>);
                    else {
                      return (<></>);
                    }
                  })}
                </g>
              </g>
            </svg>
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
  var first_nodes = []
  var second_nodes = []
  var nodes = []
  for (let i = 0; i < sankeyNodes.length - 1; i++) {
    for (let node of data) {
      if (!Number(node[output_var]))
        continue
      let first = node[sankeyNodes[i]]
      let second = node[sankeyNodes[i + 1]]
      if (first == "" || second == "")
        continue

      if (!(first_nodes.includes("" + first)))
        first_nodes.push("" + first)
      if (!(second_nodes.includes("" + second)))
        second_nodes.push("" + second)
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
  for (let node of first_nodes)
    nodes.push(node)
  for (let node of second_nodes)
    nodes.push(node)
  var links = []
  Object.keys(rels).map((first) => {
    Object.keys(rels[first]).map(second => {
      let rel_val = (rels[first][second].sum / rels[first][second].count) | 0

      if (!(nodes.includes(rel_val + "%")))
        nodes.push(rel_val + "%")
      let second_index = first_nodes.length + second_nodes.indexOf("" + second)


      links.push({ "source": first_nodes.indexOf("" + first), "target": second_index, "value": rels[first][second].count })
      links.push({ "source": second_index, "target": nodes.indexOf(rel_val + "%"), "value": rels[first][second].count })


    })

  })
  var res_nodes = []
  nodes.map(node => res_nodes.push({ "name": node }))

  return { "nodes": res_nodes, "links": links }
}
function AxisLeft({ param1Scale, width }) {
  const textPadding = -1

  const axis = param1Scale.domain().map((d, i) => (
    <g key={i} className="y-tick">
      <line
        style={{ stroke: "#fb0c1d" }}
        y1={param1Scale(d)}
        y2={param1Scale(d)}
        x1={25}
        x2={width - 15}
      />
      <text
        style={{ fontSize: '1.5vh', fontWeight: 'bold' }}
      
        x={textPadding}
        dy=".71em"
        y={param1Scale(d) - 6}
      >
        {d}
      </text>
    </g>
  ));
  return <>{axis}</>;
}
function AxisRight({ param2Scale, width }) {
  const textPadding = width - 10
  const axis = param2Scale.domain().map((d, i) => (
    <g key={i} className="y-tick">
      <line
        style={{ stroke: "#0d0da3" }}
        y1={param2Scale(d)}
        y2={param2Scale(d)}
        x1={25}
        x2={width - 15}
      />
      <text
        style={{ fontSize: '1.5vh', fontWeight: 'bold' }}
      
        x={textPadding}
        dy=".71em"
        y={param2Scale(d) - 5}
      >
        {d}
      </text>
    </g>
  ));
  return <>{axis}</>;
}
function AxisBottom({ rdScale, height }) {
  const textPadding = 10;

  const axis = rdScale.ticks(20).map((d, i) => (
    <g className="x-tick" key={i}>
      <line
        style={{ stroke: "black" }}
        y1={0}
        y2={height}
        x1={rdScale(d)}
        x2={rdScale(d)}
      />
      <text
        style={{ fontSize: '1.5vh', fontWeight: 'bold' }}
        dy=".71em"
        x={rdScale(d)}
        y={height + textPadding}
      >
        {d}
      </text>
    </g>
  ));
  return <>{axis}</>;
}
export default App;

