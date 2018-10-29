import {Connection} from './connection';
import {CRUD} from './crud';

Meteor.startup(() => {
  const connection = new Connection();
  const cms = new CRUD(connection);
  const cursor = Cards.find({});

  cms.auth().catch(ex => console.error(ex));

  const saveCMSID = (cardId, cmsId) => {
    Cards.update({_id: cardId}, {$set: {cmsId}});
    return Promise.resolve([cardId, cmsId]);
  };

  const listStatus = (title) => {
    const columnName = title.toLowerCase();
    switch (true) {
      case /^draft/.test(columnName):
        return 0;
      case /^publish/.test(columnName):
        return 1;
    }
    return -1;
  };

  var handle = cursor.observe({
    changed(doc) {
      const {cmsId, title, listId} = doc;
      const list = Lists.findOne(listId);
      const status = listStatus(list.title);

      if (!title) return;

      if (cmsId) {
        if (cmsId && status !== -1) {
          cms.update(cmsId,  {title, status})
            .then(res => console.log('Successfully update the article. ' + res.data.id))
            .catch(ex => console.error(ex))
        }
      } else if (status !== -1) {
        cms.create({title, status})
          .then(({data}) => saveCMSID(doc._id, data.id))
          .then(res => console.log('Article successfully created.' + res.data.id))
          .catch(ex => console.error(ex))
      }
    },
    removed({cmsId}) {
      if (cmsId) {
        cms.delete(cmsId)
          .then(res => console.log('Successfully removing the article.'))
          .catch(ex => console.error(ex))
      }
    },
    added(doc) {
      if (!handle) return;
      const {title} = Lists.findOne(doc.listId);
      if (title) {
        const label = title.toLowerCase();
        if (/^draft/.test(label)) {
          cms.create({title: doc.title})
            .then(({data}) => saveCMSID(doc._id, data.id))
            .then((x) => console.log('Article successfully created.', x))
            .catch(ex => console.error(ex))
        }
      }
    }
  });

});
