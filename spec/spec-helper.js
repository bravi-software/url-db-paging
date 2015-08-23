process.env.TZ = 'Brazil/East';

beforeEach(function () {
  // setup custom matchers and global spec setup
});


process.on('uncaughtException',function(e) {
  console.log(e.stack);
});
