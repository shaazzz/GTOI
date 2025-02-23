mkdir -p text/_static/dot
for f in dot/*.dot;
do
  x="$(basename "$f" .dot)";
  dot -Tsvg $f -o "text/_static/dot/$x.svg"
done
for f in dot/*.neato;
do
  x="$(basename "$f" .neato)";
  neato -Tsvg $f -o "text/_static/dot/$x.svg"
done
rm -rf text_en/_static/dot
cp -r text/_static/dot text_en/_static/