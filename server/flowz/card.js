import {Connection} from './connection';
import {CRUD} from './crud';

Meteor.startup(() => {
  const connection = new Connection();
  const cms = new CRUD(connection);
  const cursor = Cards.find({});

  var handle = cursor.observeChanges({
    added(id, obj) {
      if (!handle) return;
      const {title} = Lists.findOne(obj.listId);
      if (title) {
        const label = title.toLowerCase();
        if (label === 'draft') {
          cms.create({title: obj.title})
            .then(_ => console.log('Article successfully created.'))
            .catch(error => {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
              }
              console.log(error.config);
            });
        }
      }
    }
  });

});
