const fs = require('fs');
const sre = require('speech-rule-engine');
sre.setupEngine({
  domain: 'mathspeak',
  style: 'default',
  locale: 'en',
  speech: 'deep',
  structure: true,
  mode: 'sync'
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
  const mmlpretty = sre.pprintXML(enriched.toString());
  const out = await mj({
    math: enriched,
    format: 'MathML',
    html: true,
    css: true,
    mml: true,
    svg: true,
    svgNode: true
  });
  fs.writeFileSync(
    'index.html',
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>MathJax-SRE-walker</title>
        <link rel="stylesheet" href="mj.css">
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
    <h1>A lightweight walker for equation layout</h1>
    <p>For development, this demo requires a browser with support for ES6 modules. Try current Firefox, e.g., with NVDA or JAWS.</p>
    <p><strong>Try this</strong>: focus an equation (click on it or tab to it), then use the arrow keys. If you're using a screenreader, use browse mode until you hear an equation, then switch out of virtual/browse mode to explore with arrow keys. Depending on the screenreader you may have to move the focus to the equation.</p>
    <h2>CSS layout</h2>
    <p>The solution to the quadratic equation</p>
    ${out.html.replace(/ aria-hidden="true"/g, '')}
    <p>is really overused as an example.</p>
    <h2>SVG layout</h2>
    <p>The solution to the quadratic equation</p>
    <span class="mjx-svg__block">
    ${out.svg
      .replace(
        /<title id="MathJax-SVG-1-Title">(.*)?<\/title>/,
        '<title id="MathJax-SVG-1-Title">' +
          out.svgNode.getAttribute('data-semantic-speech') +
          '</title>'
      )
      .replace(/focusable="false"/s, 'focusable="true"')
      .replace(/ aria-hidden="true"/g, '')}
    </span>
    <p>is really overused as an example.</p>
    <h2>A non-equation</h2>
    <p>The same method works for other complex content as well.</p>
    <figure>
    ${ fs.readFileSync('image.svg')}
        <figcaption><a href="https://commons.wikimedia.org/wiki/File:House.svg">barretr (Open Clip Art Library) [CC0], via Wikimedia Commons</a></figcaption>
        </figure>
    <script type="module" src="main.js"></script>
    </body>
    </html>

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
