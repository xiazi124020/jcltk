CREATE TABLE customer (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  zip varchar(7) NOT NULL,
  address varchar(100) NOT NULL,
  tel_no varchar(15) NOT NULL,
  email varchar(100) DEFAULT NULL,
  partener int NOT NULL,
  Representative varchar(20) NOT NULL,
  station varchar(20),
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP
  PRIMARY KEY (id)
)