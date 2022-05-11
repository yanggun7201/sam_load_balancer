

const config = {
    requestWait: 0,
};

const initProcessArguments = () => {
    process.argv.forEach(arg => {
        if (arg.startsWith("requestWait=")) {
            const temp = Number(parseArg(arg)[1]);
            if (!isNaN(temp) && temp > 0 && temp <= 10000) {
                config.requestWait = temp;
            }
        }
    });
}

const parseArg = (keyValue) => {
    const keyValues = keyValue.split("=");
    console.log('argument key value', keyValues);
    return keyValues;
}

module.exports = {
    config,
    initProcessArguments,
}