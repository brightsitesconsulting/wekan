AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');

AccountsTemplates.addFields([{
  _id: 'email',
  type: 'email',
  required: true,
  displayName: 'Work email',
  re: /.+@(.+){2,}\.(.+){2,}/,
  errStr: 'Invalid email',
},
{
  _id: 'password',
  type: 'password',
  required: true,
  minLength: 6,
  re: /(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
  errStr: 'At least 1 digit, 1 lower-case and 1 upper-case',
},
]);

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
    errors: {
      loginForbidden: 'error.accounts.Please try again',
      pwdMismatch: 'error.pwdsDontMatch',
      validationErrors: 'Validation Errors',
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
