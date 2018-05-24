let id = 0;

// rendered CommonHTML with SRE annotation
// data-semantic-children =>  aria-owns
// -speech => aria-label
// non-empty text-node => div.inline around it with aria-hidden=true

let ariaowners = function(node) {
    if (node.hasAttribute('data-semantic-children')) {
        node.setAttribute('aria-owns', node.getAttribute('data-semantic-children').replace(/,/g,' '));
    }
}

let makeid = function(node) {
    if (node.hasAttribute('data-semantic-id')) {
        node.id = node.getAttribute('data-semantic-id');
    }
}

let speechers = function(node) {
    if (node.hasAttribute('data-semantic-speech')) {
        node.setAttribute('aria-label', node.getAttribute('data-semantic-speech'));
    }
}

let rewrite = function(node) {
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
    ariaowners(node);
    makeid(node);
    speechers(node);
    for (let i = 0, child; child = node.childNodes[i]; i++) {

        rewrite(child);
    }
}
rewrite(document.querySelector('span'))


const attachNavigator = function(node){
    node.setAttribute('tabindex', '0');
}
