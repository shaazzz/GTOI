import path from "path";
import { projectRoot } from "./rootAddress.mjs";
import glob from "glob";
import YAML from "yaml";
import fs from "fs";
import { promisify } from "util";
import Markdown from "markdown-it";

const markdown = new Markdown()
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);

process.on('unhandledRejection', up => { throw up; });

const getDirectories = (src) => {
  return new Promise(res=>{
    glob(src + '/**/*.yaml', (err, ans) => res(ans));
  });
};

const idCmp = ({ id: id1 }, { id: id2 }) => {
  const s1 = id1.split('.');
  const s2 = id2.split('.');
  for (let i = 0; i < s1.length; i++) {
    if (s1[i] != s2[i]) {
      return s1[i]-s2[i];
    }
  }
  return 0;
};

const md = (txt) => {
  if (!txt) return '';
  return markdown.render(txt);
};

const getParent = (id) => {
  const idsplit = id.split('.');
  return idsplit.slice(0, -1).join('.');
};

const backlink = (id) => {
  if (id === '') {
    return `<h1>برگرد به <a href="index.html">فهرست اصلی</a></h1>`;
  }
  return `<h1>برگرد به <a href="${id}.html">بخش ${id}</a></h1>`;
};

const mainTemplate = (body, { bookLink = '/' }) => `
<html>
  <head>
  <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
  <meta content="utf-8" http-equiv="encoding">
  <style>
    .hidden {display: none;}
  </style>
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']]
      }
    };
    if (!window.localStorage.getItem('solvedProblems')) {
      window.localStorage.setItem('solvedProblems', '[]');
    }
    let styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
    const reloadColor = () => {
      document.head.removeChild(styleEl);
      styleEl = document.createElement('style');
      document.head.appendChild(styleEl);
      const sp = JSON.parse(window.localStorage.getItem('solvedProblems'));
      sp.forEach((x)=>{
        styleEl.sheet.insertRule("#d"+x+"{background:#efe;}")
      });
    };
    reloadColor();
    const swapButton = (id) => {
      const dx = document.getElementById('b'+id);
      const sp = JSON.parse(window.localStorage.getItem('solvedProblems'));
      if ( sp.find( (x) => x === id ) ) {
        window.localStorage.setItem('solvedProblems', JSON.stringify(
          sp.filter( (x)=>x!==id )
        ));
        dx.innerText = 'حل کردم';
      } else {
        sp.push(id);
        window.localStorage.setItem('solvedProblems', JSON.stringify(sp) ); 
        dx.innerText = 'حل نکردم';
      }
      reloadColor();
    };
  </script>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <link rel="stylesheet" href="/_static/problems.css">
  <link rel="stylesheet" type="text/css" href="/_static/font-awesome.min.css">
  </head>
  <body style="direction:rtl;">
    <div class="container-fluid">
    <div id="body-top">
      <a><i class="fa fa-folder-o"></i>&nbsp; فهرست اصلی</a>
      <a style="float: left; padding-right: 20px;" href="${bookLink}" id="problems-link"><i class="fa fa-book"></i>&nbsp; درس‌نامه</a>    
    </div>
    <div id="page-body" style="max-width:800px;">
      ${body}
    </div></div>
    <script>
      JSON.parse(window.localStorage.getItem('solvedProblems')).forEach((e)=>{
        const k = document.getElementById('b'+e);
        if (!k) return;
        k.innerText = 'حل نکردم';
      });
    </script>
  </body>
</html>`;

const problemTemplate = ({ data, id, parent }) => {
  const bookLink = `/book/${id.split('.').slice(0, -1).join('/')}`;
  if (id.slice(-5) === 'extra') {
    const x = id.slice(0,-6);
    return mainTemplate(`<h1>مسائل بیشتر <a href="${x}.html">بخش ${x}</a></h1><ul>${data.map(
      ({ name, link })=>`<li><a href=${link}>${name}</a></li>`
    ).join('')}</ul>`, { bookLink });
  }
  const solFosh = `
هرگز سوالات را نسوزانید. سوزاندن سوالات نه تنها مفید نیست، بلکه ذهن شما را تنبل
می کند و مضر است. اگر فکر می کنید که سوال به چیزی نیاز دارد که بلد نیستید، خواندن پاسخ سوال راه
خوبی برای یادگیری نیست. از افراد مطلع بپرسید که آیا چیزی هست که بلد نباشید و
آن چیز را از آن ها یاد بگیرید و سپس دوباره به سوال برگردید. اگر این توضیحات
شما را به راه راست هدایت کرد، سریعا دکمه پنهان کردن را بزنید تا سوال برای شما
سوزانده نشود.
  `.replace(/\n/g, ' ');
  const sol = data.solution ? `
  <h1>جواب: <button id="bsolution" onclick="toggle('solution','${solFosh}')">نمایش</button></h1>
  <div id="solution" class="hidden">
    ${md(data.solution)}
  </div>` : '';
  const hint = data.hint ? `
  <h1>راهنمایی: <button id="bhint" onclick="toggle('hint')">نمایش</button></h1>
  <div id="hint" class="hidden">
    ${md(data.hint)}
  </div>
  ` : '';
  const idx = id.replace(/\./g, 'x');
  const cat = data.cat ? `(${data.cat})` : '';
  const manba = data.source ? `<p>منبع: ${data.source}</p>` : '';
  return mainTemplate(`
<h1>سوال ${id} ${cat}: <button id="b${idx}" onclick="swapButton('${idx}')">حل کردم</button></h1>
${manba}
${md(data.text)}
<script>
  const toggle = (id, txt) => {
    const b = document.getElementById('b'+id);
    const isSolved = window.getComputedStyle(document.body, null).getPropertyValue('background-color') === 'rgb(238, 255, 238)';
    if (b.innerText === 'نمایش') {
      if (txt && !isSolved) alert(txt);
      b.innerText = 'پنهان کردن';
    } else {
      b.innerText = 'نمایش';
    }
    document.getElementById(id).classList.toggle('hidden');
  };
</script>
${hint}
${sol}
<div>
  <a href="https://github.com/shaazzz/GTOI/blob/master/problems/${id.replace(/\./g, '/')}.yaml">
    ویرایش و بهبود در گیت هاب
  </a>
</div>
${backlink(parent)}
<script>
document.body.id = "d${idx}";
</script>
`, { bookLink });
};

const countElem = ({ count, countCode }) => `<p>در این قسمت ${
  [{ t: count, k: 'سوال' }, { t: countCode, k: 'پیوند به سوال بیرونی' }]
    .filter((x) => x.t !== 0).map((x) => `${x.t} ${x.k}`).join(' و ')
} وجود دارد`;

const problemInIndex1Template = ({ id, data }) => {
  if (id.slice(-5) === 'extra') {
    return `<h1><a href="${id}.html">مسائل بیشتر...</a></h1>`;
  }
  const cat = data.cat ? `(${data.cat})` : '';
  const manba = data.source ? `<p>منبع: ${data.source}</p>` : '';
  const idx = id.replace(/\./g, 'x');
  return `
<div id="d${idx}">
  <h2>سوال <a href="${id}.html">${id}</a> ${cat} <button id="b${idx}" onclick="swapButton('${idx}')">حل کردم</button> </h2>
  ${manba}
  ${md(data.text)}
</div>
`;
};

const index1Template = ({ id, children: { nodes, count, countCode }, parent }) => mainTemplate(`
<h1>بخش ${id}</h1>
${countElem({ countCode, count })}
${nodes.sort(idCmp).map(problemInIndex1Template).join('')}
${backlink(parent)}
`, { bookLink: `/book/${id.split('.').join('/')}`});

const problemInIndexTemplate = ({ id }) => `
<li>
  <h2>بخش <a href="${id}.html">${id}</a></h2>
</li>
`;

const indexTemplate = ({ id, children: { nodes, count, countCode }, parent }) => {
  const c = nodes.sort(idCmp).map(problemInIndexTemplate).join('');
  if (id === '') return mainTemplate(`<h1>فهرست اصلی</h1>${
    countElem({ count, countCode })
  }<ul>${c}</ul>`, {});
  return mainTemplate(`
  <h1>بخش ${id}</h1>
  ${countElem({ count, countCode })}
  <ul>${c}</ul>
  ${backlink(parent)}
  `, { bookLink: `/book/${id.split('.').join('/')}`});
};

const generateHtmls = (q) => {
  let head = 0;
  const children = {};
  const htmls = [];
  while (head !== q.length) {
    const { id, type, data } = q[head];
    head += 1;
    let mc = { count: 0, countCode: 0 };
    if (children[id]) {
      mc = children[id];
    } else {
      if (id.slice(-5) !== 'extra') {
        mc = { count: 1, countCode: 0 };
      } else {
        mc = { count: 0, countCode: data.length };
      }
    }
    const parent = getParent(id);
    if (id !== '') {
      const me = {id, type, data};
      if (children[parent] === undefined) {
        children[parent] = {
          nodes: [me],
          count: mc.count,
          countCode: mc.countCode,
        };
        const ptype = type === 'problem' ? 'index1' : 'index';
        q.push({
          id: parent,
          type: ptype,
        });
      }
      else {
        children[parent].nodes.push(me);
        children[parent].count += mc.count;
        children[parent].countCode += mc.countCode;
      }
    }
    if (type === 'problem') {
      htmls.push({
        id,
        html: problemTemplate({ data, id, parent }),
      });
    }
    else if (type === 'index1') {
      htmls.push({
        id,
        html: index1Template({ id, children: children[id], parent })
      });
    }
    else {
      htmls.push({
        id,
        html: indexTemplate({ id, children: children[id], parent })
      });
    }
  }
  return htmls;
};

const main = async () => {
  const ppath = path.join(projectRoot, 'problems');
  const bpath = path.join(ppath, '_build');
  await rmdir(bpath, { recursive: true });
  const problems = await Promise.all(
    (await getDirectories(ppath)).map(
      async (adr) => ({
        type: 'problem',
        address: adr,
        id: adr.substr(ppath.length+1).replace(/\//g,'.').replace('.yaml', ''),
        data: YAML.parse((await readFile(adr)).toString()),
      })
    )
  );
  const htmls = generateHtmls(problems);
  await mkdir(bpath);
  const idToUrl = (id) => {
    if (id === '') return 'index.html';
    return id+'.html';
  }
  await Promise.all(htmls.map(async ({ id, html }) => {
    await writeFile(path.join(bpath, idToUrl(id)), html);
  }));
};

main();
