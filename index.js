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

app.get('/delete/:id', function(req, resp) {
  let id = req.params.id;

  for(let i = 0; i < jsonFile.Films.length; i++){
    if(id == jsonFile.Films[i].id){
      jsonFile.Films[i] = null;
    }
    else if(jsonFile.Films[i].id > id){
      jsonFile.Films[i].id = jsonFile.Films[i].id - 1;
    }
  }

  fs.truncate('./updateTop250.json', 0, function() {
    fs.writeFileSync('./updateTop250.json', JSON.stringify(jsonFile));
  });
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

  fs.truncate('./newTop250.json', 0, function() {

      message = {};
      temp = {};
      count = 1;

      for(let i = 0; i < jsonFile.Films.length; i++){
        if(req.body.filmId == jsonFile.Films[i].id){

          message.id = req.body.filmId;
          message.title = req.body.filmTitle;
          message.rating = req.body.filmRating;
          message.year = req.body.filmYear;
          message.budget = req.body.filmBudget;
          message.gross = req.body.filmGross;
          message.poster = req.body.filmPoster;
          message.position = req.body.filmPosition;

          jsonFile.Films[i].id = jsonFile.Films[i].id + 1;
          temp = jsonFile.Films[i]

          jsonFile.Films[i] = message;
          fs.appendFileSync('./newTop250.json', JSON.stringify(jsonFile.Films[i]) + '\n');

          resp.send(jsonFile.Films[i]);
        }
        else if (jsonFile.Films[i].id < req.body.filmId) {
            fs.appendFileSync('./newTop250.json', JSON.stringify(jsonFile.Films[i]) + '\n');
        }
        else if (jsonFile.Films[i].id > req.body.filmId) {
          //чтобы доб 1 раз
          if(count == 1){
            count--;
            fs.appendFileSync('./newTop250.json', JSON.stringify(temp) + '\n');
          }

          jsonFile.Films[i].id = jsonFile.Films[i].id + 1;
          fs.appendFileSync('./newTop250.json', JSON.stringify(jsonFile.Films[i]) + '\n');
        }
      }
  });
});

function comparebyPosition(obj1, obj2){
  return obj1.position - obj2.position;
}

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
