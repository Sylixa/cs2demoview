const switchStatus = false;

export const prepareData = data => {
    function removeDuplicateTickSid(arr) {
        const seenKeys = new Set(); // To store "ID_Area" combinations
        const uniqueObjects = [];

        for (const obj of arr) {
            // Ensure obj, obj.id, and obj.area exist before proceeding
            if (obj && obj.sid !== undefined && obj.tick !== undefined) {
                const compositeKey = `${obj.sid}_${obj.tick}`; // Create a unique key like "1_A"

                if (!seenKeys.has(compositeKey)) {
                    seenKeys.add(compositeKey);
                    uniqueObjects.push(obj);
                }
            }
        }
        return uniqueObjects;
    }
    const createTickData = (currentTick, steamid, username, team) => {
        return {
            tick: currentTick,
            sid: steamid,
            name: username,
            team: team,
        };
    };

    const reversePattern = num => {
        if (num === 2) {
            return 3;
        } else {
            return 2;
        }
    };

    const assignTeam = (team, counter) => {
        const pattern = [2, 3, 3, 2];
        let reversePatternFlag = team === 3 ? true : false;
        let i = 0;
        if (counter === 1) {
            return team;
        }
        let newTeam = team;
        while (counter > 0) {
            if (reversePatternFlag === true) {
                newTeam = reversePattern(pattern[i]);
            } else {
                newTeam = pattern[i];
            }

            i++;
            if (i >= pattern.length) {
                i = 0;
            }
            counter--;
        }
        return newTeam;
    };

    const dataPadder = iTick => {
        const paddingTick = [];

        for (let i = 0; i < iTick.length; i++) {
            let steamid = data[i].get('user_steamid');
            let username = data[i].get('user_name');
            let team = data[i].get('team');

            let inputData = createTickData(1, steamid, username, team);

            paddingTick.push(inputData);
        }
        // let combinedArray = [...paddingTick, ...fDataset];

        return paddingTick;
    };

    const strayAmount = 3840; // 64t*60s

    const filterStrayTicks = (tickArray, threshold) => {
        const tickValues = tickArray.map(entry => entry.tick);
        const uniqueSortedTicks = [...new Set(tickValues)].sort(
            (a, b) => a - b
        );

        const ticksToRemove = new Set();

        for (let i = 0; i < uniqueSortedTicks.length - 1; i++) {
            const a = uniqueSortedTicks[i];
            const b = uniqueSortedTicks[i + 1];
            if (Math.abs(a - b) <= threshold) {
                ticksToRemove.add(Math.min(a, b));
            }
        }

        return tickArray.filter(entry => !ticksToRemove.has(entry.tick));
    };

    const initialTick = data[0].get('tick');
    //const oldTick = data[0].get('tick');

    //const defaultMatch = false; //If this is false, use 12-12, when True use Overtime

    let fullDataset = [];
    let initialDataset = [];
    //Build initial dataset
    for (let i = 0; i < data.length; i++) {
        let currentTick = data[i].get('tick');
        let steamid = data[i].get('user_steamid');
        let username = data[i].get('user_name');
        let team = data[i].get('team');

        // if (sidSeen.has(steamid)) {
        //     let tmp = sidSeen.get(steamid);
        //     tmp++;
        //     sidSeen.set(steamid, tmp);
        // } else {
        //     sidSeen.set(steamid, 1);
        // }

        // let playerId = sidSeen.get(steamid);

        // let constructData = new Map();
        let inputData = createTickData(currentTick, steamid, username, team);

        fullDataset.push(inputData);
        // constructData.set(steamid, inputData);

        // if (!fullDataset.has(currentTick)) {
        //     fullDataset.set(currentTick, [constructData]);
        // } else {
        //     fullDataset.get(currentTick).push(constructData);
        // }

        if (initialTick === currentTick) {
            initialDataset.push(inputData);
        }
    }

    fullDataset = removeDuplicateTickSid(fullDataset);
    let padderArr = dataPadder(initialDataset);
    fullDataset = [...padderArr, ...fullDataset];
    initialDataset = padderArr;
    fullDataset = filterStrayTicks(fullDataset, strayAmount);

    const seenSid = new Map();

    for (let i = 0; i < fullDataset.length; i++) {
        let sid = fullDataset[i].sid;
        let tick = fullDataset[i].tick;

        if (!seenSid.has(sid)) {
            seenSid.set(sid, 1);
        } else {
            let tmp = seenSid.get(sid);
            tmp++;
            seenSid.set(sid, tmp);
        }

        for (let y = 0; y < initialDataset.length; y++) {
            let initTick = initialDataset[y].tick;
            let initSid = initialDataset[y].sid;
            let initTeam = initialDataset[y].team;

            if (tick === initTick) {
                break;
            }

            if (sid === initSid) {
                console.log(fullDataset[i].name);

                fullDataset[i].team = assignTeam(
                    initTeam,
                    seenSid.get(initSid)
                );
            }
        }
    }

    console.log('OriginalData: ', data);
    console.log('Init: ', initialDataset);
    console.log('ParseData: ', fullDataset);

    return fullDataset;
};

//1st   2nd     OT1(1)   OT2(1)  OT1(2)  OT2(2)
//CT    T       T        CT      CT      T
//T     CT      CT       T       T       CT
//83k   101k    213k
//2     3       3       2       2       3
//6    12       15      18
