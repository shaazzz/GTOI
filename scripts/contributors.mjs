import { projectRoot } from "./rootAddress.mjs";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);


const render = ({ }) => {
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
    <h3>درسنامه</h3>
    <canvas id="text-chart"></canvas>
    <script defer>
      var ctx = document.getElementById('text-chart').getContext('2d');
      var chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'pie',

          // The data for our dataset
          data: data = {
            datasets: [{
              backgroundColor: function(context) {
                var index = context.dataIndex;
                var len = context.dataset.data.length;
                return 'hsl('+(index/len*360)+',100%,50%)';
            },
                data: [10, 20, 30, 40]
            }],
        
            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [
                'Red',
                'Yellow',
                'Blue',
                'boz'
            ],

        },

          // Configuration options go here
          options: {}
      });
    </script>
    </div>
  </body>
</html>
  `
};

const main = async () => {
  const result = render({});
  await writeFile(path.join(projectRoot, '_build', 'contributors.html'), result);
};

main();