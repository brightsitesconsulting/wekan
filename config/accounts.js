
AccountsTemplates.configure({
  defaultLayout: 'userFormsLayout',
  defaultContentRegion: 'content',
  confirmPassword: false,
  enablePasswordChange: true,
  sendVerificationEmail: true,
  showForgotPasswordLink: false,
  hideSignUpLink: true,
  showLabels: true,
  negativeValidation: true,
  negativeFeedback: true,
  showPlaceholders: false,
  focusFirstInput: false,
  texts: {
    title: {
      changePwd: '',
      forgotPwd: '',
      signIn: '',
    },
    button: {
      signIn: 'Jump in',
    },
  },
  onLogoutHook() {
    const homePage = 'home';
    if (FlowRouter.getRouteName() === homePage) {
      FlowRouter.reload();
    } else {
      FlowRouter.go(homePage);
    }
  },
});

['signIn',
  'signUp',
  'resetPwd',
  // 'forgotPwd',
  'enrollAccount'].forEach(
  (routeName) => AccountsTemplates.configureRoute(routeName));

AccountsTemplates.configureRoute('changePwd', {
  redirect() {
    // XXX We should emit a notification once we have a notification system.
    // Currently the user has no indication that his modification has been
    // applied.
    Popup.back();
  },
});

if (Meteor.isServer) {

  ['resetPassword-subject', 'resetPassword-text', 'verifyEmail-subject', 'verifyEmail-text', 'enrollAccount-subject', 'enrollAccount-text'].forEach((str) => {
    const [templateName, field] = str.split('-');
    Accounts.emailTemplates[templateName][field] = (user, url) => {
      return TAPi18n.__(`email-${str}`, {
        url,
        user: user.getName(),
        siteName: Accounts.emailTemplates.siteName,
      }, user.getLanguage());
    };
  });
}
