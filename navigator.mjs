import {makeTree, tree} from './tree.mjs';
/**
 * Attaches a navigator to the DOM node.
 * @param {Node} node The target node.
 * @param {number} count The counter that helps to disambiguate the semantic
 *     node ids.
 */
export function attachNavigator(node, tree) {
  new navigator(node, tree);
}

class navigator {
  constructor(node, tree) {
    this.node = node;
    this.tree = tree;
    this.node.addEventListener('keydown', this.move.bind(this));
  }

  active() {
    return this.tree.active;
  }

  move(event) {
    this.unhighlight();
    switch (event.keyCode) {
      case 37: //left
        this.tree.left();
        break;
      case 38: //up
        this.tree.up();
        break;
      case 39: //right
        this.tree.right();
        break;
      case 40: //down
        this.tree.down();
        break;
      default:
        break;
    }
    this.highlight();
    this.node.setAttribute('aria-activedescendant', this.active().name);
  }

  highlight() {
    background(this.active(), 'lightblue');
  }

  unhighlight() {
    background(this.active(), '');
  }
}

const background = function(node, color) {
  let domNode = document.getElementById(node.name);
  if (domNode.closest('svg')) domNode.setAttribute('class', color);
  else domNode.style = 'color:' + color;
};
