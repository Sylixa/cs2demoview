let cs2PlayerPos = new Map();
let minTick = null;
let maxTick = null;

// let parseCS2match = JSON.parse(cs2match);
// console.log(parseCS2match);
const loadReplay = demoFile => {
    // Wait for user upload
    // Pass raw demo to "DemoParser"
    // Wait for Parser to finish
    // Load Replay into JS Object
    // Ready to use
    console.log('REPLAY_MANAGER.JS: ', demoFile);
    populateData(demoFile);
    convertRawToMap(demoFile);
    console.log('min max', minTick, maxTick);

    console.log(cs2PlayerPos);
    return true;
};

const populateData = rawData => {
    minTick = rawData[0].get('tick');
    maxTick = rawData[rawData.length - 1].get('tick');
};

//Potential speed up with Worker
const convertRawToMap = rawData => {
    console.log('REPLAY_MANAGER.JS: Constructing Map');
    // rawData = rawData.data;
    let currentTick = rawData[0].get('tick');
    let previousTick = rawData[0].get('tick');

    let tmp = [];
    for (let i = 0; i < rawData.length; i++) {
        currentTick = rawData[i].get('tick');
        if (currentTick === previousTick) {
            tmp.push({
                X: rawData[i].get('X'),
                Y: rawData[i].get('Y'),
                name: rawData[i].get('name'),
                sid: rawData[i].get('steamid'),
            });
        } else {
            cs2PlayerPos.set(previousTick, structuredClone(tmp));
            previousTick = currentTick;
            tmp = [];
            tmp.push({
                X: rawData[i].get('X'),
                Y: rawData[i].get('Y'),
                name: rawData[i].get('name'),
                sid: rawData[i].get('steamid'),
            });
        }
    }
    cs2PlayerPos.set(currentTick, structuredClone(tmp));

    console.log(
        `Replay data processed. Min Tick: ${minTick}, Max Tick: ${maxTick}`
    );
};

const getMinTick = () => {
    return minTick || 0;
};
const getMaxTick = () => {
    return maxTick || 0;
};

console.log(maxTick, minTick);
const getPlayerAtTick = tick => {
    if (tick > maxTick) {
        return [];
    }

    return cs2PlayerPos.get(Math.floor(tick)) || [];
};

export { getPlayerAtTick, getMaxTick, getMinTick, loadReplay };
