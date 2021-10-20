
drop table IF EXISTS emp_project;
drop table IF EXISTS seisan;
drop table IF EXISTS employee;
drop table IF EXISTS department;
drop table IF EXISTS project;
drop table IF EXISTS customer;
drop table IF EXISTS code;
drop table if exists auto_index;


CREATE TABLE customer (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  zip varchar(7) NOT NULL,
  address varchar(100) NOT NULL,
  tel_no varchar(15) NOT NULL,
  email varchar(100) DEFAULT NULL,
  partener int NOT NULL,
  representative varchar(20) NOT NULL,
  station varchar(20),
  delete_flag int NOT NULL default 0,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);


CREATE TABLE project (
  id int NOT NULL AUTO_INCREMENT COMMENT '主キー',
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
  emp_id varchar(10) NOT NULL COMMENT '社員番号',
  department_id int DEFAULT NULL COMMENT '部門番号',
  first_name varchar(15)  COMMENT '名前１',
  last_name varchar(15) COMMENT '名前２',
  first_name_kana varchar(15) COMMENT 'カナ１',
  last_name_kana varchar(15) COMMENT 'カナ２',
  sex varchar(1) NOT NULL COMMENT '性別',
  birthday date DEFAULT NULL COMMENT '生年月日',
  zip varchar(7) DEFAULT NULL COMMENT '郵便番号',
  address1 varchar(10) DEFAULT NULL COMMENT '住所1',
  address2 varchar(50) DEFAULT NULL COMMENT '住所2',
  email varchar(30) DEFAULT NULL COMMENT 'メールアドレス',
  residence_no varchar(15) DEFAULT NULL COMMENT '在留カード番号',
  tel varchar(15) DEFAULT NULL COMMENT '電話番号',
  entry_date date NOT NULL COMMENT '入社日付',
  quit_date date DEFAULT NULL COMMENT '離任日付',
  start_work_date varchar(20) DEFAULT NULL COMMENT '仕事経験',
  japanese_level int DEFAULT NULL COMMENT '日本語能力',
  emp_type int COMMENT '社員種別',
  salary int default 0 COMMENT '給料',
  price int default 0 COMMENT '単価',
  Transport_cost int default 0 COMMENT '交通費',
  status int,
  station varchar(20) COMMENT '駅',
  position int COMMENT '職位',
  sales_id varchar(10) COMMENT '営業担当ID',
  project_end_plan_date date COMMENT 'プロジェクト予定終了日',
  no_project_benefit int COMMENT '待機費',
  delete_flag int NOT NULL default 0,
  PRIMARY KEY (emp_id),
  KEY department_id (department_id),
  CONSTRAINT employee_idfk_1 FOREIGN KEY (department_id) REFERENCES department (id));

create table emp_project(
  emp_id varchar(10)  not NULL COMMENT '社員番号',
  project_id int  COMMENT 'プロジェクト番号',
  current_flag int,
  salary int default 0 COMMENT '給料',
  price int default 0 COMMENT '単価',
  primary key(emp_id,project_id),
  KEY emp_id (emp_id),
  KEY project_id (project_id),
  CONSTRAINT emp_pro_fk1 FOREIGN KEY (emp_id) REFERENCES employee (emp_id),
  CONSTRAINT emp_pro_fk2 FOREIGN KEY (project_id) REFERENCES project (id)
);

CREATE TABLE seisan (
  id int NOT NULL AUTO_INCREMENT COMMENT '主キー',
  seisan_time int default 0,
  emp_id varchar(10) NOT NULL COMMENT '社員番号',
  ym varchar(6) default null,
  PRIMARY KEY (id),
  KEY emp_id (emp_id),  
  CONSTRAINT seisan_idfk_1 FOREIGN KEY (emp_id) REFERENCES employee (emp_id));

CREATE TABLE code (
  id int NOT NULL AUTO_INCREMENT COMMENT '主キー',
  code_id int,
  name varchar(50) NOT NULL,
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

create table auto_index(
  id int NOT NULL AUTO_INCREMENT COMMENT '主キー',
  PRIMARY KEY (id)
  );

insert into  customer(name, zip, address,tel_no,email,partener,representative, station) values ( '株式会社ジェーシーエル','3350002','埼玉県蕨市塚越2－1－17ー５０４','070-1448-1666', 'jianhou.zhang@jcltk.com', 1, '張建厚','蕨');
insert into  project(name, start_date, end_date, station, status, customer_id, seisan, min_time, max_time) values ('待機', now() , now() , '蕨', 1, 1, 1, 0, 0);
insert into department(name) values ('開発一部');

  
--和歌山県
--北海道
--兵庫県
--福島県
--福岡県
--福井県
--富山県
--奈良県
--栃木県
--徳島県
--東京都
--島根県
--鳥取県
--長野県
--長崎県
--大分県
--大阪府
--千葉県
--石川県
--静岡県
--青森県
--神奈川県
--新潟県
--秋田県
--鹿児島県
--滋賀県
--山梨県
--山口県
--山形県
--三重県
--埼玉県
--佐賀県
--高知県
--香川県
--広島県
--群馬県
--熊本県
--京都府
--宮城県
--宮崎県
--岐阜県
--岩手県
--沖縄県
--岡山県
--茨城県
--愛媛県
--愛知県
