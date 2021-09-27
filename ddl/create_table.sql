
drop table IF EXISTS employee;
drop table IF EXISTS department;
drop table IF EXISTS project;
drop table IF EXISTS customer;
drop table IF EXISTS code;


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
  delete_flag int NOT NULL default 0,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);


CREATE TABLE project (
  id int NOT NULL AUTO_INCREMENT COMMENT 'åL[',
  name varchar(50) NOT NULL,
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  station varchar(20) DEFAULT NULL,
  status int DEFAULT NULL,
  customer_id int DEFAULT NULL,
  seisan int DEFAULT 0,
  min_time int DEFAULT 150,
  max_time int DEFAULT 200,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  delete_flag int NOT NULL default 0,
  PRIMARY KEY (id),
  KEY customer_id (customer_id),
  CONSTRAINT project_idfk_1 FOREIGN KEY (customer_id) REFERENCES customer (id) 
);

CREATE TABLE department (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE employee (
  emp_id varchar(10) NOT NULL COMMENT 'ÐõÔ',
  department_id int DEFAULT NULL COMMENT 'åÔ',
  project_id int DEFAULT NULL COMMENT 'vWFNgÔ',
  first_name varchar(15)  COMMENT '¼OP',
  last_name varchar(15) COMMENT '¼OQ',
  first_name_kana varchar(15) COMMENT 'JiP',
  last_name_kana varchar(15) COMMENT 'JiQ',
  sex varchar(1) NOT NULL COMMENT '«Ê',
  birthday date DEFAULT NULL COMMENT '¶Nú',
  zip varchar(7) DEFAULT NULL COMMENT 'XÖÔ',
  address1 varchar(10) DEFAULT NULL COMMENT 'Z1',
  address2 varchar(50) DEFAULT NULL COMMENT 'Z2',
  email varchar(30) DEFAULT NULL COMMENT '[AhX',
  residence_no varchar(15) DEFAULT NULL COMMENT 'Ý¯J[hÔ',
  tel varchar(15) DEFAULT NULL COMMENT 'dbÔ',
  entry_date date NOT NULL COMMENT 'üÐút',
  quit_date date DEFAULT NULL COMMENT '£Cút',
  start_work_date varchar(20) DEFAULT NULL COMMENT 'do±',
  japanese_level int DEFAULT NULL COMMENT 'ú{ê\Í',
  emp_type int COMMENT 'ÐõíÊ',
  salary int COMMENT '¿',
  price int COMMENT 'P¿',
  Transport_cost int COMMENT 'ðÊï',
  status int,
  station varchar(20) COMMENT 'w',
  position int COMMENT 'EÊ',
  sales_id varchar(10) COMMENT 'cÆSID',
  project_end_plan_date date COMMENT 'vWFNg\èI¹ú',
  delete_flag int NOT NULL default 0,
  PRIMARY KEY (emp_id),
  KEY department_id (department_id),
  KEY project_id (project_id),
  CONSTRAINT employee_idfk_1 FOREIGN KEY (department_id) REFERENCES department (id) ,
  CONSTRAINT employee_idfk_2 FOREIGN KEY (project_id) REFERENCES project (id));

CREATE TABLE code (
  id int NOT NULL AUTO_INCREMENT COMMENT 'åL[',
  code_id int,
  name varchar(50) NOT NULL,
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

--aÌR§
--kC¹
--ºÉ§
--§
--ª§
--ä§
--xR§
--ÞÇ§
--ÈØ§
--¿§
--s
--ª§
--¹æ§
--·ì§
--·è§
--åª§
--åã{
--çt§
--Îì§
--Ãª§
--ÂX§
--_Þì§
--V§
--Hc§
--­§
-- ê§
--R§
--Rû§
--R`§
--Od§
--éÊ§
--²ê§
--m§
--ì§
--L§
--Qn§
--F{§
--s{
--{é§
--{è§
--ò§
--âè§
--«ê§
--ªR§
--ïé§
--¤Q§
--¤m§
