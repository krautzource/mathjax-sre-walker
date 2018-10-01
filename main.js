import {rewriteNode} from './rewritenode.mjs';
import {attachNavigator}  from './navigator.mjs';

document.querySelectorAll('[data-semantic-structure]').forEach((node, index)=>{
    rewriteNode(node, index);
    attachNavigator(node, index);
})
