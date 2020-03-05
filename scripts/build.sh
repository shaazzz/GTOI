cd $(dirname "$0")
cd ..
rm -r text/_build/html
cd text
make html
cd ..
cp -r text/_build/html _build
node scripts/problems.mjs
cp -a problems/_build/. _build/problems
