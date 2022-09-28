#!/bin/bash
local_sam_dir=$PWD

# overwrite the current file
echo "" > nohup.out
echo "" > sam.log

# npm start will running in background
# node index.js also will be run in background after ctrl+c
npm start &


function run_local_sam {
    # find the target dir and cd into it
    PROJECT_DIR=$(find $HOME -type d -name nep-platform-operator-interface | head -n 1)
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
    AWS_PROFILE=vector-nep-sandbox sam local start-api -p $port -t target/sam.jvm.yml --host 0.0.0.0 $warmContainers -n sam.env-linux.json >> $local_sam_dir/sam.log 2>&1 &
}

for PORT in {8082..8086}
do
    run_local_sam $PORT &
done


echo "script PGID is: $$"
echo "kill this script along all sam & node processes"
# set colorful output in cmd
echo "run $(tput setaf 1 setab 7 bold)pkill -TERM -g $$$(tput sgr0)"

