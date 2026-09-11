function generateRandomDataset(
  count,
  startId,
  tempRanges,
  startDate,
  locationIds,
) {
  const data = [];
  let currentId = startId;
  let recordDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    // const daysOffset = Math.floor(Math.random() * 30);
    // const locationId = locationIds[Math.floor(Math.random() * locationIds.length)];
    let temp1 =
      Math.random() * (tempRanges.maxTemp1 - tempRanges.minTemp1) +
      tempRanges.minTemp1;
    let temp2 = temp1 + Math.random() * (tempRanges.maxTemp2 - temp1);

    data.push({
      temp1: parseFloat(temp1.toFixed(1)),
      temp2: parseFloat(Math.min(temp2, tempRanges.maxTemp2).toFixed(1)),
      date: recordDate,
      locationId: locationIds[0],
    });

    temp1 =
      Math.random() * (tempRanges.maxTemp1 - tempRanges.minTemp1) +
      tempRanges.minTemp1;
    temp2 = temp1 + Math.random() * (tempRanges.maxTemp2 - temp1);

    data.push({
      temp1: parseFloat(temp1.toFixed(1)),
      temp2: parseFloat(Math.min(temp2, tempRanges.maxTemp2).toFixed(1)),
      date: recordDate,
      locationId: locationIds[1],
    });

    const timestamp = new Date(recordDate);
    timestamp.setDate(timestamp.getDate() + 1);
    recordDate = timestamp;
  }

  /*return data.sort((a, b) => a.date.getTime() - b.date.getTime() || a.locationId - b.locationId);*/
  return data;
}

const data = generateRandomDataset(
  365,
  1,
  { minTemp1: 10, maxTemp1: 20, minTemp2: 10, maxTemp2: 20 },
  '2024-08-01',
  [1, 7],
);

console.log('data', data);
