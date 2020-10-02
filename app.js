const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./schema/schema");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 9000;

app.use(cors());

// connect to mlab database
// make sure to replace my db string & creds with your own
mongoose.connect(
  "mongodb+srv://simran:simran@cluster0.oa3gl.mongodb.net/bookdb-graphql?retryWrites=true&w=majority",
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.connection.once("open", () => {
  console.log("conneted to database");
});

//middleware
// bind express with graphql,
//so any request comees with '/graphql' express forwards it to 'graphqlHTTP'
app.use(
  "/graphql",
  graphqlHTTP({
    // pass in a schema property & this scema will be passed as options
    //and let graphql knows or understand the data types, its attributes and further its propertes

    schema: schema,
    graphiql: true,
  })
);

//listen
app.listen(port, () => console.log(`Listening at localhost: ${port}`));
