import { makeid } from './helpers.mjs'

const ariaowners = function (node, c) {
    if (node.hasAttribute('data-semantic-children')) {
        let ids = node.getAttribute('data-semantic-children').split(/,/);
        node.setAttribute('aria-owns', ids.map(n => makeid(c, n)).join(' '));
    }
}

const setid = function (node, c) {
    if (node.hasAttribute('data-semantic-id')) {
        node.id = makeid(c, node.getAttribute('data-semantic-id'));
    }
}

const speechers = function (node) {
  if (node.hasAttribute('data-semantic-speech')) {
    node.setAttribute('aria-label', node.getAttribute('data-semantic-speech'));
  }
}


/**
 * Rewrites the DOM node.
 * @param {Node} node The DOM node to rewrite.
 * @param {number} c The counter that helps to disambiguate the semantic node ids.
 */
export function rewriteNode (node, c) {
  if (node.nodeType === 3) {
    if (node.parentNode.closest('svg')) return;
    // if (node.textContent.trim() === '') return;
    let span = document.createElement('span');
    let parent = node.parentNode;
    span.appendChild(node);
    span.setAttribute('aria-hidden', true);
    parent.appendChild(span);
    return;
  }
  node.removeAttribute('aria-hidden');
  ariaowners(node, c);
  setid(node, c);
  speechers(node);
  for (const child of node.childNodes) {
    rewriteNode(child, c);
  }
};


