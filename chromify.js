// rendered CommonHTML with SRE annotation
// data-semantic-children =>  aria-owns
// -speech => aria-label
// non-empty text-node => div.inline around it with aria-hidden=true

let ariaowners = function(node, c) {
    if (node.hasAttribute('data-semantic-children')) {
        let ids = node.getAttribute('data-semantic-children').split(/,/);
        node.setAttribute('aria-owns', ids.map(n => makeid(c, n)).join(' '));
    }
}

let makeid = function(c, i) {
    return 'MJX' + c + '-' + i;
}

let setid = function(node, c) {
    if (node.hasAttribute('data-semantic-id')) {
        node.id = makeid(c, node.getAttribute('data-semantic-id'));
    }
}

let speechers = function(node) {
    if (node.hasAttribute('data-semantic-speech')) {
        node.setAttribute('aria-label', node.getAttribute('data-semantic-speech'));
    }
}

let rewrite = function(node, c) {
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
    ariaowners(node, c);
    setid(node, c);
    speechers(node);
    for (const child of node.childNodes) {
        rewrite(child, c);
    }
}

let rewriteCHTML = function (nodes) {
    let c = 0;
    for (const node of nodes) {
        rewrite(node, c++);
    }
}

rewriteCHTML(document.querySelectorAll('.mjx-chtml'));


const attachNavigator = function(node){
    node.setAttribute('tabindex', '0');
}
