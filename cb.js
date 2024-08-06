import moment from 'moment';
import fs from 'fs';
export const printJSON = (data) => fs.writeFileSync('print.json', JSON.stringify(data, null, 2));

function generateRandomNumberBetween(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function generateDummyData(startTime, endTime) {
    let data = [];
    let currentTime = moment(startTime);

    let variables = {
        pm25: (5 + 550)/2,
        pm100: (5 + 550)/2,
        ch4: (200 + 1750)/2,
        co2: (5 + 1200)/2,
    };

    const ranges = {
        pm25: { min: 5, max: 510 },
        pm100: { min: 5, max: 510 },
        ch4: { min: 200, max: 1750 },
        co2: { min: 200, max: 1200 },
    };

    const endTimeMoment = moment(endTime);

    while (currentTime.isSameOrBefore(endTimeMoment)) {
        let newData = {
            datetime: currentTime.toISOString(),
            ...variables,
            ch4 : Number(variables.ch4.toFixed(0)),
            co2 : Number(variables.co2.toFixed(0))
        };
        data.push(newData);

        const interval = generateRandomNumberBetween(28, 32);

        variables = updateVariables(variables, ranges);

        currentTime.add(interval, 'minutes');
    }
    return data;
}

const startTime = '2024-02-01T00:00:00Z';
const endTime = '2024-06-12T00:00:00Z';
const dummyData = generateDummyData(startTime, endTime);

const array = Array.from({length:45}, (_)=>generateDummyData(startTime, endTime))

printJSON (array);

console.log(array.flatMap(e=>e).length);

function limitValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updateValue(value, delta, min, max) {
    const newValue = value + delta;
    return limitValue(newValue, min, max);
}

function updateVariables(variables, ranges) {
    const updatedVariables = {};

    for (const key in variables) {
        if (ranges.hasOwnProperty(key)) {
            let newValue, delta;
            const { min, max } = ranges[key];

            do {
                delta = generateRandomNumberBetween(-30, 30);
                newValue = updateValue(variables[key], delta, min, max);
            } while (newValue < min || newValue > max);

            updatedVariables[key] = newValue;
        }
    }

    return updatedVariables;
}

// Contoh penggunaan:

// let g = [2, 3, 3, 3, 4, 4, 5];

// function getRandomItem(array) {
//     if (array.length === 0) {
//         return null; // Return null if the array is empty
//     }

//     const randomIndex = Math.floor(Math.random() * array.length);
//     return array[randomIndex];
// }

// function randomBetween(min, max) {
//     return Math.floor(Math.random() * (max - min + 1) + min);
// }

// function generateRandomNumbers(count) {
//     let [min, max] = [1, 25];
//     if (count > max - min + 1) {
//         console.log('Jumlah angka yang diminta lebih besar dari rentang yang tersedia.');
//         return [];
//     }

//     let numbers = [];
//     while (numbers.length < count) {
//         let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
//         if (!numbers.includes(randomNumber)) {
//             numbers.push(randomNumber);
//         }
//     }

//     return numbers;
// }

// // Fungsi untuk menghasilkan nilai random antara min dan max
// function getRandomInRange(min, max) {
//     return Math.random() * (max - min) + min;
// }

// // Fungsi untuk menghitung jarak antara dua koordinat menggunakan Haversine formula
// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of the earth in km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos((lat1 * Math.PI) / 180) *
//             Math.cos((lat2 * Math.PI) / 180) *
//             Math.sin(dLon / 2) *
//             Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km
//     return distance;
// }

// // Fungsi untuk menghasilkan koordinat random dalam batasan kotak dengan jarak minimum
// function generateCoordinates(n, minDistance) {
//     const coordinates = [];

//     const minLat = -7.527090;
//     const maxLat = -7.510880;
//     const minLon = 110.074145;
//     const maxLon = 110.085346;

//     while (coordinates.length < n) {
//         const latitude = getRandomInRange(minLat, maxLat);
//         const longitude = getRandomInRange(minLon, maxLon);
//         let valid = true;

//         if (valid) {
//             coordinates.push({  latitude,longitude });
//         }
//     }

//     return coordinates;
// }

// // Contoh penggunaan
// const numberOfCoordinates = 107; // Ubah sesuai dengan jumlah koordinat yang diinginkan
// const minimumDistance = 0.25; // Minimum jarak antar koordinat dalam km (300m)

// const generatedCoordinates = generateCoordinates(numberOfCoordinates, minimumDistance);
// console.log(JSON.stringify(generatedCoordinates));



Baik

Tingkat kualitas udara yang sangat baik, tidak memberikan efek negatif terhadap manusia, hewan, tumbuhan.

Sangat baik melakukan kegiatan di luar

Sedang

Tingkat kualitas udara masih dapat diterima pada kesehatan manusia, hewan dan tumbuhan.

Kelompok sensitif: Kurangi aktivitas fisik yang terlalu lama atau berat.
Setiap orang: Masih dapat beraktivitas di luar

Tidak sehat

Tingkat kualitas udara yang bersifat merugikan pada manusia, hewan dan tumbuhan.

Kelompok sensitif: Boleh melakukan aktivitas di luar, tetapi mengambil rehat lebih sering dan melakukan
