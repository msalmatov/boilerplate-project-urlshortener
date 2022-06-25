require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const urlparser = require("url");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const shorturlSchema = new mongoose.Schema({
  shorturl: "string"
});
const Shorturl = mongoose.model("Shorturl", shorturlSchema);


// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  const bodyurl = req.body.url;
  const something = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address) => {
    if (error || !address) {
      return res.json({error: "Invalid URL"});
    } else {
      const url = new Shorturl({shorturl: req.body.url});
      url.save((err, data) => {
        if (err) return console.log(err);
        console.log(data);
        res.json({ original_url: data.shorturl, short_url: data.id});
      });
    }
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  Shorturl.findById(id, (err, data) => {
    if (err) return console.log(err);
    if (!data) {
      res.json({error: "Invalid URL"});
    } else {
      res.redirect(data.shorturl);
    }
    
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
