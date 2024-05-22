let g = [2, 3, 3, 3, 4, 4, 5];

function getRandomItem(array) {
    if (array.length === 0) {
        return null; // Return null if the array is empty
    }

    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateRandomNumbers(count) {
    let [min, max] = [1, 25];
    if (count > max - min + 1) {
        console.log('Jumlah angka yang diminta lebih besar dari rentang yang tersedia.');
        return [];
    }

    let numbers = [];
    while (numbers.length < count) {
        let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }

    return numbers;
}

// Fungsi untuk menghasilkan nilai random antara min dan max
function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Fungsi untuk menghitung jarak antara dua koordinat menggunakan Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Fungsi untuk menghasilkan koordinat random dalam batasan kotak dengan jarak minimum
function generateCoordinates(n, minDistance) {
    const coordinates = [];
  
    const minLat = -7.527090;
    const maxLat = -7.510880;
    const minLon = 110.074145;
    const maxLon = 110.085346;
    
    while (coordinates.length < n) {
        const latitude = getRandomInRange(minLat, maxLat);
        const longitude = getRandomInRange(minLon, maxLon);
        let valid = true;
 
        if (valid) {
            coordinates.push({  latitude,longitude });
        }
    }

    return coordinates;
}

// Contoh penggunaan
const numberOfCoordinates = 107; // Ubah sesuai dengan jumlah koordinat yang diinginkan
const minimumDistance = 0.25; // Minimum jarak antar koordinat dalam km (300m)

const generatedCoordinates = generateCoordinates(numberOfCoordinates, minimumDistance);
console.log(JSON.stringify(generatedCoordinates));
