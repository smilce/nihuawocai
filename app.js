/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  path = require('path');

var cookie = require('cookie');

var app = express();

var parseCookie = express.cookieParser("draw-guess");

var storeMemory = new express.session.MemoryStore();

var connectSid = 'nihuawocai';

// all environments
app.set('port', process.env.PORT || 3009);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: 'draw-guess',
  key: connectSid,
  store: storeMemory
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


var userList = [];
var userSocketMap = {};
var drawData = [];
var drawer;

var server = http.createServer(app),
  io = require('socket.io').listen(server);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

var projects = [{
  name: '杯子',
  tips: ['生活用品', '两个字']
},{
  name: '春风得意',
  tips: ['成语', '四个字', '第一个字是季节']
},{
  name: '床前明月光',
  tips: ['李白', '五个字']
},{
  name: '煎饼果子',
  tips: ['食物']
},{
  name: '做人不要太霍顿',
  tips: ['网络流行词汇', '奥运会', '澳大利亚', '孙杨']
}]

var project;

function buildDrawer(){
  return Math.floor(Math.random)
}

io.sockets.on('connection', function(socket) {

  var cookies = cookie.parse(socket.request.headers.cookie);

  var sid = cookies[connectSid];

  var userName = userSocketMap[sid];


  if (userName && userList.indexOf(userName) === -1) {
    userList.push(userName);
    socket.broadcast.emit('user-add', userList, userName);
  }


  socket.emit('draw', {
    hello: 'world'
  });


  socket.emit('init', {
    userList: userList,
    drawData: drawData,
    userName: userName
  })

  setInterval(function(){
    drawer = buildDrawer();
    project = buildProject();

    //socket.broadcast.emit('project-new')

  }, 1000);

  socket.on('draw', function(data) {
    drawData.push(data);
    socket.broadcast.emit('draw', data);
  });

  // 设置用户名
  socket.on('set_nickname', function(name) {

    // 当前没有用户名才允许设置
    if (!userName) {

      // 用户名不能重复
      if (userList.indexOf(name) === -1) {
        userList.push(name);
        userSocketMap[sid] = name;

        socket.emit('add_user', userList);

        socket.broadcast.emit('user-add', userList, name);
      } else {
        socket.emit('error', {
          message: '用户列表中已经存在' + name
        })
      }


    } else {
      socket.emit('error', {
        message: '不能重复设置用户'
      })
    }

  });
  socket.on('check_nickname', function(name) {
    for (var i = 0, l = userList.length; i < l; i++) {
      if (userList[i] === name) {
        socket.emit('check_nickname', false);
      }
    }
  });
  socket.on("msg", function(data) {
    /*if (data.id) {
      io.sockets.socket(data.id).emit("msg", socket.store.data.nickname + "<span style='color: green'>对你说：</span>" + data.msg)
    } else {*/
    socket.broadcast.emit("msg", userSocketMap[sid] + "说：" + data.msg);
    //}
  });

  socket.on('disconnect', function() {
    var userName = userSocketMap[sid];
    var userIndex = userList.indexOf(userName);
    if (userIndex > -1) {
      userList.splice(userIndex, 1);

      socket.broadcast.emit('user-remove', userList, userName);
    }
  });

});