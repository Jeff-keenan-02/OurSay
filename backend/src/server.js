const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const verifyRoutes = require('./routes/verify.routes');
const discussionRoutes = require('./routes/discussion.routes');
const pollRoutes = require('./routes/poll.routes');
const petitionRoutes = require("./routes/petition.routes");


const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/verify', verifyRoutes);
app.use('/discussions', discussionRoutes);
app.use('/poll', pollRoutes);
app.use("/petitions", petitionRoutes);

app.listen(3000, () => {
  console.log('Backend running on port 3000');
});