import { projectRoot } from "./rootAddress.mjs";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import YAML from "yaml";
import glob from "glob";
import restructured from 'restructured';

const escapeHTML = (s) => { 
  return s.replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
};

const rst2html = (rst, name) => {
  const parsed = restructured.default.parse(rst);
  const fail = (x) => {
    console.log(name);
    console.log(x);
    process.exit(0);
  };
  const f = (x, depth = 0) => {
    const { type, children } = x;
    if (type === 'document') {
      return children.map((y) => f(y, depth)).join('');
    } else if (type === 'section') {
      return children.map((y) => f(y, x.depth)).join('');  
    } else if (type === 'paragraph') {
      return `<p>${children.map(f).join('')}</p>`;  
    } else if (type === 'strong') {
      return `<b>${children.map(f).join('')}</b>`;  
    } else if (type === 'bullet_list') {
      return `<ul>${children.map(f).join('')}</ul>`;  
    } else if (type === 'enumerated_list') {
      return `<ol>${children.map(f).join('')}</ol>`;  
    } else if (type === 'list_item') {
      return `<li>${children.map(f).join('')}</li>`;  
    } else if (type === 'literal') {
      return `<span class="pre">${children.map(f).join('')}</span>`;  
    } else if (type === 'title') {
      return `<h${depth}>${children.map(f).join('')}</h${depth}>`;  
    } else if (type === 'text') {
      return x.value;  
    } else if (type === 'reference') {
      return children.map((y) => f(y, depth)).join('');  
    } else if (type === 'directive') {
      const { directive } = x;
      if (directive === 'figure') {
        const src = children[0].value;
        return `<img src="${src}">`;
      } else if (directive === 'code-block') {
        return `<pre dir="ltr">${escapeHTML(children.map((y) => f(y, depth)).join('\n'))}</pre>`;
      } else if (directive === 'math') {
        return `$$ ${children.map((y) => f(y, depth)).join('')} $$`;
      } else {
        fail(x);
      }
    } else if (type === 'interpreted_text') {
      const { role } = x;
      if (role === 'math') {
        const value = children[0].value;
        return `$ ${value} $`;
      } else if (role == undefined) {
        return 'دستور پشتیبانی نشده';
      } else {
        fail(x);
      }
    } else {
      fail(x);
    }
  };
  return f(parsed);
};

const readFile = (path) => new Promise((res) => {
  fs.readFile(path, (err, data) => res(data.toString()));
});
const writeFile = promisify(fs.writeFile);

const getDirectories = (src) => {
  return new Promise(res=>{
    glob(src + '/**/*.rst', (err, ans) => res(ans));
  });
};

const template = (text) => `<html>
  <head>
    <title>کتاب گراف برای المپیاد کامپیوتر</title>
    <style>
      img { display: block; text-align: center; max-width: 100%; }
    </style>
    <script>
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\\\(', '\\\\)']]
        }
      };
    </script>
    <script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  </head>
  <body dir="rtl">
    <h1>کتاب گراف برای المپیاد کامپیوتر</h1>
    <p>
      این نسخه پی دی اف، صرفا برای وجود شکل سنتی کتاب ساخته شده است و اکیدا توصیه
      می شود که به جای آن، از نسخه آنلاین استفاده کنید. مزایای استفاده از
      نسخه آنلاین کتاب عبارت اند از
      تصاویر رنگی، ظاهر زیبا، پیوند های درون کتاب و فهرست پیوند شده، نگه دارنده سوال
      حل شده، همواره به روز بودن آن و ... نسخه آنلاین کتاب را می توانید از
      https://gtoi.shaazzz.ir/
      مطالعه کنید. این کتاب شامل صد ها صفحه است، پس حتی المقدور سعی کنید آن را چاپ
      نکنید تا به محیط زیست احترام بگذارید و منابع محدود زمین را برای آیندگان باقی
      بگذارید.
    </p>
    <p>
      حق تکثیر این کتاب، برای شاززز محفوظ است. شما می توانید با شرایط مجوز
      کریتیو کامانز تخصیص - اشتراک همسان نسخه چهار بین الملل
      از این کتاب استفاده کنید. این به این معنی است که شما می توانید آزادانه
      این کتاب را مطالعه، تکثیر و تغییر دهید به شرط این که
      به نویسندگان و به این مجوز اشاره کنید و هر اثر مشتق شده از این کتاب را
      نیز با همین مجوز منتشر کنید، یعنی به دیگران اجازه دهید تا آن را تکثیر و تغییر
      دهند. برای جزییات بیشتر و متن حقوقی این مجوز، وبسایت کریتیو کامانز را ببینید.
    </p>
    ${text}
  </body>
</html>`;

const main = async () => {
  const pages = (await getDirectories(path.join(projectRoot, "text/book"))).filter(
    (x) => !x.endsWith('index.rst'),
  );
  const rst = await Promise.all(pages.map(async (x)=>({
    text: await readFile(x),
    name: x,
  })));
  const html = rst.map(({ text, name }) => rst2html(text, name));
  const output = path.join(projectRoot, '_build', 'allOfBook.html');
  await writeFile(output, template(html.join('')));
};

main();