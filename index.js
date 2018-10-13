const express = require('express');
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();

let readJSON = fs.readFileSync('./top250.json');
let jsonFile = JSON.parse(readJSON);

var urlencodedParser = bodyParser.urlencoded({extended: false});

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/create', function(req, resp) {
  fs.createReadStream(__dirname + '/public/create.html').pipe(resp);
});

app.get('/update/:id/:position', function(req, resp) {
  let id = req.params.id;
  let position = req.params.position;

  for(let i = 0; i < jsonFile.Films.length; i++){
    if(id == jsonFile.Films[i].id){
      jsonFile.Films[i].position = position;

      fs.truncate('./updateTop250.json', 0, function() {
        fs.writeFileSync('./updateTop250.json', JSON.stringify(jsonFile));
      });
      
      break;
    }
  }
});

app.get('/readall', function(req, resp) {
  jsonFile.Films.sort(comparebyPosition);
  resp.send(jsonFile.Films);
});

app.get('/read/:id', function(req, resp) {
  let id = req.params.id;

  for(let i = 0; i < jsonFile.Films.length; i++){
    if(jsonFile.Films[i].id == id){
      resp.send(jsonFile.Films[i]);
      break;
    }
  }
});

app.post("/createFilm", urlencodedParser, function (req, resp) {
  let readJSON = fs.readFileSync('./top250.json');
  let jsonFile = JSON.parse(readJSON);

  let flag = false;

  for(let i = 0; i < jsonFile.Films.length; i++){
    if(req.body.filmId == jsonFile.Films[i].id){
      flag = true;
      resp.writeHead(404, {'Content-Type': 'text.html; charset=utf-8'});
      fs.createReadStream(__dirname + '/public/404.html').pipe(resp);
    }
  }

  if(!flag){
    jsonFile.Films.push({id: req.body.filmId,
                            title: req.body.filmTitle,
                            rating: req.body.filmRating,
                            year: req.body.filmYear,
                            budget: req.body.filmBudget,
                            gross: req.body.filmGross,
                            poster: req.body.filmPoster,
                            position: req.body.filmPosition});

    resp.send(jsonFile.Films.pop());
  }
});

function comparebyPosition(obj1, obj2){
  return obj1.position - obj2.position;
}

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
