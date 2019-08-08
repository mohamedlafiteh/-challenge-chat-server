select message.id,message.text,message.time_sent, chatUser.name,chatUser.img_url from message inner join chatUser on message.chatUser_id=chatUser.id;

