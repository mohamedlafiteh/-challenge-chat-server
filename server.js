const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

const pool = new Pool({
  user: "chatadmin",
  host: "localhost",
  database: "cyf_chat",
  password: "pword123",
  port: 5432
});

app.listen(3004);

app.get("/messages", function(req, res) {
  pool.query(
    `select message.id, message.text, message.time_sent as created_at, chatUser.name as from, chatUser.img_url
     from message inner join chatUser on message.chatUser_id = chatUser.id
     order by message.time_sent;`,
    (error, result) => {
      if (error) {
        console.log(error);
        res.status(400).send("db error");
      } else {
        res.send(result.rows);
      }
    }
  );
});

app.post("/messages", function(req, res) {
  console.log("reach POST /messages");
  console.log(req.body);

  const message = req.body;
  if (
    message.from &&
    message.text &&
    message.from.length > 0 &&
    message.text.length > 0
  ) {
    message.timeSent = new Date();
    //TODO write your SQL query
    pool.query(
      `SELECT id FROM chatuser WHERE name = '${message.from}'`,
      (error, result) => {
        if (error) {
          console.log(error);
          res.status(400).send("failed looking up chat users");
        } else {
          console.log(result.rows);
          let chatUserId = result.rows;

          // Did we find the user in the database?
          if (chatUserId.length < 1) {
            res.status(400).send("`user not found in the database");
          } else {
            let query = `INSERT INTO message (text, chatuser_id, time_sent) values('${
              message.text
            }', ${chatUserId[0].id}, '${message.timeSent.toISOString()}');`;
            // need to add string corresponding to "('<message text>', <user id>, '<time>');"

            pool.query(query, (error, result) => {
              if (error) {
                console.log(error);
                res.status(400).send("failed inserting a message");
              } else {
                res.send("message sent");
              }
            });
          }
        }
      }
    );
  } else {
    res.status(419).send("sorry message  invalid");
  }
});

app.delete("/messages/:messageId", function(req, res) {
  const messageId = req.params.messageId;

  pool
    .query("DELETE FROM message WHERE id=$1", [messageId])
    .then(() => res.send(`message ${messageId} deleted!`))
    .catch(e => console.error(e));

  //   console.log(req.params.messageId);
  //   let index = messagesLIst.findIndex(message => {
  //     return message.id === parseInt(req.params.messageId);
  //   });
  //   console.log(index);

  //   if (index !== -1) {
  //     messagesLIst.splice(index, 1);
  //     res.send(messagesLIst);
  //   } else {
  //     res.status(400).send({ error: "Id not found" });
  //   }

  // messagesLIst = messagesLIst.filter(message => {
  //   return message.id != req.params.messageId;
  //   // });
});

app.put("/messages", (req, res) => {
  const newMessage = req.body;

  getMessage(newMessage.id, originalMessage => {
    if (originalMessage) {
      originalMessage.text = newMessage.text;
      originalMessage.from = newMessage.from;
      //TODO EXECUT QUERY TO UPDATE DB

      const messageId = req.body.id;
      const newText = req.body.text;

      pool
        .query("UPDATE message SET text=$1 WHERE id=$2", [newText, messageId])
        .then(() => res.send(`Message ${messageId} updated!`))
        .catch(e => console.error(e));

      // res.send("message updated");
    } else {
      res.status(400).send("sorry message  invalid");
    }
  });
});

// app.get("/messages/search", function(req, res) {
//   const text = req.query.text;

//   const messages = messagesLIst.filter(message => {
//     return message.text.includes(text);
//   });
//   if (messages.length > 0) {
//     res.send(messages);
//   } else {
//     res.send("sorry message not found");
//   }
//   //} else {
//   //  res.send("sorry message not found");
//   //}
// });
// app.get("/messages/latest", (req, res) => {
//   res.send(messagesLIst.slice(-10));
// });

// app.get("/messages/:messageId", function(req, res) {
//   const message = getMessage(parseInt(req.params.messageId));
//   if (message) {
//     res.send(message);
//   } else {
//     res.status(400).send("message not found");
//   }
// });

function getMessage(id, resultCallback) {
  pool.query(`select id from message where id=${id};`, (error, result) => {
    if (error) {
      resultCallback(null);
    } else if (result.rowCount == 0) {
      resultCallback(null);
    } else {
      resultCallback(result.rows[0]);
    }
  });
}
