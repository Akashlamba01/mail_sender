const express = require('express')
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs')
const multer = require('multer')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./images");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

var upload = multer({
  storage: Storage
}).single("image"); //Field name and max count

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/sendemail', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.log(err)
      return res.end("Something went wrong!");
    } else {
      var data = req.body;
      to = data.to
      subject = data.subject
      body = data.subject
      path = req.file.path

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'INSERT YOUR EMAIL',  //put your email for better eprince
          pass: 'INSERT YOUR PASSWORD'
        }
      });

      var mailOptions = {
        from: 'INSERT YOUR EMAIL',
        to: to,
        subject: subject,
        text: body,
        attachments: [
          {
            path: path
          }
        ]
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          fs.unlink(path, function (err) {
            if (err) {
              return res.end(err)
            } else {
              console.log("deleted")
              return res.redirect('/result.html')
            }
          })
        }
      });
    }
  })
})

app.listen(8080, () => {
  console.log("Surver Running")
})
