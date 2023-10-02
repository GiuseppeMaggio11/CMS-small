'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');

exports.getPublishedPages = (date) => {
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT IDpage, name, title, creationDate, publicationDate FROM pages, users WHERE publicationDate <= ? and IDAuthor = IDuser and publicationDate <> "" '
        db.all(sql, [date], (err, rows) => {
            if (err) {
              reject(err);
            } 
            else {
              console.log(rows)
               resolve(rows)
            }
          });

    });
}

exports.getAllPages = () => {
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT IDpage, IDauthor, name, title, creationDate, publicationDate FROM pages, users WHERE IDAuthor = IDuser'
        db.all(sql, (err, rows) => {
            if (err) {
              reject(err);
            } 
            else {
               resolve(rows)
            }
          });

    });
}
exports.getPageInfo = (id) => {
  return new Promise ((resolve, reject) => {
    const sql = 'SELECT IDpage, IDauthor, name, title, creationDate, publicationDate FROM pages, users WHERE IDAuthor = IDuser and IDpage = ?'
    db.get(sql,[id],(err, row) => {
        if (err) {
          reject(err);
        } 
        if (row == undefined) {
          resolve({ error: 'Page not found.' });
        }
        else {
           resolve(row)
        }
      });

});

}
exports.getBlocks = (id) => {
  return new Promise ((resolve, reject) => {
    const sql = 'SELECT * FROM blocks WHERE blocks.idPage = ?'
    db.all(sql, [id], (err,rows) => {
      if(err) {
        reject(err);
      }
      else {
        resolve(rows)
      }
    })
  })
}

exports.addBlocks = (idPage, blockData) => {
  return new Promise ((resolve, reject) => {
    const sql = 'INSERT INTO blocks (type, content, idPage, position) VALUES (?, ?, ?, ?)';
    let currentIndex = 0;
    function insertNextBlock() {
      if (currentIndex >= blockData.length) {
        resolve();
        return;
      }
      const currentBlock = blockData[currentIndex];
      const values = [currentBlock.type, currentBlock.content, idPage, currentBlock.position];

      db.run(sql, values, function (err) {
        if (err) {
          reject(err);
          return;
        }
        currentIndex++;
        insertNextBlock();
      });
    }
    insertNextBlock();
  });
}

exports.deleteBlocks = (id) => {
  return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM blocks WHERE IDpage=?';
      db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        }
        else
          resolve(null);
      }); 
  });
}

exports.addPage = (pageData) => {
  return new Promise ((resolve, reject) => {
    const sql = 'INSERT INTO pages (IDauthor,title,creationDate,publicationDate) VALUES (?,?,?,?)';
    db.run(sql, [pageData.IDauthor,pageData.title,pageData.creationDate,pageData.publicationDate], function (err, row) {
      if (err) {
        reject(err);
      }
      resolve(this.lastID);
    });
  })
}

exports.updatePage = (role, pageData) => {
  if(role==="Admin"){
    return new Promise ((resolve, reject) => {
      const sql = 'UPDATE pages SET IDauthor=?, title=?, creationDate=?, publicationDate=? WHERE IDpage=?';
      db.run(sql, [pageData.IDauthor,pageData.title,pageData.creationDate,pageData.publicationDate, pageData.IDpage], function (err, row) {
        if (err) {
          reject(err);
        }
        resolve({});
      });
    })
  } else {
    return new Promise ((resolve, reject) => {
      const sql = 'UPDATE pages SET title=?, creationDate=?, publicationDate=? WHERE IDpage=? and IDauthor=?';
      db.run(sql, [pageData.title,pageData.creationDate,pageData.publicationDate, pageData.IDpage, pageData.IDauthor], function (err, row) {
        if (err) {
          reject(err);
        }
        console.log(this)
        if (this.changes === 0) {
          resolve({ error: 'No page was updated.' });
        } else {
          resolve({}); 
        }
      });
    })
  }
}

exports.deletePage = (id) => {
  return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM pages WHERE IDpage=?';
      db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        }
        if (this.changes !== 1)
          resolve({ error: 'No page deleted.' })
        else
          resolve(null);
      }); 
  });
}
exports.deleteBlocks = ( id) => {
  return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM blocks WHERE IDpage=?';
      db.run(sql, [id], function (err) {
        if (err) {
          reject(err);
        }
        else
          resolve(null);
      });  
  });
}

exports.getWebPageName = () => {
    return new Promise ((resolve, reject) => {
        const sql = 'SELECT * FROM website'
        db.get(sql, (err, row) => {
            if (err) {
              reject(err);
            } 
            else {
               resolve(row)
            }
          });

    });
}

exports.newNameWebPage = (name) => {
    return new Promise ((resolve, reject) => {
        const sql = 'UPDATE website SET name=?';
        db.run(sql,[name],(err, row) => {
            if (err) {
              reject(err);
            } 
            else {
               resolve(exports.getWebPageName())
            }
          });

    });
}