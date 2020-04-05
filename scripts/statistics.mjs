import { projectRoot } from "./rootAddress.mjs";
import path from "path";
import glob from "glob";
import fs from "fs";
import { promisify } from "util";
import YAML from "yaml";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const getDirectories = (src, end = 'yaml') => {
  return new Promise(res=>{
    glob(src + '/**/*.'+end, (err, ans) => res(ans));
  });
};

const render = ({ problemCount, foreignProblemCount, partCount, completePartCount, partLines }) => {
  const percent = Math.round(completePartCount / partCount * 100);
  const pertos = Math.round(completePartCount / partCount * 1000)/10;
  return `
<html>
  <head>
  <link rel="stylesheet" href="/_static/problems.css">
  <link rel="stylesheet" type="text/css" href="/_static/font-awesome.min.css">
  </head>
  <body dir="rtl">
    <div id="body-top">
      <a><i class="fa fa-bar-chart"></i>&nbsp; آمار</a>
      <a style="float: left; padding-right: 20px;" href="/" id="problems-link"><i class="fa fa-book"></i>&nbsp; درس‌نامه</a>    
      <a style="float: left; padding-right: 20px;" href="/problems" id="problems-link"><i class="fa fa-question"></i>&nbsp; سوالات</a>    
    </div>
    
    <div>
    این کتاب به 14 فصل و
    ${partCount}
    بخش تقسیم شده که از آن‌ها
    ${completePartCount}
    بخش کامل شده است.
    <br>
    <div style="background-color:#ddd;direction:ltr;">
      <div style="background-color:#0f0;width:${percent}%;text-align:center">${pertos}%</div>
    </div>
    </div>
    <div>
    کتاب در حال حاضر
    ${problemCount}
    مساله دارد و علاوه بر آن
    ${foreignProblemCount}
    مساله برنامه نویسی به صورت لینک در آن قرار دارد.
    درس نامه این کتاب در مجموع از
    ${partLines}
    خط تشکیل شده است.
    </div>
  </body>
</html>
  `
};

const problems = async () => {
  const problems = await getDirectories(path.join(projectRoot, 'problems'));
  const problemCount = problems.filter((x)=>x.slice(-10) !== 'extra.yaml').length;
  const foreignProblems = await Promise.all(problems
    .filter((x)=>x.slice(-10) === 'extra.yaml')
    .map(async (x) => {
      return YAML.parse((await readFile(x)).toString());
    }));
  return {
    problemCount,
    foreignProblemCount: foreignProblems.map(x=>x.length).reduce((a, b)=>a+b),
  };
};

const text = async () => {
  const parts = (await getDirectories(path.join(projectRoot, 'text/book'), 'rst'))
    .filter((x) => x.slice(-9) !== 'index.rst');
  const partCount = parts.length;
  const completePartLines = await Promise.all(parts.map(async (x) => {
    const text = (await readFile(x)).toString();
    const lines = text.split('\n').length;
    const completed = lines > 15 && text.trim().slice(-7) !== 'not yet';
    return {
      lines,
      completed,
    };
  }));
  const partLines = completePartLines.map(({ lines }) => lines).reduce((a, b) => a+b);
  const completePartCount = completePartLines.filter(x => x.completed).length;
  return {
    partCount,
    completePartCount,
    partLines,
  };
};

const main = async () => {
  const result = render({
    ...(await problems()),
    ...(await text()),
  });
  await writeFile(path.join(projectRoot, '_build', 'statistics.html'), result);
};

main();