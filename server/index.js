var express = require('express');
var cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.send('Hello World');
});

const server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})