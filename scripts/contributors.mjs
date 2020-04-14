import { projectRoot } from "./rootAddress.mjs";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import YAML from "yaml";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


const render = ({ labels, websites, textData, problemData, codeData }) => {
  const color = (i) => `hsl(${i/labels.length*360},100%,50%)`
  const textSpans = labels.map((x, i) => {
    if (textData[i] !== 0) 
      return `<a href="${websites[i]}"><span style="color:${color(i)}">${x}</span></a>`;
  }).filter(x => x);
  const probSpans = labels.map((x, i) => {
    if (problemData[i] !== 0 || codeData[i] !== 0) 
      return `<a href="${websites[i]}"><span style="color:${color(i)}">${x}</span></a>`;
  }).filter(x => x);
  return `
<html>
  <head>
  <link rel="stylesheet" href="/_static/problems.css">
  <link rel="stylesheet" type="text/css" href="/_static/font-awesome.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@2.8.0"></script>
  </head>
  <body dir="rtl">
    <div id="body-top">
      <a><i class="fa fa-users"></i>&nbsp; مشارکت کنندگان</a>
      <a style="float: left; padding-right: 20px;" href="/" id="problems-link"><i class="fa fa-book"></i>&nbsp; درس‌نامه</a>    
      <a style="float: left; padding-right: 20px;" href="/problems" id="problems-link"><i class="fa fa-question"></i>&nbsp; سوالات</a>    
    </div>
    <div>
    افراد زیادی زحمت کشیده اند و وقت و انرژی خود را به پای این کتاب ریخته اند. حتی
    کسانی که یک خط از کتاب را اصلاح کرده اند اگر نبودند کتاب به این نقطه ای که اکنون
    در آن قرار دارد نمی رسید. ممکن است برخی به صورت گمنام مشارکت کرده باشند یا به دلیل
    اشتباهی از ما، اسم آن ها در این فهرست نیامده باشد. اما ما قدردان زحمات همه آنان هستیم.
    <h2>آمار</h2>
    <h3>نویسندگان</h3>
    ${textSpans.join('،')}
    <canvas id="text-chart"></canvas>
    <h3>گرد آورندگان سوال</h3>
    ${probSpans.join('،')}
    <table style="width:100%">
      <tr>
        <th style="width:50%">سوالات تئوری</th>
        <th style="width:50%">سوالات کد</th>
      </tr>
      <tr>
        <td><canvas id="problem-chart"></canvas></td>
        <td><canvas id="code-chart"></canvas></td>
      </tr>
    </table>
    <script defer>
      const cf = function(context) {
        var index = context.dataIndex;
        var len = context.dataset.data.length;
        return 'hsl('+(index/len*360)+',100%,50%)';
      };
      var ctx = document.getElementById('text-chart').getContext('2d');
      Chart.defaults.global.display = false;
      var chart = new Chart(ctx, {
        type: 'pie',
        data: {
          datasets: [{
            backgroundColor: cf,
            data: ${JSON.stringify(textData)}
          }],
          labels: ${JSON.stringify(labels)},
        },
        options: {legend:{display: false}},
      });
      var ctx = document.getElementById('problem-chart').getContext('2d');
      var chart = new Chart(ctx, {
        type: 'pie',
        data: {
          datasets: [{
            backgroundColor: cf,
            data: ${JSON.stringify(problemData)}
          }],
          labels: ${JSON.stringify(labels)},
        },
        options: {legend:{display: false}},
      });
      var ctx = document.getElementById('code-chart').getContext('2d');
      var chart = new Chart(ctx, {
        type: 'pie',
        data: {
          datasets: [{
            backgroundColor: cf,
            data: ${JSON.stringify(codeData)}
          }],
          labels: ${JSON.stringify(labels)},
        },
        options: {legend:{display: false}},
      });
    </script>
    </div>
  </body>
</html>
  `
};

const normalize = ({
  name, text = [], problem = 0, codeProblem = 0, website = 'https://shaazzz.ir',
}) => ({
  name, text, problem, codeProblem, website,
})

const main = async () => {
  const data = YAML.parse(
    (await readFile(path.join(projectRoot, 'contributors.yaml'))).toString()
  ).map(normalize);
  const labels = data.map(({ name })=>name);
  const websites = data.map(({ website })=>website);
  const textData = data.map(({ text })=>text.length);
  const problemData = data.map(({ problem })=>problem);
  const codeData = data.map(({ codeProblem })=>codeProblem);
  const result = render({ labels, textData, problemData, codeData, websites });
  await writeFile(path.join(projectRoot, '_build', 'contributors.html'), result);
};

main();