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

const md = (txt) => markdown.render(txt);

const getParent = (id) => {
  const idsplit = id.split('.');
  return idsplit.slice(0, -1).join('.');
};

const mainTemplate = (body) => `
<html>
  <head>
  <meta content="text/html;charset=utf-8" http-equiv="Content-Type">
  <meta content="utf-8" http-equiv="encoding">
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  </head>
  <body style="direction:rtl;">${body}</body>
</html>`;

const problemTemplate = ({ text, solution, id }) => mainTemplate(`
<h1>سوال ${id}:</h1>
${md(text)}
<h1>جواب:</h1>
${md(solution)}
`);

const problemInIndex1Template = ({ id, data: { text }}) => `
<div>
  <h2>سوال <a href="${id}.html">${id}</a></h2>
  ${md(text)}
</div>
`;

const index1Template = ({ id, children }) => mainTemplate(`
<h1>بخش ${id}</h1>
${children.map(problemInIndex1Template).join()}
`);

const problemInIndexTemplate = ({ id }) => `
<li>
  <h2>بخش <a href="${id}.html">${id}</a></h2>
</li>
`;

const indexTemplate = ({ id, children }) => mainTemplate(`
<h1>بخش ${id}</h1>
<ul>
${children.map(problemInIndexTemplate).join()}
</ul>
`);

const generateHtmls = (q) => {
  let head = 0;
  const children = {};
  const htmls = [];
  while (head !== q.length) {
    const { id, type, data } = q[head];
    head += 1;
    if (id !== '') {
      const parent = getParent(id);
      const me = {id, type, data};
      if (children[parent] === undefined) {
        children[parent] = [me];
        const ptype = type === 'problem' ? 'index1' : 'index';
        q.push({
          id: parent,
          type: ptype,
        });
      }
      else {
        children[parent].push(me);
      }
    }
    if (type === 'problem') {
      htmls.push({
        id,
        html: problemTemplate({ ...data, id }),
      });
    }
    else if (type === 'index1') {
      htmls.push({
        id,
        html: index1Template({ id, children: children[id] })
      });
    }
    else {
      htmls.push({
        id,
        html: indexTemplate({ id, children: children[id] })
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
