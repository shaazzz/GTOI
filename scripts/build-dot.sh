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
