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
      if (title && cmsId) {
        const list = Lists.findOne(listId);
        const status = listStatus(list.title);
        if (cmsId && status !== -1) {
          cms.update(cmsId,  {title, status})
            .then(res => console.log('Successfully update the article. ' + res.data.id))
            .catch(ex => console.error(ex))
        }
      }
    },
    removed({cmsId}) {
      if (cmsId) {
        cms.delete(cmsId)
          .then(res => console.log('Successfully removing the article.'))
          .catch(ex => console.error(ex))
      }
    },
    added(obj) {
      if (!handle) return;
      const {title} = Lists.findOne(obj.listId);
      if (title) {
        const label = title.toLowerCase();
        if (/^draft/.test(label)) {
          cms.create({title: obj.title})
            .then(({data}) => saveCMSID(obj._id, data.id))
            .then((x) => console.log('Article successfully created.', x))
            .catch(ex => console.error(ex))
        }
      }
    }
  });

});
