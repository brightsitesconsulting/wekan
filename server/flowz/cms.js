import { Connection } from './connection';
import { CRUD } from './crud';

const connection = new Connection();
const cms = new CRUD(connection);

Meteor.methods({
  async fetchCMSData(cmsId) {
    check(cmsId, String);
    const {data: {attributes: {body: {value}}}} = await cms.read(cmsId)
      .catch(ex => console.error(ex));
    return {body: value}
  },
  async saveCMSData(data) {
    check(data, Object);
    const {body, cmsId} = data;
    await cms.update(cmsId, {body: {
      value: body
      }});
    return true;
  }
});
