// START OLD rewritenode.mjs
const speechers = function(node) {
  if (node.hasAttribute('data-semantic-speech')) {
    let speech = '';
    if (node.getAttribute('data-semantic-prefix')) speech += node.getAttribute('data-semantic-prefix') + ' ';
    speech += node.getAttribute('data-semantic-speech');
    node.setAttribute('aria-label', speech);
    if (node.hasAttribute('role') || node.tagName === 'A' || node.tagName === 'IMAGE') return;
    node.setAttribute('role', 'treeitem');
  } else {
    node.setAttribute('role', 'presentation');
  }
};

/**
 * Rewrites the DOM node.
 * @param {Node} node The DOM node to rewrite.
 * @param {tree} tree The semantic tree structure.
 */
function rewriteNode(node, tree) {
  rewriteNodeRec(node, tree.root);
}

/**
 * Rewrites the DOM node to reflect semantic ids and aria-owns children.
 * @param {Node} node The DOM node to rewrite.
 * @param {node} snode The semantic node id object.
 */
function rewriteNodeRec(node, snode) {
  let domNode =
    node.getAttribute('data-semantic-id') == snode.id
      ? node
      : node.querySelector(`[data-semantic-id="${snode.id}"]`);
  domNode.setAttribute('id', snode.name);
  speechers(domNode);
  let owned = snode.children.map(n => n.name);
  if (owned.length) {
    domNode.setAttribute('aria-owns', owned.join(' '));
    snode.children.forEach(x => rewriteNodeRec(node, x));
  }
}

// END OLD rewritenode.mjs

// START OLD tree.mjs

function makeid(c, i) {
  return 'MJX' + c + '-' + i;
}

/**
 * The basic tree for the light walker.
 */

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
  constructor(root, offset) {
    this.root = root;
    this.active = root;
    this.offset = offset;
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

// END OLD tree.mjs

// START OLD main.mjs (modified)

/**
 * Generates tree structure from skeleton
 * @param {Node} node The target node.
 * @param {number} count The counter that helps to disambiguate the semantic
 *     node ids.
 */
const rewriteSkeleton = function(node, count) {
  let skeleton = node.getAttribute('data-semantic-structure');
  let replaced = skeleton
    .replace(/\(/g, '[')
    .replace(/\)/g, ']')
    .replace(/ /g, ',');
  let linearization = JSON.parse(replaced);
  let navigationStructure = makeTree(linearization, count);
  return new tree(navigationStructure, count);
};

const moveAttribute = (oldnode, newnode, attribute) => {
  if (!oldnode || !newnode || oldnode === newnode) return;
  const value = oldnode.getAttribute(attribute);
  if (!value) return;
  newnode.setAttribute(attribute, value);
  oldnode.removeAttribute(attribute);
};

const crypto = require('crypto');

const rewrite = node => {
  const skeletonNode = node.querySelector('[data-semantic-structure]');
  const hash = crypto.createHash('md5').update(node.outerHTML).digest("hex");
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'tree');
  node.setAttribute('data-treewalker', '');
  let tree = rewriteSkeleton(skeletonNode, hash);
  rewriteNode(skeletonNode, tree);
  skeletonNode.querySelectorAll('*').forEach(child => {
    if (!child.getAttribute('role')) child.setAttribute('role', 'presentation');
  });
  // HACK cf. #39
  const svg = skeletonNode.closest('svg');
  ['aria-owns', 'aria-label', 'role', 'tabindex', 'data-treewalker'].forEach(
    moveAttribute.bind(null, skeletonNode, svg)
  );
  return node;
};

module.exports = rewrite;
