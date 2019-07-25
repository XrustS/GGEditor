import G6 from '@antv/g6';
import { ITEM_TYPE_NODE, ITEM_STATE_SELECTED } from '@common/constants';

G6.registerBehavior('click-node', {
  getDefaultCfg() {
    //! данные настройки доступны как параметры this
    return {
      multiple: true,
      keyCode: 17,
    };
  },

  getEvents() {
    return {
      'node:click': 'handleNodeClick',
      'canvas:click': 'handleCanvasClick',
      keydown: 'handleKeyDown',
      keyup: 'handleKeyUp',
    };
  },

  getSelectedNodes() {
    console.log(
      'getSelectedNodes: ',
      this.graph.findAllByState(ITEM_TYPE_NODE, ITEM_STATE_SELECTED),
    );

    return this.graph.findAllByState(ITEM_TYPE_NODE, ITEM_STATE_SELECTED);
  },

  clearSelectedState(shouldUpdate = () => true) {
    const { graph } = this;

    const selectedNodes = this.getSelectedNodes(graph);
    //! Выключили автоматическую перересовку ноды
    graph.setAutoPaint(false);
    //! Прошлись по списку выделенных нод и поменяли им статусы
    selectedNodes.forEach(node => {
      if (shouldUpdate(node)) {
        graph.setItemState(node, ITEM_STATE_SELECTED, false);
      }
    });
    //! Запустили перересовку графа
    graph.paint();
    //! Включили авто рендер графа
    graph.setAutoPaint(true);
  },

  handleNodeClick({ item }) {
    const { graph } = this;

    //? Проверям статус выделенного item
    const isSelected = item.hasState(ITEM_STATE_SELECTED);
    //? Проверяем нажат ли ctrl и включена ли вожможность множественного выделения
    if (this.multiple && this.keydown) {
      graph.setItemState(item, ITEM_STATE_SELECTED, !isSelected);
    } else {
      //? Выделение одиночной ноды
      this.clearSelectedState(node => {
        return node !== item;
      });

      if (!isSelected) {
        graph.setItemState(item, ITEM_STATE_SELECTED, true);
      }
    }
  },

  handleCanvasClick() {
    this.clearSelectedState();
  },

  handleKeyDown(e) {
    console.log('handleKeyDown: ', { keyCode: e.keyCode, which: e.which, e });
    //! Проверяем нажата ли клавиша Ctrl(keyCode 17)
    this.keydown = (e.keyCode || e.which) === this.keyCode;
  },

  handleKeyUp() {
    //! Убираем статус нажатой клавиши
    this.keydown = false;
  },
});
