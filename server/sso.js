import { HTTP } from 'meteor/http';
import * as Rx from "rxjs";
import { switchMap, tap, withLatestFrom } from 'rxjs/operators';

const userPassword = new Rx.Subject();
const userLogin = new Rx.Subject();

let rocketChatApi = 'https://flowz-chat.herokuapp.com/api/v1/';
let adminUser = 'admin';
let adminPass = "7)h\'dun#PAHaQ6mx";

if (/localhost/.test(process.env.ROOT_URL)) {
  rocketChatApi = 'http://docker.for.mac.localhost:3000/api/v1/';
  adminUser = 'admin123';
  adminPass = 'coba1234';
}

class SSO {
  constructor() {
    this.authTokenAdmin = '';
    this.userIdAdmin = '';

    this.cache = {};
    this.authenticateRocketChatAdmin().catch(ex => console.error(ex));
  }

  authenticateRocketChatAdmin() {
    return new Promise((resolve, reject) => {
      console.log('start authenticateRocketChatAdmin');
      HTTP.call('POST', rocketChatApi + 'login', {
        data: {
          username: adminUser,
          password: adminPass
        }
      }, (error, result) => {
        if (!error) {
          this.userIdAdmin = result.data.data.userId;
          this.authTokenAdmin = result.data.data.authToken;
          resolve();
        } else {
          reject(error)
        }
      });
    });
  }

  login(username, password) {
    const user = Meteor.user();
    return this.checkUser(username)
      .then(
        () => this.authenticateUser(username, password),
        () => this.registerUser({
            username, pass: password, email: user.emails[0].address, name: user.username
          })
          .then(() => this.authenticateUser(username, password))
      );
  }

  checkUser(username) {
    return new Promise((resolve, reject) => {
      console.log('Start check user', {
        'X-Auth-Token': this.authTokenAdmin,
        'X-User-Id': this.userIdAdmin
      });
      HTTP.call('GET', rocketChatApi + 'users.info', {
        params: { username: username },
        headers: {
          'X-Auth-Token': this.authTokenAdmin,
          'X-User-Id': this.userIdAdmin
        }
      }, (error, result) => {
        const content = JSON.parse(result.content);
        if (!error && content.user) {
          console.log('Check user is ok');
          resolve('ok');
        } else {
          console.error('Check user failed', error);
          reject(error);
        }
      });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {

      const currentUser = this.cache[Meteor.userId()];
      if (!currentUser) {
        return Promise.resolve(null);
      }
      console.log('Start logout', currentUser);
      HTTP.call('POST', rocketChatApi + 'logout', {
        headers: {
          'X-Auth-Token': currentUser.authToken,
          'X-User-Id': currentUser.userId
        }
      }, (error, result) => {
        if (!error) {
          console.log('Logout success');
          Users.update(Meteor.userId(), {$set: {'profile.rocketChatToken': ''}});
          resolve('ok');
        } else {
          console.error('Logout failed');
          reject(error);
        }
      });
    });
  }

  registerUser(payload) {
    return new Promise((resolve, reject) => {
      console.log('Register user start');
      HTTP.call('POST', rocketChatApi + 'users.register', {
        data: payload,
        headers: {
          "Content-type": "application/json"
        }
      }, function (error, result) {
        if (!error) {
          console.log('Register user ok');
          resolve();
        } else {
          console.error('Register user failed');
          reject(error);
        }
      });
    });
  }

  authenticateUser(username, password) {
    return new Promise((resolve, reject) => {
      console.log('Authenticate user start');
      HTTP.call('POST', rocketChatApi + 'login', {
        data: {
          username: username,
          password: password
        }
      }, (error, result) => {
        if (!error) {
          this.cache[Meteor.userId()] = {
            userId: result.data.data.userId,
            authToken: result.data.data.authToken
          };
          Users.update(Meteor.userId(), {$set: {'profile.rocketChatToken': result.data.data.authToken}});
          console.log('Authenticate user ok', this.userId);
          resolve();
        } else {
          console.error('Authenticate user failed');
          reject(error);
        }
      });
    });
  }
}

Meteor.methods({
  passRef(password) {
    check(password, String);
    console.log('onPass');
    userPassword.next({
      'userId': Meteor.userId(),
      'password': password
    })
  }
});

Meteor.startup(() => {
  const sso = new SSO();
  
  Accounts.onLogin(function (data) {
    console.log('onLogin');
    // if (!Meteor.user().profile.rocketChatToken) {
      userLogin.next({
        userId: data.user._id,
        username: data.user.username
      });
    // }
  });

  Accounts.onLogout(function () {
    sso.logout().catch(ex => console.error(ex));
  });

  userPassword
    .pipe(
      withLatestFrom(userLogin),
      switchMap(([p, u]) => sso.login(u.username, p.password)))
    .subscribe(() => {}, (e) => console.error(e));

  // Picker.route('/api/rocket/login', function(params, req, res, next) {
  //   res.writeHead(200, {
  //     'Content-Type': 'application/json',
  //     'Access-Control-Allow-Origin': 'http://localhost:3000',
  //     'Access-Control-Allow-Credentials': 'true'
  //   });
  //   res.write(JSON.stringify({loginToken: ''}));
  //   res.end();
  // });

});


