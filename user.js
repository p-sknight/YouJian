const fs = require('fs');
const moment = require('moment');
const faker = require('faker');
const ObjectId = require('mongodb').ObjectId;

// 生成10条新数据
const data = [];
for (let i = 0; i < 10; i++) {
  const username = faker.name.findName();
  const password = faker.internet.password(6, 35);
  const schoolCode = faker.random.number({ min: 110000, max: 119999 }).toString();
  const schoolName = faker.company.companyName();
  const birthday = faker.date.between('1990-01-01', '2005-12-31').toISOString();
  const historys = [];
  for (let j = 0; j < 5; j++) {
    historys.push({
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      date: faker.date.past().toISOString()
    });
  }
  data.push({
    _id: new ObjectId(),
    username,
    password,
    avatar_url: '',
    gender: faker.random.arrayElement(['male', 'female']),
    school: {
      code: schoolCode,
      name: schoolName
    },
    birthday,
    historys
  });
}

// 保存数据为JSON文件
const now = moment().format('YYYYMMDDHHmmss');
const filename = `用户数据模拟${now}.json`;
const idFilename = `模拟用户id${now}.json`;
const filepath = `F:/html/ziXi/share-space-main/youjian/youjian_api_server/user/${filename}`;
const idFilepath = `F:/html/ziXi/share-space-main/youjian/youjian_api_server/user/${idFilename}`;
fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
fs.writeFileSync(idFilepath, JSON.stringify(data.map(d => d._id), null, 2));