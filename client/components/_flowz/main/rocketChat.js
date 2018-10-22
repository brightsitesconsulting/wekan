BlazeComponent.extendComponent({
}).register('rocketChat');

Template.rocketChat.helpers({
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

