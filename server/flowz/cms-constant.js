export const NODE_TYPE = 'simple_article';

if (/localhost/.test(process.env.ROOT_URL)) {
  export const API_BASE = 'http://docker.for.mac.localhost:8082/';
  export const GRANT_TYPE = 'client_credentials';
  export const CLIENT_ID = '1f6bcc78-5a86-49ed-a395-767b756e8a7f';
  export const CLIENT_SECRET = 'coba1234';
} else {
  export const API_BASE = 'https://flowz-cms.herokuapp.com';
  export const GRANT_TYPE = 'client_credentials';
  export const CLIENT_ID = '3d44ec87-1865-4d9e-b8c4-7111367c2376';
  export const CLIENT_SECRET = 'INES12northcliffe';
}


