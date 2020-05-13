import { getDirectories } from "./util.mjs";
import { projectRoot } from "./rootAddress.mjs";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const rstT = (x) => {
  const s = x.split('\n');
  const r = [];
  let current = 'none';
  for (let i = 0; i < s.length; i += 1) {
    const a = s[i];
    if (a.slice(0, 4) === '====') {
      const k = r.pop();
      r.push(`====== ${k} ======`);
    } else if (a.slice(0, 4) === '----') {
      const k = r.pop();
      r.push(`===== ${k} =====`);
    } else if (a.slice(0, 9) === '.. figure') {
      current = 'figure';
      const b = a.slice(21);
      r.push(`\n{{ آموزش:gtoi:${b}?nolink }}\n`)
    } else if (a.slice(0, 4) === '   :') {
      if (current === 'figure') {

      } else {
        r.push(a);
      }
    } else {
      current = 'none';
      r.push(a);
    }
  }
  return r.join('\n');
}

const mathT = (x) => {
  return x.replace(/:math:`[^`]*`/g, (k) => `$${k.slice(7, -1)}$`);
};

const transform = (x) => {
  return mathT(rstT(x)); 
};

const main = async () => {
  const opediaDir = path.join(projectRoot, '_build/opedia');
  const bookDir = path.join(projectRoot, 'text/book');
  const parts = (await getDirectories(bookDir, 'rst'))
    .filter((x) => x.slice(-9) !== 'index.rst');
  await Promise.all(parts.map(async (x) => {
    const text = (await readFile(x)).toString();
    const ox = opediaDir + x.slice(bookDir.length, -3) + 'txt';
    console.log(ox);
    await mkdir(path.dirname(ox), { recursive: true });
    await writeFile(ox, transform(text));
  }));
};

main();