const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');


let transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

let generateHTML = (filename, options = {}) => {
  let html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  // make styles inline
  return juice(html);
}

exports.send = async (options) => {

  let html = generateHTML(options.filename, options);
  let text = htmlToText.fromString(html);

  let mailOptions = {
    from: "Good Food <noreply@tutstuts.com>",
    to: options.user.email,
    subject: options.subject,
    html,
    text
  };

  let sendMail = promisify(transport.sendMail.bind(transport));
  return sendMail(mailOptions);
}