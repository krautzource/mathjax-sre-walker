
const chromify = {};

chromify.ariaowners = function (node, c) {
    if (node.hasAttribute('data-semantic-children')) {
        let ids = node.getAttribute('data-semantic-children').split(/,/);
        node.setAttribute('aria-owns', ids.map(n => chromify.makeid(c, n)).join(' '));
    }
}

chromify.makeid = function (c, i) {
    return 'MJX' + c + '-' + i;
}

chromify.setid = function (node, c) {
    if (node.hasAttribute('data-semantic-id')) {
        node.id = chromify.makeid(c, node.getAttribute('data-semantic-id'));
    }
}

chromify.speechers = function (node) {
  if (node.hasAttribute('data-semantic-speech')) {
    node.setAttribute('aria-label', node.getAttribute('data-semantic-speech'));
  }
}

chromify.nodetree = function (node, c) {
    if (node.hasAttribute('data-semantic-collapsed')) {
        const list = node.getAttribute('data-semantic-collapsed');
        const ids = list.replace(/\d+/g, (n => chromify.makeid(c, n)));
        node.setAttribute('data-semantic-collapsed', ids);
    }
}

chromify.rewriteNode = function (node, c) {
  if (node.nodeType === 3) {
    // if (node.textContent.trim() === '') return;
    let div = document.createElement('div');
    let parent = node.parentNode;
    div.setAttribute('style','display:inline');
    div.appendChild(node);
    div.setAttribute('aria-hidden', true);
    parent.appendChild(div);
    return;
  }
  node.removeAttribute('aria-hidden');
  chromify.ariaowners(node, c);
  chromify.setid(node, c);
  chromify.speechers(node);
  // chromify.nodetree(node, c);
  for (const child of node.childNodes) {
    chromify.rewriteNode(child, c);
  }
};


chromify.rewriteExpression = function (nodes) {
  let c = 0;
  for (const node of nodes) {
    chromify.rewriteNode(node, c++);
    chromify.attachNavigator(node.firstChild, c);
  }
};

/**
 * Key codes.
 * @enum {number}
 */
chromify.KeyCode = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,    // also NUM_NORTH_EAST
  PAGE_DOWN: 34,  // also NUM_SOUTH_EAST
  END: 35,        // also NUM_SOUTH_WEST
  HOME: 36,       // also NUM_NORTH_WEST
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  TAB: 9
};

chromify.navigators = {};

chromify.attachNavigator = function(node, count) {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'group');
  let skeleton = node.getAttribute('data-semantic-collapsed');
  let replaced = skeleton.replace(/\(/g,'[').replace(/\)/g,']').replace(/ /g,',');
  let linearization = JSON.parse(replaced);
  let navigationStructure = chromify.makeTree(linearization, count);
  chromify.navigators[node.id] = new tree(navigationStructure);
  document.addEventListener('keydown',function(event){
    let navigator = chromify.navigators[event.target.id];
    console.log('Before'); 
   console.log(navigator);
    switch(event.keyCode){
    case 37: //left
      navigator.left();
      break;
    case 38: //up
      navigator.up();
      break;
    case 39: //right
      navigator.right();
      break;
    case 40: //down
      navigator.down();
      break;
    }
    console.log('After');
    console.log(navigator);
    node.setAttribute('aria-activedescendant', navigator.active.name);
  });
};

chromify.attach = function() {
  let nodes = document.querySelectorAll('.mjx-chtml');
  chromify.rewriteExpression(nodes);
  // chromify.attachNavigator(nodes[0].firstChild);
};


chromify.makeTree = function(list, count) {
  console.log(count);
  if (!list.length) return;
  let parent = new node(list[0], chromify.makeid(count, list[0]));
  for (let i = 1, child; i < list.length; i++) {
    let child = list[i];
    let node = Array.isArray(child) ? chromify.makeTree(child, count) :
        new node(child, chromify.makeid(count, child));
    child.parent = parent;
    parent.children.push(child);
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
