const fs = require('fs');
const path = require('path');

// 生成随机时间戳
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 生成随机的userId和roomId
function randomId(ids) {
  const index = Math.floor(Math.random() * ids.length);
  return ids[index];
}

// 生成历史记录数据
function generateData() {
  const userIds = [
    "647c63cc955d8cb3c60cfa69",
    "647c63cc955d8cb3c60cfa6a",
    "647c63cc955d8cb3c60cfa6b",
    "647c63cc955d8cb3c60cfa6c",
    "647c63cc955d8cb3c60cfa6d",
    "647c63cc955d8cb3c60cfa6e",
    "647c63cc955d8cb3c60cfa6f",
    "647c63cc955d8cb3c60cfa70",
    "647c63cc955d8cb3c60cfa71",
    "647c63cc955d8cb3c60cfa72",
    "647c640729bc75dd854a3d8b",
    "647c640729bc75dd854a3d8c",
    "647c640729bc75dd854a3d8d",
    "647c640729bc75dd854a3d8e",
    "647c640729bc75dd854a3d8f",
    "647c640729bc75dd854a3d90",
    "647c640729bc75dd854a3d91",
    "647c640729bc75dd854a3d92",
    "647c640729bc75dd854a3d93",
    "647c640729bc75dd854a3d94"
  ];
  const roomIds = [
    "6447f4abf8b1147f5f44f140",
    "6447f4abf8b1147f5f44f141",
    "6447f4abf8b1147f5f44f142",
    "6447f4abf8b1147f5f44f143",
    "6447f4abf8b1147f5f44f144",
    "647ad6aacd7513b6900a8f5c",
    "647ad871cd7513b6900a8f62"
  ];
  const data = [];
  for (let i = 0; i < 10; i++) {
    const startTime = randomDate(new Date(2020, 0, 1), new Date());
    const endTime = randomDate(startTime, new Date());
    const userId = randomId(userIds);
    const roomId = randomId(roomIds);
    const roomName = `room-${i}`;
    const createdAt = new Date();
    const updatedAt = new Date();
    const record = {
      start_time: startTime,
      end_time: endTime,
      userId,
      roomId,
      roomName,
      createdAt,
      updatedAt
    };
    data.push(record);
  }
  return data;
}

// 生成历史记录数据文件和id文件
function generateFiles() {
  const data = generateData();
  const timestamp = Date.now();
  const dataFileName = `历史记录模拟文件${timestamp}.json`;
  const idFileName = `模拟记录id${timestamp}.json`;
  const dataFilePath = path.join(__dirname, 'data_His', dataFileName);
  const idFilePath = path.join(__dirname, 'data_His', idFileName);
  const ids = data.map(record => record._id);
  const idMap = {};
  ids.forEach(id => {
    const num = Math.floor(Math.random() * 100);
    idMap[id] = num;
  });
  const dataJson = JSON.stringify(data, null, 2);
  const idJson = JSON.stringify(idMap, null, 2);
  fs.writeFileSync(dataFilePath, dataJson);
  fs.writeFileSync(idFilePath, idJson);
}

generateFiles();