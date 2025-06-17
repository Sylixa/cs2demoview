const loadImage = (imgElement, src) => {
    return new Promise((resolve, reject) => {
        imgElement.onload = () => {
            resolve(imgElement);
        };
        imgElement.onerror = error => {
            reject(
                new Error(
                    `MR.JS: Failed to load image from ${src}: ${error.type}`
                )
            );
        };
        imgElement.src = src;
    });
};

export const getMapData = async demoHeader => {
    console.log(demoHeader);
    const mapName = demoHeader.get('map_name');
    const mapBase = `${import.meta.env.BASE_URL}maps/${mapName}/`;
    const mapSrc = mapBase + 'radar.png';
    const mapMeta = mapBase + 'meta.json';

    const imageLoadPromise = loadImage(new Image(), mapSrc);

    const metaDataFetchPromise = fetch(mapMeta).then(response => {
        if (!response.ok) {
            throw new Error(
                `MR.JS: HTTP error! status: ${response.status} for ${mapMeta}`
            );
        }
        return response.json();
    });

    console.log(
        `MR.JS: Loading image from ${mapSrc} and metadata from ${mapMeta}...`
    );
    const [loadedImage, metaData] = await Promise.all([
        imageLoadPromise,
        metaDataFetchPromise,
    ]);

    console.log('MR.JS: Image and metadata loaded successfully.');
    console.log(metaData);

    // Return all necessary information
    return {
        image: loadedImage,
        metaData: metaData,
    };
};
