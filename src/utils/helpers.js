import dagre from 'dagre';
/**
 * return nodes and edges with preset position
 * @param  {Node[]} nodes - nodes flow in graph
 * @param  {Edge[]} edges - edges  flow in graph
 * @returns {{edges, nodes}}
 */
export function getDagrePosition({ incomingNodes, incomingEdges }) {
  const data = {
    nodes: arrToObject(incomingNodes),
    edges: arrToObject(incomingEdges),
  };

  const graph = new dagre.graphlib.Graph();
  // preset default label edge

  // Default to assigning a new object as a label for each new edge.
  graph.setDefaultEdgeLabel(function() {
    return {};
  });
  // dagre set config
  graph.setGraph({
    rankdir: 'TB',
  });
  //?  для начала надо понимать, модель будет нести в себе размер блока?
  //? будем проверять на поле size
  incomingNodes.forEach(node => {
    const { width, height } = { width: 180, height: 50 };
    const model = node.getModel();
    // загружаем данные по нодам в dagre
    graph.setNode(model.id, { width, height });
  });
  // загружаем edges в dagre
  incomingEdges.forEach(edge => {
    const { source, target } = edge.getModel();
    graph.setEdge(source, target);
  });
  // передаем данные в построитель графа
  dagre.layout(graph);

  const nodes = graph.nodes().map((node, i) => {
    const { id, x, y } = graph.node(node);
    console.log(`node ->${id}:`, graph.node(node));

    return { ...incomingNodes[i].getModel(), x, y };
  });
  const edges = graph.edges().map((edge, i) => {
    const coord = graph.edge(edge);

    return {
      ...incomingEdges[i],
      startPoint: coord.points[0],
      endPoint: coord.points[coord.points.length - 1],
      controlPoints: coord.points.slice(1, coord.points.length - 1),
    };
  });
  return {
    nodes,
    edges,
  };
}

function arrToObject(arr) {
  return arr.reduce((result, item) => {
    const nodeModel = item.getModel();
    return (result[nodeModel.id] = nodeModel);
  }, {});
}
