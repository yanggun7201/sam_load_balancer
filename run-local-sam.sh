#!/bin/bash
local_sam_dir=$PWD
PROJECT_DIR=$(find $HOME -type d -name nep-platform-operator-interface 2>/dev/null | head -n 1)

# overwrite the current file
echo "" > nohup.out
for PORT in {8082..8086}
do
    echo "" > sam-$PORT.log
done

# npm start will running in background
# node index.js also will be run in background after ctrl+c
npm run start:nohup &



function run_local_sam {
    # find the target dir and cd into it
    cd $PROJECT_DIR
    port=8080

    if [ -n "$1" ]
    then
        port=$1
    fi

    warmContainers="--warm-containers EAGER"

    if [ -n "$2" ]
    then
        $warmContainers="--warm-containers $2"
    fi

    # make sure local sam run in background
    AWS_PROFILE=vector-nep-sandbox sam local start-api -p $port -t target/sam.jvm.yml --host 0.0.0.0 $warmContainers -n sam.env-linux.json >> $local_sam_dir/sam-$port.log 2>&1 &
}

for PORT in {8082..8086}
do
    run_local_sam $PORT &
done


echo "script PGID is: $$"
echo "kill this script along all sam & node processes"
# set colorful output in cmd
echo "run $(tput setaf 1 setab 7 bold)pkill -TERM -g $$$(tput sgr0)"

# trap ctrl-c and call ctrl_c()
trap ctrl_c INT

function ctrl_c() {
    echo "** All SAMs are killed"
    pkill -TERM -g $$
}

while true; do
    sleep 1
done
