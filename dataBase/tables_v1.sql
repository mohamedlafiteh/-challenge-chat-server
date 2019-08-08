drop table if exists message;
drop table if exists chatUser;

CREATE TABLE chatUser (
     
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(15) NOT NULL,
    img_url VARCHAR(200)
);

CREATE TABLE message (

    id SERIAL PRIMARY KEY ,
    text VARCHAR(200) NOT NULL,
    chatUser_id INT REFERENCES chatUser(id),
    time_sent TIMESTAMP NOT NULL
);

insert into chatUser (name) values ('Diego');
insert into chatUser (name)  values ('Mohamed');

insert into message (text,chatUser_id,time_sent) values ('Hello',1,'2019-07-30T10:42:54.562Z');

grant all privileges on table chatUser to chatadmin;
grant all privileges on sequence chatUser_id_seq to chatadmin;
grant all privileges on table message to chatadmin;
grant all privileges on sequence message_id_seq to chatadmin;