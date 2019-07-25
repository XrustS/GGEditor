import React from 'react';
import withEditorContext from '@common/EditorContext/withEditorContext';
import { addListener } from '../../utils';
import { ITEM_STATE_ACTIVE } from '@common/constants';

class Item extends React.PureComponent {
  constructor(props) {
    super(props);
    this.itemOnPanel = React.createRef();
    this.state = {
      shadowShape: null,
      dragShape: null,
      dragShapeID: 'temp_drag_node',
    };
  }

  handleMouseDown = () => {
    const shadowShape = this.createShadowShape();
    document.body.appendChild(shadowShape);
    this.setState({
      shadowShape,
    });
  };

  handleMouseUp = () => {
    console.log('handleMouseUp:');

    this.unloadDragShape();
  };

  createShadowShape() {
    const { src, graph } = this.props;

    const Img = document.createElement('img');
    Img.src = src;
    const shadowShape = document.createElement('div');
    const styleObj = `      
      width: ${Img.width}px;
      height: ${Img.height}px;      
      position: absolute;
      opacity:0;
      top: ${this.itemOnPanel.current.getBoundingClientRect().top}px;
      left: ${this.itemOnPanel.current.getBoundingClientRect().left}px;
      cursor: pointer;
    `;

    shadowShape.setAttribute('style', styleObj);
    shadowShape.setAttribute('draggable', 'true');
    shadowShape.addEventListener('drag', this.handleDrag, false);
    document.addEventListener('dragover', this.handleDragover, false);
    document.addEventListener('dragenter', this.handleDragenter, false);
    document.addEventListener('drop', this.handleDrop, false);
    //! TODO:  add Event Listenter for graph events

    // addListener(graph, 'node:mouseenter', this.handleDrop);
    shadowShape.addEventListener('mouseup', this.handleMouseUp, false);
    return shadowShape;
  }

  handleDragover = ev => {
    ev.preventDefault();
  };

  handleDragenter = ev => {
    const { graph } = this.props;
    const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);
    const canvas = graph.get('container').getElementsByTagName('canvas')[0];
    console.log('ItemPanel Item handleDregEnter:', {
      transferredPos,
      canvas,
      ev,
    });
    // drag into canvas
    if (ev.target.id === canvas.id) {
      this.loadDragShape(transferredPos);
      console.log('ItemPanel Item handleDregEnter: loadDragShape');
    }
  };

  handleDrag = ev => {
    const { graph, setGraphState, graphState } = this.props;
    const { dragShape, dragShapeID } = this.state;
    graphState !== 'drag-drop' && setGraphState('drag-drop');
    if (dragShape) {
      const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);
      graph.update(dragShapeID, {
        ...transferredPos,
      });
    }
  };
  // Обьект который мы тянем
  // TODO: написать свою обвязку
  /**  Эта функция подгружает псевдо елемент
   @param {x: number, y: number} props - позиция объекта
   @result {void} - 
   */
  loadDragShape({ x, y }) {
    const { graph } = this.props;
    const { dragShape, shadowShape, dragShapeID } = this.state;
    if (!dragShape) {
      const newDragShape = graph.add('node', {
        shape: 'rect',
        x,
        y,
        size: [shadowShape.offsetWidth, shadowShape.offsetHeight],
        style: {
          cursor: 'pointer',
          fill: '#F3F9FF',
          fillOpacity: 0,
          stroke: '#1890FF',
          strokeOpacity: 0.9,
          lineDash: [5, 5],
        },
        id: dragShapeID,
      });
      this.setState({
        dragShape: newDragShape,
      });
    }
  }

  unloadDragShape() {
    const { graph } = this.props;
    const { dragShape, shadowShape } = this.state;
    console.log('unloadDragShape: ', { dragShape, shadowShape });

    if (dragShape) {
      graph.remove(dragShape);
    }
    if (shadowShape) {
      document.body.removeChild(shadowShape);
    }
    this.setState({
      dragShape: null,
      shadowShape: null,
    });
    document.removeEventListener('dragenter', this.handleDragenter);
    document.removeEventListener('dragover', this.handleDragover);
    document.removeEventListener('drop', this.handleDrop);
  }
  //! завершающая функция, которая вызывает команду на добавление новой ноды.
  handleDrop = ev => {
    const {
      graph,
      executeCommand,
      type,
      model,
      shape,
      size,
      graphState,
      setGraphState,
    } = this.props;
    const { dragShapeID } = this.state;
    console.log('handleDROP =>>', { graphState, Props: this.props });
    // if (graphState === 'drag-drop') {
    const canvas = graph.get('container').getElementsByTagName('canvas')[0];
    const transferredPos = graph.getPointByClient(ev.clientX, ev.clientY);
    console.log('handleDrop: ', { Props: this.props, transferredPos, ev });
    setGraphState('default');
    // Надо понять что мы перетащили на ноду

    // drag into canvas
    if (ev.target.id === canvas.id) {
      executeCommand('add', {
        type,
        model: {
          ...model,
          shape,
          ...transferredPos,
          size: size.split('*'),
        },
      });
    }
    console.log(ev.item);
    this.unloadDragShape();
    graph.remove(dragShapeID);
    // }
  };

  render() {
    const { src, shape, children } = this.props;

    return (
      <div
        style={{ cursor: 'pointer' }}
        onMouseDown={this.handleMouseDown}
        ref={this.itemOnPanel}
      >
        {src ? <img src={src} alt={shape} draggable={false} /> : children}
      </div>
    );
  }
}

export default withEditorContext(Item);
