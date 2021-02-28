CREATE TABLE project (
  id int NOT NULL AUTO_INCREMENT COMMENT 'éÂÉLÅ[',
  name varchar(50) NOT NULL,
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  station varchar(20) DEFAULT NULL,
  status int DEFAULT NULL,
  customer_id int DEFAULT NULL,
  delete_falg int,
  PRIMARY KEY (id),
  KEY customer_id (customer_id),
  CONSTRAINT project_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customer (id)
) 