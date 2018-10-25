import { HTTP } from 'meteor/http';
import {
  GRANT_TYPE, CLIENT_ID, CLIENT_SECRET, API_BASE
} from './cms-constant';
import { serialize } from './helper';

export class Connection {
  constructor() {
    this.token = null;
    this.sessionToken= null;
  }

  getToken() {
    return new Promise((resolve, reject) => {
      Promise.all([this.initConnection(), this.getSessionToken()])
        .then(([token, session]) => {
          this.accessToken = token.access_token;
          this.sessionToken = session.content;
          resolve([token.access_token, session.content]);
        })
        .catch((ex) => {
          reject(ex);
          console.error(ex)
        });
    })
  }

  initConnection() {
    return new Promise((resolve, reject) => {
      HTTP.call('POST', API_BASE + 'oauth/token', {
        content: serialize({
          client_id: CLIENT_ID,
          grant_type: GRANT_TYPE,
          client_secret: CLIENT_SECRET
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }, (error, res) => {
        if (!error) {
          resolve(res.data);
        } else {
          reject(error)
        }
      });
    });
  }

  getSessionToken() {
    return new Promise((resolve, reject) => {
      HTTP.call('GET', API_BASE + 'rest/session/token', (err, res) => {
        if (!err) {
          return resolve(res);
        }
        reject(err);
      });
    });
  }

}

