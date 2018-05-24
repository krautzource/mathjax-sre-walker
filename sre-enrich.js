
const sre =   require('speech-rule-engine');
sre.setupEngine({
  domain: 'mathspeak',
  style: 'default',
  locale: 'en',
  speech: 'deep'
  });
  const mj = require('mathjax-node').typeset;

const main = async (input) => {
  let format = 'MathML'
  if (input.trim[0] !== '<') format = 'TeX';
  const mjout = await mj({
    math: input,
    format: format,
    mml: true
  });
  const enriched = sre.toEnriched(mjout.mml);
  // console.log(enriched.toString())
  sre.engineReady()
  const mmlpretty = sre.pprintXML(enriched.toString());
  ;
  // console.log(sre.pprintXML(enriched.toString()).replace(/ data-semantic-(.*?)data-semantic-speech/g,' data-semantic-speech'))
  const out = await mj({
    math: enriched,
    format: 'MathML',
    html: true,
    css: true
  });
  console.log(
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>output</title>
        <style>
        ${out.css}
        </style>
    </head>
    <body>
    ${out.html}
    <script src="chromify.js"></script>
    </body>
    </html>
    `
    // <div hidden>
    // ${mmlpretty}
    // </div>
    );
}

let restart = function() {
  if (!sre.engineReady()) {
    setTimeout(restart, 200);
    return;
  }
  main(process.argv[2]);
}

restart();

// const mml = `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
//   <mi>P</mi>
//   <mo stretchy="false">(</mo>
//   <mi>E</mi>
//   <mo stretchy="false">)</mo>
//   <mo>=</mo>
//   <mrow class="MJX-TeXAtom-ORD">
//     <mrow>
//       <mrow class="MJX-TeXAtom-OPEN">
//         <mo maxsize="2.047em" minsize="2.047em">(</mo>
//       </mrow>
//       <mfrac linethickness="0">
//         <mi>n</mi>
//         <mi>k</mi>
//       </mfrac>
//       <mrow class="MJX-TeXAtom-CLOSE">
//         <mo maxsize="2.047em" minsize="2.047em">)</mo>
//       </mrow>
//     </mrow>
//   </mrow>
//   <msup>
//     <mi>p</mi>
//     <mi>k</mi>
//   </msup>
//   <mo stretchy="false">(</mo>
//   <mn>1</mn>
//   <mo>&#x2212;<!-- − --></mo>
//   <mi>p</mi>
//   <msup>
//     <mo stretchy="false">)</mo>
//     <mrow class="MJX-TeXAtom-ORD">
//       <mi>n</mi>
//       <mo>&#x2212;<!-- − --></mo>
//       <mi>k</mi>
//     </mrow>
//   </msup>
// </math>
// `
