import {makeid} from './helpers.mjs'
/**
 * Attaches a navigator to the DOM node.
 * @param {Node} node The target node.
 * @param {number} c The counter that helps to disambiguate the semantic node
 *     ids.
 */
export function attachNavigator(node, count) {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'group');
  let skeleton = node.getAttribute('data-semantic-structure');
  let replaced = skeleton
    .replace(/\(/g, '[')
    .replace(/\)/g, ']')
    .replace(/ /g, ',');
  let linearization = JSON.parse(replaced);
  let navigationStructure = makeTree(linearization, count);
  new navigator(node, new tree(navigationStructure));
}

const makeTree = function(sexp, count) {
  if (!Array.isArray(sexp)) {
    return new node(sexp, makeid(count, sexp));
  }
  let parent = new node(sexp[0], makeid(count, sexp[0]));
  for (let i = 1, child; i < sexp.length; i++) {
    let child = sexp[i];
    let newnode = makeTree(child, count);
    newnode.parent = parent;
    parent.children.push(newnode);
  }
  return parent;
};

class node {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.parent = null;
    this.children = [];
  }
}

class tree {
  constructor(root) {
    this.root = root;
    this.active = root;
  }

  up() {
    if (this.active.parent) {
      this.active = this.active.parent;
    }
  }

  down() {
    if (this.active.children.length) {
      this.active = this.active.children[0];
    }
  }

  left() {
    if (this.active.parent) {
      let index = this.active.parent.children.indexOf(this.active);
      if (index > 0) {
        this.active = this.active.parent.children[index - 1];
      }
    }
  }

  right() {
    if (this.active.parent) {
      let index = this.active.parent.children.indexOf(this.active);
      if (index < this.active.parent.children.length - 1) {
        this.active = this.active.parent.children[index + 1];
      }
    }
  }
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
