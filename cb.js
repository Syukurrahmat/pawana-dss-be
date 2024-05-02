function generateRandomCoordinates(latitude, longitude, radius) {
    const rEarth = 6371;

    const radianLat = latitude * (Math.PI / 180);
    const radianLong = longitude * (Math.PI / 180);

    const randomBearing = Math.random() * 2 * Math.PI;

    const randomDistance = Math.random() * radius;

    const newLatitude = Math.asin(
        Math.sin(radianLat) * Math.cos(randomDistance / rEarth) +
            Math.cos(radianLat) * Math.sin(randomDistance / rEarth) * Math.cos(randomBearing)
    );

    const newLongitude =
        radianLong +
        Math.atan2(
            Math.sin(randomBearing) * Math.sin(randomDistance / rEarth) * Math.cos(radianLat),
            Math.cos(randomDistance / rEarth) - Math.sin(radianLat) * Math.sin(newLatitude)
        );

    const newLatitudeDeg = newLatitude * (180 / Math.PI);
    const newLongitudeDeg = newLongitude * (180 / Math.PI);

    return { latitude: newLatitudeDeg, longitude: newLongitudeDeg };
}

function generateRandomCoordinatesInBox(
    initialLatitude,
    initialLongitude,
    north,
    south,
    east,
    west,
    maxDistance,
    numberOfPoints
) {
    const randomCoordinates = [];

    for (let i = 0; i < numberOfPoints; i++) {
        let randomLatitude, randomLongitude;
        do {
            const randomCoords = generateRandomCoordinates(
                initialLatitude,
                initialLongitude,
                maxDistance
            );
            randomLatitude = randomCoords.latitude;
            randomLongitude = randomCoords.longitude;
        } while (
            randomLatitude < south ||
            randomLatitude > north ||
            randomLongitude < west ||
            randomLongitude > east
        );

        randomCoordinates.push({ latitude: randomLatitude, longitude: randomLongitude });
    }

    return randomCoordinates;
}

const northBoundary = -7.39816;
const southBoundary = -7.5380225;
const eastBoundary = 110.3324799;
const westBoundary = 110.151187;

const numberOfPoints = 4;

const randomCoordinates = generateRandomCoordinatesInBox(
    -7.467253,
    110.189748,
    northBoundary,
    southBoundary,
    eastBoundary,
    westBoundary,
    1,

    numberOfPoints
);

console.log(randomCoordinates);
