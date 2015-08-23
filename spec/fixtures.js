var data = [];
for (var i = 1; i < 51; i++) {
  data.push({
    _id: i,
    publishedAt: new Date(2000, 2, 1, 1, 1, i),
    createdAt: new Date(2000, 2, 1, 1, 1, i),
    title: 'title'
  });
}

module.exports = data;
