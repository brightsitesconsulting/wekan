let api_base = 'http://flowz-cms.herokuapp.com/';
let grant_type = 'client_credentials';
let client_id = '3d44ec87-1865-4d9e-b8c4-7111367c2376';
let client_secret = 'INES12northcliffe';

if (/localhost/.test(process.env.ROOT_URL)) {
  api_base = 'http://docker.for.mac.localhost:8082/';
  grant_type = 'client_credentials';
  client_id = '1f6bcc78-5a86-49ed-a395-767b756e8a7f';
  client_secret = 'coba1234';
}

export const NODE_TYPE = 'simple_article';
export let API_BASE = api_base;
export let GRANT_TYPE = grant_type;
export let CLIENT_ID = client_id;
export let CLIENT_SECRET = client_secret;
