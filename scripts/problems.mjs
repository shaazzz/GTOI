import path from "path";
import { projectRoot } from "./rootAddress.mjs";
import glob from "glob";
import YAML from "yaml";
import fs from "fs";
import { promisify } from "util";

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

const template = ({ text, solution, id }) => `
<html>
  <head>
  <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  </head>
  <body style="direction:rtl;">
    <h1>سوال ${id}:</h1>
    ${text}
    <h1>جواب:</h1>
    ${solution}
  </body>
</html>`;

const main = async () => {
  const ppath = path.join(projectRoot, 'problems');
  const bpath = path.join(ppath, '_build');
  await rmdir(bpath, { recursive: true });
  const problems = await Promise.all(
    (await getDirectories(ppath)).map(
      async (adr) => ({
        address: adr,
        id: adr.substr(ppath.length+1).replace(/\//g,'.').replace('.yaml', ''),
        data: YAML.parse((await readFile(adr)).toString()),
      })
    )
  );
  const htmls = problems.map(({ id, data })=>({
    address: path.join(bpath, id+'.html'),
    id,
    html: template({ ...data, id }),
  }));
  await mkdir(bpath);
  await Promise.all(htmls.map(async ({ address, html }) => {
    await writeFile(address, html);
  }));
};

main();
