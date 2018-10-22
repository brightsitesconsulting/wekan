BlazeComponent.extendComponent({
  events() {
    return [{
      'click .js-toggle-chat'(evt) {

        const txt = $(evt.target).text();
        if (txt === 'Close') {
          $(evt.target).text('Open');
          // $(evt.target).next().show('hide');
        } else {
          $(evt.target).text('Close');
          // $(evt.target).next().hide();
        }
        $(evt.target).next().slideToggle();
      }
    }];
  }
}).register('rocketChat');

Template.rocketChat.helpers({
  rocketChatAction() {
    return "xx";
  },
  getRocketChatHostname() {
    if (/localhost/.test(window.location.hostname)) {
      return 'http://localhost:3000';
    }
    return 'https://flowz-chat.herokuapp.com';
  },
  rocketChatToken() {
    const user = Meteor.user();
    setTimeout(() => {
      $('iframe#rocketChat')[0].contentWindow.postMessage({
        externalCommand: 'login-with-token',
        token: user.profile.rocketChatToken
      }, '*')
    }, 5000); // TODO: find reliable way when the rocket chat is ready
    return user.profile.rocketChatToken;
  }
});

