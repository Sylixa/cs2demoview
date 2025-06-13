const drawPoint = (
    ctx,
    localX, //World Pos
    localY,
    radius = 5,
    colorStroke = 'black',
    colorFill = 'black'
) => {
    ctx.beginPath();
    ctx.arc(localX, localY, radius, 0, Math.PI * 2, false);
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
};

// Function to draw the single box on the canvas
export function drawObjects(
    ctx,
    drawQueue = [],
    translateX = 0,
    translateY = 0,
    scaleFactor = 1.0,
    mapImage
) {
    // console.log(mapImage);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();

    ctx.translate(translateX, translateY);
    ctx.scale(scaleFactor, scaleFactor);

    // Draw a red square at logical coordinates (0,0).

    // const boxSize = 100;
    // ctx.fillStyle = '#ef4444';
    // ctx.fillRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize); // Center box at transformed origin

    ctx.drawImage(mapImage, 0, 0, 2048, 2048);

    // Draw the green cross at the center of the map (world coordinates)
    const mapCenterX = 1152;
    const mapCenterY = 1052;
    const crossSize = 25;
    const crossThickness = 2;

    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = crossThickness;
    // Horizontal line, centered at map center
    ctx.moveTo(mapCenterX - crossSize / 2, mapCenterY);
    ctx.lineTo(mapCenterX + crossSize / 2, mapCenterY);
    // Vertical line, centered at map center
    ctx.moveTo(mapCenterX, mapCenterY - crossSize / 2);
    ctx.lineTo(mapCenterX, mapCenterY + crossSize / 2);
    ctx.stroke();

    for (const obj of drawQueue) {
        drawPoint(
            ctx,
            obj.x,
            obj.y,
            obj.radius,
            obj.colorStroke,
            obj.colorFill
        );
    }

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Display the current camera offset relative to the canvas's top-left corner
    ctx.fillStyle = 'black';
    ctx.font = '16px Inter';
    // Calculate the world coordinate of the canvas's top-left corner (where the camera is "looking")
    // This calculation now involves the scaleFactor
    const worldViewportTopLeftX =
        (-translateX + ctx.canvas.width / 2) / scaleFactor;
    const worldViewportTopLeftY =
        (-translateY + ctx.canvas.height / 2) / scaleFactor;
    ctx.fillText(
        `World Viewport Top-Left: X=${worldViewportTopLeftX.toFixed(
            0
        )}, Y=${worldViewportTopLeftY.toFixed(0)}, Zoom=${scaleFactor.toFixed(
            2
        )}x`,
        10,
        20
    );

    ctx.beginPath();
    ctx.arc(
        ctx.canvas.width / 2,
        ctx.canvas.height / 2,
        2,
        0,
        Math.PI * 2,
        false
    );
    ctx.fillStyle = 'blue';
    ctx.fill();
    ctx.stroke();
}

// Reset View button
// document.getElementById('resetView').addEventListener('click', () => {
//     translateX = canvas.width / 2;
//     translateY = canvas.height / 2;
//     scaleFactor = 0.5;
//     zoomSlider.value = scaleFactor;
//     drawObjects();
// });

// window.onload = drawObjects;
// drawObjects();
// window.addEventListener('resize', () => {
//     drawObjects();
// });
