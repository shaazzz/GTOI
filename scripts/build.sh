cd $(dirname "$0")
cd ..
rm -r text/_build/html
rm -r _build/
bash scripts/build-dot.sh
cd text
make html
cd ..
rm -r text/_static/dot
cp -r text/_build/html _build
node scripts/problems.mjs
cp -a problems/_build/. _build/problems
node scripts/buildAll.mjs
node scripts/statistics.mjs
node scripts/contributors.mjs

cd text_en
make html
cd ..
rm -r text_en/_static/dot
cp -r text_en/_build/html _build/en

cd _build
touch .nojekyll
echo "gtoi.shaazzz.ir" > CNAME
