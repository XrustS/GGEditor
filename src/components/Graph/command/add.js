import commandManager from '@common/CommandManager';
import { uuid } from '@utils';
import { getDagrePosition } from '../../../utils/helpers';

let edgeId = '';

commandManager.register({
  name: 'add',

  config: {
    params: {
      type: 'node',
      model: {},
      targetId: null,
    },

    init() {
      const { model } = this.params;

      if (model.id) {
        return;
      }

      model.id = uuid();
    },

    execute(graph) {
      const { type, model, targetId } = this.params;
      // создание edge и связка с node
      graph.add(type, model);
      if (targetId) {
        const targetNode = graph.findById(targetId);
        const targetModel = targetNode.getModel();
        edgeId = uuid();

        const edge = {
          id: edgeId,
          source: targetId,
          target: model.id,
          shape: 'polyline-round',
        };
        graph.addItem('edge', edge);
      }
      // test dagre function

      const data = getDagrePosition({
        incomingNodes: graph.getNodes(),
        incomingEdges: graph.getEdges(),
      });
      data.nodes.forEach(node => {
        graph.updateItem(graph.findById(node.id), node);
      });
      data.edges.forEach(edge => {
        graph.updateItem(graph.findById(edge.id), edge);
      });

      this.setSelectedNode(graph, model.id);
    },

    undo(graph) {
      const { model, targetId } = this.params;

      graph.remove(model.id);
      targetId && edgeId && graph.remove(edgeId);
    },
  },

  extend: 'base',
});
