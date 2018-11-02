import InlineEditor from '@ckeditor/ckeditor5-build-inline';

BlazeComponent.extendComponent({
  onCreated() {
    const {cmsId} = this.currentData();
    if (cmsId) {
      this.body = new ReactiveVar('Loading...');
      Meteor.call('fetchCMSData', cmsId, (err, ret) => {
        this.body.set(ret.body);
        setTimeout(() => InlineEditor.create(document.getElementById('cmsBody'))
          .then(editor => this.editorBody = editor));
      });
    }
  },
  getBody() {
    return this.body.get();
  },
  events() {
    return [{
      'submit form.cms-edit'(event) {
        event.preventDefault();

        const target = event.target;
        const body = this.editorBody.getData();

        const {cmsId} = this.currentData();

        Meteor.call('saveCMSData', {
          body, cmsId
        }, (err, ret) => {
          if (err) {
            console.error(err)
          }
        });
      },
    }]
  }
}).register('cmsEdit');


