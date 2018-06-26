// Copyright 2018 by the authors (see AUTHORS.txt)

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
    if (node.parentNode.closest('svg')) return;
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
    chromify.rewriteNode(node, c);
    chromify.attachNavigator(node, c);
    c++;
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
  let skeleton = node.getAttribute('data-semantic-structure');
  let replaced = skeleton.replace(/\(/g,'[').replace(/\)/g,']').replace(/ /g,',');
  let linearization = JSON.parse(replaced);
  let navigationStructure = chromify.makeTree(linearization, count);
  chromify.navigators[node.id] = new tree(navigationStructure);
  document.addEventListener('keydown',function(event){
    let navigator = chromify.navigators[event.target.id];
    chromify.unhighlight(navigator.active);
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
    default:
      break;
    }
    chromify.highlight(navigator.active);
    node.setAttribute('aria-activedescendant', navigator.active.name);
  });
};

chromify.attach = function() {
  let nodes = document.querySelectorAll('[data-semantic-structure]');
  chromify.rewriteExpression(nodes);
};


chromify.makeTree = function(list, count) {
  if (!list.length) return;
  let parent = new node(list[0], chromify.makeid(count, list[0]));
  for (let i = 1, child; i < list.length; i++) {
    let child = list[i];
    let newnode = Array.isArray(child) ? chromify.makeTree(child, count) :
        new node(child, chromify.makeid(count, child));
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


chromify.highlight = function(node) {
  chromify.background(node, 'lightblue');
};

chromify.unhighlight = function(node) {
  chromify.background(node, '');
};


chromify.background = function(node, color) {
  let domNode = document.getElementById(node.name);
  if (domNode.closest('svg')) domNode.setAttribute('class', color);
  else domNode.style = 'color:' + color;
};
