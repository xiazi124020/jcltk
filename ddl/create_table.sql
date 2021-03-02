
drop table IF EXISTS employee;
drop table IF EXISTS department;
drop table IF EXISTS project;
drop table IF EXISTS customer;


CREATE TABLE customer (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  zip varchar(7) NOT NULL,
  address varchar(100) NOT NULL,
  tel_no varchar(15) NOT NULL,
  email varchar(100) DEFAULT NULL,
  partener int NOT NULL,
  Representative varchar(20) NOT NULL,
  project_id int DEFAULT NULL,
  station varchar(20),
  PRIMARY KEY (id)
);


CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '��L�[',
  `name` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `station` varchar(20) DEFAULT NULL,
  `status` int DEFAULT NULL,
  `customer_id` int DEFAULT NULL,
  `seisan` int DEFAULT NULL,
  `min_time` int DEFAULT NULL,
  `max_time` int DEFAULT NULL,
  `delete_falg` int DEFAULT NULL,
  
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`)
);

CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
CREATE TABLE employee (
  emp_id varchar(10) NOT NULL COMMENT '�Ј��ԍ�',
  department_id int DEFAULT NULL COMMENT '����ԍ�',
  project_id int DEFAULT NULL COMMENT '�v���W�F�N�g�ԍ�',
  first_name varchar(15)  COMMENT '���O�P',
  last_name varchar(15) COMMENT '���O�Q',
  first_name_kana varchar(15) COMMENT '�J�i�P',
  last_name_kane varchar(15) COMMENT '�J�i�Q',
  sex varchar(1) NOT NULL COMMENT '����',
  birthday date NOT NULL COMMENT '���N����',
  zip varchar(7) DEFAULT NULL COMMENT '�X�֔ԍ�',
  address1 varchar(10) DEFAULT NULL COMMENT '�Z��1',
  address2 varchar(50) DEFAULT NULL COMMENT '�Z��2',
  email varchar(30) NOT NULL COMMENT '���[���A�h���X',
  residence_no varchar(15) DEFAULT NULL COMMENT '�ݗ��J�[�h�ԍ�',
  tel varchar(15) DEFAULT NULL COMMENT '�d�b�ԍ�',
  entry_date date NOT NULL COMMENT '���Г��t',
  quit_date date DEFAULT NULL COMMENT '���C���t',
  at_japan_date date NOT NULL COMMENT '�����N��',
  start_work_date date DEFAULT NULL COMMENT '�d���o��',
  japanese_level int DEFAULT NULL COMMENT '���{��\��',
  emp_type int,
  salary int,
  price int COMMENT '�P��',
  Transport_cost int COMMENT '��ʔ�',
  status int,
  station int COMMENT '�w',
  position int COMMENT '�E��',
  sales_id varchar(10) COMMENT '�c�ƒS��ID',
  project_end_plan_date date COMMENT '�v���W�F�N�g�\��I����',
  kbn int,
  delete_falg int,
  PRIMARY KEY (emp_id),
  KEY department_id (department_id),
  KEY project_id (project_id),
  CONSTRAINT employee_ibfk_1 FOREIGN KEY (department_id) REFERENCES department (id),
  CONSTRAINT employee_ibfk_2 FOREIGN KEY (project_id) REFERENCES project (id)
) 