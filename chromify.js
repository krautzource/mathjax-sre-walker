const chromify = {};

let id = 0;

// rendered CommonHTML with SRE annotation
// data-semantic-children =>  aria-owns
// -speech => aria-label
// non-empty text-node => div.inline around it with aria-hidden=true

chromify.ariaowners = function(node) {
  if (node.hasAttribute('data-semantic-children')) {
    node.setAttribute('aria-owns', node.getAttribute('data-semantic-children').replace(/,/g,' '));
  }
}

chromify.makeid = function(node) {
  if (node.hasAttribute('data-semantic-id')) {
    node.id = node.getAttribute('data-semantic-id');
  }
}

chromify.speechers = function(node) {
  if (node.hasAttribute('data-semantic-speech')) {
    node.setAttribute('aria-label', node.getAttribute('data-semantic-speech'));
  }
}

chromify.rewrite = function(node) {
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
  chromify.ariaowners(node);
  chromify.makeid(node);
  chromify.speechers(node);
  for (let i = 0, child; child = node.childNodes[i]; i++) {

    chromify.rewrite(child);
  }
}

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
    switch(event.keyCode){
    case 37: //left
    case 38: //up
    case 39: //right
    case 40: //down
      node.setAttribute('aria-activedescendant', node.getAttribute('aria-owns'));
      break;
    }
  });
};

chromify.attach = function() {
  let node = document.querySelector('span');
  chromify.rewrite(node);
  chromify.attachNavigator(node.firstChild);
};
