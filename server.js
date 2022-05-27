
import openid from 'express-openid-connect';
import jwt from 'jsonwebtoken';
import express from 'express';
import dns from 'dns';
// import 'dotenv/config';

const {sign: jwtSign} = jwt;
const {auth} = openid;

const JITSI = 'jitsi';

const PORT = 3000;

const {JITSI_SECRET, JITSI_PUB_URL, JITSI_SUBJECT} = process.env;


async function lookupPromise(){
  return new Promise((resolve, reject) => {
      dns.lookup("host.docker.internal", (err, address, family) => {
          if(err) reject(err);
          resolve(address);
      });
 });
};

try{
  const address = await lookupPromise();



const config = {
  baseURL: "http://localhost:3000",
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: `http://${address}:8080/realms/jitsi-emotion`,
  secret: process.env.SECRET,  
  // authorizationParams: {

  //     scope: 'openid profile email roles'
  // }
};


// const ISSUER_BASE_URL='http://192.168.2.57:8080/realms/jitsi-emotion'
// const CLIENT_ID='jitsi-meet-emotion'
// const BASE_URL='http://192.168.2.57:3000'
// const SECRET='ONfPglbveOd4kgskX8uPMJUOkWnmNDow'


// const JITSI_PUB_URL='https://192.168.2.57:8443'
// const JITSI_SECRET='254uni5DFCY25hvb233bjHJBm6l34j5hb43hb3Fuy23ebwuyfMDWft2'
// const JITSI_SUBJECT='jitsi-meet-emotion'

// const config = {
//   baseURL: BASE_URL,
//   clientID: CLIENT_ID,
//   issuerBaseURL: ISSUER_BASE_URL,
//   secret: SECRET,  
//   // authorizationParams: {

//   //     scope: 'openid profile email roles'
//   // }
// };





const app = express();




app.use(auth(config));

function sign(name, email, id, allowedRoom, isPhysician) {
  return jwtSign({
    context: {
      user: {name, email, id, isPhysician}
    },
    aud: JITSI,
    iss: JITSI,
    // isPhysician: isPhysician,
    sub: JITSI_SUBJECT,
    room: allowedRoom
  }, JITSI_SECRET);
}

app.get('/room/:room', (req, res) => {
  if (!req.oidc.user) {
    throw new Error('Missing user information.');
  }

  const {sub, name, email} = req.oidc.user;
  const isPhysician = req.oidc.user.roles.includes('Physician');



  const token = sign(name, email, sub, req.params.room, isPhysician);

  const params = new URLSearchParams();
  params.set('jwt', token);

  res.redirect(`${JITSI_PUB_URL}/${req.params.room}?${params.toString()}`);
});

app.listen(PORT, () => console.log(`Http Server is listening on port ${PORT}.`));

}catch(err){
  console.error(err);
}


