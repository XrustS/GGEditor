import {
  SHPAE_CLASSNAME_ANCHOR,
  SHAPE_CLASSNAME_KEYSHAPE,
} from '@common/constants';
import globalStype from '../common/globalStyle';

const {
  anchorPointStyle,
  anchorPointHoverStyle,
  anchorHotsoptActivedStyle,
  anchorHotsoptStyle,
  zIndex,
} = globalStype;

function handleAnchor(name, value, item) {
  const model = item.get('model');
  // получить group
  const group = item.getContainer();
  // Получить все точки привязки
  const anchors = group
    .get('children')
    .filter(e => e.get('className') === SHPAE_CLASSNAME_ANCHOR);

  // Состояние без перетаскивания
  if (!this.addingEdge) {
    // Введите опорную точку, чтобы активировать опорную точку,
    // а значение - это целевая опорная точка
    // // Оставляем якорь, чтобы очистить все стили активации якоря
    if (name === 'activeAnchor')
      value
        ? value.setActived && value.setActived()
        : anchors.forEach(a => a.clearActived());
    // // покидаем узел, чтобы скрыть все точки привязки
    // // Вход в узел для отображения всех точек привязки
    if (name === 'active')
      value ? this.drawAnchor(model, group) : anchors.forEach(a => a.remove());
    if (name === 'selected' && !value) anchors.forEach(a => a.remove());
  } else {
    // Активируем опорную точку, чтобы активировать стиль горячей точки при перетаскивании
    if (name === 'activeAnchor') {
      value
        ? value.setHotspotActived && value.setHotspotActived(true)
        : anchors.forEach(
            a => a.setHotspotActived && a.setHotspotActived(false),
          );
    }
  }
  // Вход в состояние перетаскивания
  if (name === 'addingEdge') {
    if (value) {
      this.addingEdge = true;
      const anchors = this.drawAnchor(model, group);
      // показать точку доступа в состоянии перетаскивания
      anchors.forEach(a => a.showHotspot());
    } else {
      // Очистить все точки привязки при перетаскивании
      item
        .getContainer()
        .get('children')
        .filter(i => i.get('className') === SHPAE_CLASSNAME_ANCHOR)
        .forEach(a => a.remove());
      this.addingEdge = false;
    }
  }
}

function drawAnchor(model, group) {
  const anchorPoints = this.getAnchorPoints();
  // Добавить теги к каждой точке
  return anchorPoints.map((p, index) => {
    const keyShape =
      group.get('item').getKeyShape() ||
      group.findByClassName(SHAPE_CLASSNAME_KEYSHAPE);
    const width = keyShape.attr('width') || keyShape.attr('r') * 2;
    const height = keyShape.attr('height') || keyShape.attr('r') * 2;
    const rectX = keyShape.attr('x') || 0;
    const rectY = keyShape.attr('y') || 0;
    const [x, y] = [p[0], p[1]];
    let hotspot;
    const attrs = {
      flowNode: { x: rectX + width * x, y: rectY + height * y },
      startNode: { x: width * x - width / 2, y: height * y - height / 2 },
      endNode: { x: width * x - width / 2, y: height * y - height / 2 },
      'biz-flow-node': {
        x: width * x + keyShape.attr('x'),
        y: height * y + keyShape.attr('y'),
      },
    };
    const shape = group.addShape('marker', {
      className: SHPAE_CLASSNAME_ANCHOR,
      attrs: {
        symbol: 'circle',
        ...anchorPointStyle,
        ...attrs[model.shape || 'flowNode'],
      },
      index,
      zIndex: zIndex.anchorPoint,
    });
    shape.showHotspot = () => {
      hotspot = group.addShape('marker', {
        className: SHPAE_CLASSNAME_ANCHOR,
        attrs: {
          symbol: 'circle',
          ...anchorHotsoptStyle,
          ...attrs[model.shape || 'flowNode'],
        },
        zIndex: zIndex.anchorHotsopt,
      });

      // Пусть горячая точка появится на верхнем слое
      hotspot.toFront();
      shape.toFront();
    };
    shape.setActived = () => shape.attr(anchorPointHoverStyle);

    shape.clearActived = () => shape.attr(anchorPointStyle);

    shape.setHotspotActived = bool => {
      if (hotspot) {
        if (bool) hotspot.attr(anchorHotsoptActivedStyle);
        else hotspot.attr(anchorHotsoptStyle);
      }
    };
    return shape;
  });
}

export { drawAnchor, handleAnchor };
