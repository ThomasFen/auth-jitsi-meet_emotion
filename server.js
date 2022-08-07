
import openid from 'express-openid-connect';
import jwt from 'jsonwebtoken';
import express from 'express';

const {sign: jwtSign} = jwt;
const {auth} = openid;
const JITSI = 'jitsi';
const PORT = 3000;
const {JITSI_SECRET, JITSI_PUB_URL, JITSI_SUBJECT} = process.env;
const config = {
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  secret: process.env.SECRET,  
};
const app = express();

app.use(auth(config));

function sign(name, email, id, allowedRoom, isPhysician) {
  return jwtSign({
    context: {
      user: {name, email, id, isPhysician}
    },
    aud: JITSI,
    iss: JITSI,
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