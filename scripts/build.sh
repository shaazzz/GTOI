cd $(dirname "$0")
cd ..
cd text
rm -r _build/html
make html
cp -r _build/html ../_build