const fs = require('fs');
const sre = require('speech-rule-engine');
sre.setupEngine({
  domain: 'mathspeak',
  style: 'default',
  locale: 'en',
  speech: 'deep',
  structure: true,
  mode: "sync"
});
sre.engineReady();
const mj = require('mathjax-node').typeset;

const main = async input => {
  let format = 'MathML';
  if (input.trim[0] !== '<') format = 'TeX';
  const mjout = await mj({
    math: input,
    format: format,
    mml: true
  });
  const enriched = sre.toEnriched(mjout.mml);
  // console.log(enriched.toString())
  const mmlpretty = sre.pprintXML(enriched.toString());
  // console.log(sre.pprintXML(enriched.toString()).replace(/ data-semantic-(.*?)data-semantic-speech/g,' data-semantic-speech'))
  const out = await mj({
    math: enriched,
    format: 'MathML',
    html: true,
    css: true,
    mml: true,
    svgNode: true
  });
  fs.writeFileSync('index.html',
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>output</title>
        <style>
        .lightblue * { fill: lightblue}
        ${out.css || ''}
        </style>
    </head>
    <body>
    <p>The solution to the quadratic equation</p>
    ${out.html}
    ${out.svg.replace(/<title id="MathJax-SVG-1-Title">(.*)?<\/title>/, '<title id="MathJax-SVG-1-Title">' + out.svgNode.getAttribute('data-semantic-speech') + '</title>')}
    <p>is really overused as an example.</p>
    <script type="module" src="main.js"></script>
    </body>
    </html>
    <div hidden>
    ${mmlpretty}
    </div>
    `
  );
};

let restart = function() {
  if (!sre.engineReady()) {
    setTimeout(restart, 200);
    return;
  }
  if (!process.argv[2]) {
    console.log('No input as CLI argument; using default');
  }
  main(process.argv[2] || 'x={-b\\pm\\sqrt{b^2-4ac}\\over2a}');
};

restart();
