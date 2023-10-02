'use strict';

/* Data Access Object (DAO) module for accessing users data */

const db = require('./db');
const crypto = require('crypto');

exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email=?';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row === undefined) {
          resolve(false);
        }
        else {
          const user = { id: row.IDuser, email: row.email, name: row.name, role: row.role};
          // Check the hashes with an async call, this operation may be CPU-intensive (and we don't want to block the server)
          crypto.scrypt(password, row.salt, 32, function (err, hashedPassword) { // WARN: it is 64 and not 32 (as in the week example) in the DB
            if (err) reject(err);
            if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) // WARN: it is hash and not password (as in the week example) in the DB
              resolve(false);
            else
              resolve(user);
          });
        }
      });
    });
  };
  
exports.getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email=?';
    db.get(sql, [email], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined){
       resolve({ error: 'User not found.' });
      }
      else {
        const userID = { id: row.IDuser};
        resolve(userID);
      }
    });
  });
};