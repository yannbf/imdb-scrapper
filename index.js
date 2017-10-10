var fs           = require('fs');
var express      = require('express');
var request      = require('request');
var cheerio      = require('cheerio');
var app          = express();
 
app.get('/', function (req, res) {
   res.send('Hello World');
})

app.get('/trivia', function(req, res){
    var id = req.query.id;
    url    = 'http://www.imdb.com/title/' + id + '/trivia';

    console.log('Starting request..');
    request(url, function(error, response, html){
        if(!error){
            console.log('Request done with no errors!');
            var $ = cheerio.load(html), json = {};

            var commonList  = $("#trivia_content > .list").parent().find("div.sodatext");
            var cameoList   = $("#trivia_content .list > a#cameo").parent().find("div.sodatext");
            var spoilerList = $("#trivia_content .list > a#spoilers").parent().find("div.sodatext");

            json.common   = extractData(commonList);
            json.cameo    = extractData(cameoList);
            json.spoiler  = extractData(spoilerList);
        }

        function extractData(list){
            console.log(list);
            var data = [];
            list.each(function(i,e){
                data.push($(this).text().trim());
            });

            return data;
        }

        writeFile('trivia_' + id, json);

        res.send(json);
    });
});

app.get('/scrape', function(req, res){
    var id = req.query.id;
    url    = 'http://www.imdb.com/title/' + id;
    request(url, function(error, response, html){
        if(!error){
            console.log('Request done with no errors!');
            var $ = cheerio.load(html);

            var title, release, rating, trivia;
            var json = { title : "", storyLine : "", imdbRating : "", releaseDate: "", duration: "", awards: "" };

            title       = $('.originalTitle').text().replace('(original title)','');
            storyLine   = $("#titleStoryLine").find("div.inline.canwrap p").text();
            imdbRating  = $("div.ratingValue > strong > span").text();
            releaseDate = $('meta[itemprop=datePublished]').attr("content");
            duration    = $('time[itemprop=duration]').first().text();
            awards      = $('span[itemprop=awards]').last().text()
                          + $('span[itemprop=awards]').last().text();

            json.title       = title.trim();
            json.storyLine   = storyLine.trim();
            json.imdbRating  = imdbRating.trim();
            json.releaseDate = releaseDate.trim();
            json.duration    = duration.trim();
            json.awards      = awards.trim();
        }

        writeFile(id, json);

        res.send(json);
    });
});

function writeFile(name, file){
    var dir = './data/';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    var filename = dir + name + '.json';

    fs.writeFile(filename, JSON.stringify(file, null, 4), function(err){
        console.log('File successfully written: ' + filename);
    });
}

app.listen('8081')
console.log('Listening on port 8081');
exports = module.exports = app;
