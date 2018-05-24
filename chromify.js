
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
        div.setAttribute('style','display:inline')
        div.appendChild(node);
        div.setAttribute('aria-hidden', true);
        parent.appendChild(div);
        return;
    }
    node.removeAttribute('aria-hidden');
    chromify.ariaowners(node, c);
    chromify.setid(node, c);
    chromify.speechers(node);
    chromify.nodetree(node, c);
    for (const child of node.childNodes) {
        chromify.rewriteNode(child, c);
    }
};


chromify.rewriteExpression = function (nodes) {
    let c = 0;
    for (const node of nodes) {
        chromify.rewriteNode(node, c++);
        chromify.attachNavigator(node.firstChild);
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

chromify.attachNavigator = function(node) {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'group');
  document.addEventListener('keydown',function(event){
    let linearization = node.getAttribute('data-semantic-children').split(',');
    this.current = this.current == undefined ? 0 : this.current;
    let next = this.current;
    switch(event.keyCode){
    case 37: //left
      next -= 1;
      break;
    case 38: //up
      break;
    case 39: //right
      next += 1;
      break;
    case 40: //down
      break;
    }
    if (next >= 0 && next < linearization.length) {
      node.setAttribute('aria-activedescendant', linearization[next]);
      this.current = next;
    }
  });
};

chromify.attach = function() {
  let nodes = document.querySelectorAll('.mjx-chtml');
  chromify.rewriteExpression(nodes);
};
