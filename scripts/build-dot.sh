mkdir -p text/_static/dot
for f in dot/*.dot;
do
  x="$(basename "$f" .dot)";
  dot -Tsvg $f -o "text/_static/dot/$x.svg"
done
