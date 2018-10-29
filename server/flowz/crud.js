import { HTTP } from 'meteor/http';
import { NODE_TYPE, API_BASE } from './cms-constant';
import axios from 'axios';

const defaultPayloadArticle = {
  "data": {
    "type": "node--simple_article",
    "attributes": {
      "revision_log": null,
      "status": false,
      "title": "Default abc title",
      "promote": false,
      "sticky": false,
      "default_langcode": true,
      "revision_translation_affected": true,
      "path": {
        "alias": null,
        "pid": null,
        "langcode": "en"
      },
      "body": {
        "value": "Body vvv text here",
        "format": "basic_html",
        "summary": ""
      }
    }
  },
  "jsonapi": {
    "version": "1.0",
    "meta": {
      "links": {
        "self": "http://jsonapi.org/format/1.0/"
      }
    }
  },
  "links": {
    "self": "http://contenta.local/api/node/simple_article"
  }
};


const defaultEditPayloadArticle = {
  "data": {
    "type": "node--simple_article",
    "id": "",
    "attributes": {
    }
  }
};

export class CRUD {
  constructor(connection) {
    this.connection = connection;
  }

  async auth() {
    await this.connection.getToken();
  }

  async create(payload) {
    await this.connection.getToken();
    defaultPayloadArticle.data.attributes.title = payload.title;
    return axios({
      method: 'POST',
      url: API_BASE + 'api/node/' + NODE_TYPE,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + this.connection.accessToken,
        'X-CSRF-Token': this.connection.sessionToken
      },
      data: JSON.stringify(defaultPayloadArticle)
    }).then(({data}) => data);
  }

  read() {
  }

  async update(cmsId, payload) {
    await this.connection.getToken();
    defaultEditPayloadArticle.data.id = cmsId;
    defaultEditPayloadArticle.data.attributes = payload;
    return axios({
      method: 'PATCH',
      url: `${API_BASE}api/node/${NODE_TYPE}/${cmsId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + this.connection.accessToken,
        'X-CSRF-Token': this.connection.sessionToken
      },
      data: JSON.stringify(defaultEditPayloadArticle)
    }).then(({data}) => data);
  }

  async delete(cmsId) {
    await this.connection.getToken();
    return axios({
      method: 'DELETE',
      url: `${API_BASE}api/node/${NODE_TYPE}/${cmsId}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
        'Authorization': 'Bearer ' + this.connection.accessToken,
        'X-CSRF-Token': this.connection.sessionToken
      }
    }).then(({data}) => data);
  }
}
