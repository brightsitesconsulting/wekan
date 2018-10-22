BlazeComponent.extendComponent({
}).register('rocketChat');

Template.rocketChat.helpers({
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

