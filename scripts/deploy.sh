cd $(dirname "$0")
host=$(jq -r '.host' < deploy-config.json)
path=$(jq -r '.path' < deploy-config.json)
echo Enter remote password:
read password
cd ../text/_build/html
7za a -r -t7z -m0=lzma2 -mx=9 -mfb=273 -md=28 -ms=8g -mmt=off -mmtf=off -mqs=on -bt -bb3 www.7z *
sshpass -p $password scp www.7z "$host:/gtoi"
SCRIPT="cd /gtoi; rm -r www; 7za x www.7z -owww; chmod 755 www"
sshpass -p $password ssh $host "${SCRIPT}"
rm www.7z