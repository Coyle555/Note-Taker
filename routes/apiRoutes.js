const router = require ('express').Router ();
const fs = require ('fs');
const util = require ('util');
const {v4: uuidv4} = require ('uuid');

const readFromFile = util.promisify (fs.readFile);
const writeToFile = (destination, content) =>
  fs.writeFile (
    destination,
    JSON.stringify (content, null, 4),
    err =>
      err
        ? console.error (err)
        : console.info (`\nData written to ${destination}`)
  );
const readAndAppend = (content, file) => {
  fs.readFile (file, 'utf8', (err, data) => {
    if (err) {
      console.error (err);
    } else {
      const parsedData = JSON.parse (data);
      parsedData.push (content);
      writeToFile (file, parsedData);
    }
  });
};
router.get ('/notes', (req, res) => {
  readFromFile ('./db/db.json').then (data => res.json (JSON.parse (data)));
});
router.post ('/notes', (req, res) => {
  console.log (req.body);

  const {title, text} = req.body;

  if (req.body) {
    const newnote = {
      title,
      text,
      id: uuidv4 (),
    };

    readAndAppend (newnote, './db/db.json');
    res.json (`Added!`);
  } else {
    res.error ('Could not add note');
  }
});
router.delete ('/notes/:id', (req, res) => {
  const id = req.params.id;
  readFromFile ('./db/db.json').then (data => JSON.parse (data)).then (json => {
    const result = json.filter (note => note.id !== id);
    writeToFile ('./db/db.json', result);
    res.json (`Delted note.`);
  });
});

module.exports = router;
