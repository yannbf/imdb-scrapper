var fs           = require('fs');
var express      = require('express');
var request      = require('request');
var cheerio      = require('cheerio');
var app          = express();


app.get('/scrape', function(req, res){
    const ids = req.query.id.split(',');
    makeRequest(ids[0], req, res);
    // ids.forEach(id => makeRequest(id, req, res));
});

function makeRequest(id, req, res) {
    const url = 'http://instantwatcher.com/title/' + id;
    request(url, (error, response, html) => {
        if(!error){
            console.log('Request done with no errors!');
            const $ = cheerio.load(html);

            const titles = $('.netflix-title');

            const mainInfo = titles[1];
            const actors = $('.actors a');

            var serie = {
                id       : id,
                poster   : {
                    portrait: $('.iw-boxart').attr('src'),
                    landscape: ''
                },
                title    : $(mainInfo).find('.title-link').text(),
                year     : $(mainInfo).find('.year a').text(),
                synopsis : $(mainInfo).find('.synopsis').text(),
                cast     : $(actors[0]).text() + ', ' + $(actors[1]).text() + ', ' + $(actors[2]).text(),
                episodes : []
            }

            titles.splice(0,2);

            titles.each((index, episode) => {
                var episodeData = {
                    number   : (index + 1),
                    title    : $(episode).find('.episode-title').text(),
                    synopsis : $(episode).find('.synopsis').text(),
                    runtime  : $(episode).find('.runtime').text(),
                    link     : $(episode).find('.action-play').attr('href')
                }
                serie.episodes.push(episodeData);
            });
        }

        // writeFile(id, serie);

        res.send(serie);
    });
}

function writeFile(name, file){
    const dir = './data/';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    const filename = `${dir}${name}.json`;

    fs.writeFile(filename, JSON.stringify(file, null, 4), err =>
        console.log('File successfully written: ' + filename)
    );
}

app.listen('8081')
console.log('Listening on port 8081');
exports = module.exports = app;