const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const verifyRoutes = require('./routes/verify.routes');
const discussionRoutes = require('./routes/discussion.routes');
const pollRoutes = require('./routes/poll.routes');
const petitionRoutes = require("./routes/petition.routes");
const topicRoutes = require("./routes/topic.routes");



const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/verify', verifyRoutes);
app.use('/discussions', discussionRoutes);
app.use('/poll', pollRoutes);
app.use("/petitions", petitionRoutes);
app.use("/topics", topicRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});