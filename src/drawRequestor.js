export const convertCordsGameToRadar = (
    posX,
    posY,
    offsetX,
    offsetY,
    resScale,
    mapX = 2048,
    mapY = 2048
) => {
    let radarOffsetX = offsetX / resScale;
    //Calculate the Y for Canvas offset
    let radarOffsetY = mapY - offsetY / resScale;
    let radarX = posX / resScale + radarOffsetX;
    //Convert Y- -> Y+ because Canvas and CS2 is different
    let radarY = (posY * -1) / resScale + radarOffsetY;

    return [radarX, radarY];
};

/**
 * drawQueueConstructor
 * @param {number} localX
 * @param {number} localY
 * @param {number} [radius=5]
 * @param {string} colorStroke
 * @param {string} colorFill
 * @returns {{x: number, y: number, radius: number, colorStroke: string, colorFill: string}}
 */
export const drawQueueConstructor = (
    posX,
    posY,
    radius = 5,
    colorStroke,
    colorFill
) => {
    return {
        type: 'dot',
        x: posX,
        y: posY,
        radius: radius,
        colorStroke: colorStroke,
        colorFill: colorFill,
    };
};

export const drawNameConstructor = (
    playerX,
    playerY,
    fontSize,
    font,
    lineWidth,
    colorStroke,
    colorFill,
    textContent
) => {
    return {
        type: 'text',
        x: playerX,
        y: playerY,
        fontSize: fontSize,
        font: font,
        lineWidth: lineWidth,
        colorStroke: colorStroke,
        colorFill: colorFill,
        textContent: textContent,
    };
};
