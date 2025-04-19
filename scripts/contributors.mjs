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
      <a><i class="fa fa-users"></i>&nbsp; Contributors</a>
      <a style="float: left; padding-right: 20px;" href="/" id="problems-link"><i class="fa fa-book"></i>&nbsp; درس‌نامه</a>    
      <a style="float: left; padding-right: 20px;" href="/problems" id="problems-link"><i class="fa fa-question"></i>&nbsp; سوالات</a>    
    </div>
    <div>
    Many people have worked hard and put their time and energy into this book. Even those who fixed just one line helped the book become what it is today. Some may have helped anonymously, or we may have accidentally left their names off the list. But we appreciate everyone’s efforts.
    <h2>Statistics</h2>
    <h3>Authors</h3>
    ${textSpans.join('،')}
    <canvas id="text-chart"></canvas>
    <h3>Question Collectors</h3>
    ${probSpans.join('،')}
    <table style="width:100%">
      <tr>
        <th style="width:50%">Theoretical Problems</th>
        <th style="width:50%">Coding Problems</th>
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