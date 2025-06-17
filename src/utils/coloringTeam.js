export const coloringTeam = (providedTick, sid, reference) => {
    let teamLogger = [];
    for (let i = 0; i < reference.length; i++) {
        currentTick = reference[i].tick;

        if (providedTick > reference[i].tick) {
            if (sid === reference[i].sid) {
                //return reference[i].team;
                teamLogger.push(reference[i].team);
            }
        }
    }
    // console.log(`UTIL${sid}: `, teamLogger);
    return teamLogger[teamLogger.length - 1];
};
