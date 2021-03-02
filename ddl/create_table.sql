
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
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主キー',
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
  emp_id varchar(10) NOT NULL COMMENT '社員番号',
  department_id int DEFAULT NULL COMMENT '部門番号',
  project_id int DEFAULT NULL COMMENT 'プロジェクト番号',
  first_name varchar(15)  COMMENT '名前１',
  last_name varchar(15) COMMENT '名前２',
  first_name_kana varchar(15) COMMENT 'カナ１',
  last_name_kane varchar(15) COMMENT 'カナ２',
  sex varchar(1) NOT NULL COMMENT '性別',
  birthday date NOT NULL COMMENT '生年月日',
  zip varchar(7) DEFAULT NULL COMMENT '郵便番号',
  address1 varchar(10) DEFAULT NULL COMMENT '住所1',
  address2 varchar(50) DEFAULT NULL COMMENT '住所2',
  email varchar(30) NOT NULL COMMENT 'メールアドレス',
  residence_no varchar(15) DEFAULT NULL COMMENT '在留カード番号',
  tel varchar(15) DEFAULT NULL COMMENT '電話番号',
  entry_date date NOT NULL COMMENT '入社日付',
  quit_date date DEFAULT NULL COMMENT '離任日付',
  at_japan_date date NOT NULL COMMENT '来日年間',
  start_work_date date DEFAULT NULL COMMENT '仕事経験',
  japanese_level int DEFAULT NULL COMMENT '日本語能力',
  emp_type int,
  salary int,
  price int COMMENT '単価',
  Transport_cost int COMMENT '交通費',
  status int,
  station int COMMENT '駅',
  position int COMMENT '職位',
  sales_id varchar(10) COMMENT '営業担当ID',
  project_end_plan_date date COMMENT 'プロジェクト予定終了日',
  kbn int,
  delete_falg int,
  PRIMARY KEY (emp_id),
  KEY department_id (department_id),
  KEY project_id (project_id),
  CONSTRAINT employee_ibfk_1 FOREIGN KEY (department_id) REFERENCES department (id),
  CONSTRAINT employee_ibfk_2 FOREIGN KEY (project_id) REFERENCES project (id)
) 