
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
  id int NOT NULL AUTO_INCREMENT COMMENT '��L�[',
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
  emp_id varchar(10) NOT NULL COMMENT '�Ј��ԍ�',
  department_id int DEFAULT NULL COMMENT '����ԍ�',
  first_name varchar(15)  COMMENT '���O�P',
  last_name varchar(15) COMMENT '���O�Q',
  first_name_kana varchar(15) COMMENT '�J�i�P',
  last_name_kana varchar(15) COMMENT '�J�i�Q',
  sex varchar(1) NOT NULL COMMENT '����',
  birthday date DEFAULT NULL COMMENT '���N����',
  zip varchar(7) DEFAULT NULL COMMENT '�X�֔ԍ�',
  address1 varchar(10) DEFAULT NULL COMMENT '�Z��1',
  address2 varchar(50) DEFAULT NULL COMMENT '�Z��2',
  email varchar(30) DEFAULT NULL COMMENT '���[���A�h���X',
  residence_no varchar(15) DEFAULT NULL COMMENT '�ݗ��J�[�h�ԍ�',
  tel varchar(15) DEFAULT NULL COMMENT '�d�b�ԍ�',
  entry_date date NOT NULL COMMENT '���Г��t',
  quit_date date DEFAULT NULL COMMENT '���C���t',
  start_work_date varchar(20) DEFAULT NULL COMMENT '�d���o��',
  japanese_level int DEFAULT NULL COMMENT '���{��\��',
  emp_type int COMMENT '�Ј����',
  salary int default 0 COMMENT '����',
  price int default 0 COMMENT '�P��',
  Transport_cost int default 0 COMMENT '��ʔ�',
  status int,
  station varchar(20) COMMENT '�w',
  position int COMMENT '�E��',
  sales_id varchar(10) COMMENT '�c�ƒS��ID',
  project_end_plan_date date COMMENT '�v���W�F�N�g�\��I����',
  no_project_benefit int COMMENT '�ҋ@��',
  delete_flag int NOT NULL default 0,
  PRIMARY KEY (emp_id),
  KEY department_id (department_id),
  CONSTRAINT employee_idfk_1 FOREIGN KEY (department_id) REFERENCES department (id));

create table emp_project(
  emp_id varchar(10)  not NULL COMMENT '�Ј��ԍ�',
  project_id int  COMMENT '�v���W�F�N�g�ԍ�',
  current_flag int,
  primary key(emp_id,project_id),
  KEY emp_id (emp_id),
  KEY project_id (project_id),
  CONSTRAINT emp_pro_fk1 FOREIGN KEY (emp_id) REFERENCES employee (emp_id),
  CONSTRAINT emp_pro_fk2 FOREIGN KEY (project_id) REFERENCES project (id)
);

CREATE TABLE seisan (
  id int NOT NULL AUTO_INCREMENT COMMENT '��L�[',
  seisan_time int default 0,
  emp_id varchar(10) NOT NULL COMMENT '�Ј��ԍ�',
  ym varchar(6) default null,
  PRIMARY KEY (id),
  KEY emp_id (emp_id),  
  CONSTRAINT seisan_idfk_1 FOREIGN KEY (emp_id) REFERENCES employee (emp_id));

CREATE TABLE code (
  id int NOT NULL AUTO_INCREMENT COMMENT '��L�[',
  code_id int,
  name varchar(50) NOT NULL,
  start_date date NOT NULL,
  end_date date DEFAULT NULL,
  insert_date timestamp DEFAULT CURRENT_TIMESTAMP,
  update_date timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

create table auto_index(
  id int NOT NULL AUTO_INCREMENT COMMENT '��L�[',
  PRIMARY KEY (id)
  );

insert into  customer(name, zip, address,tel_no,email,partener,representative, station) values ( '������ЃW�F�[�V�[�G��','3350002','��ʌ��n�s�ˉz2�|1�|17�[�T�O�S','070-1448-1666', 'jianhou.zhang@jcltk.com', 1, '������','�n');
insert into  project(name, start_date, end_date, station, status, customer_id, seisan, min_time, max_time) values ('�ҋ@', now() , now() , '�n', 1, 1, 1, 0, 0);
insert into department(name) values ('�J���ꕔ');

  
--�a�̎R��
--�k�C��
--���Ɍ�
--������
--������
--���䌧
--�x�R��
--�ޗǌ�
--�Ȗ،�
--������
--�����s
--������
--���挧
--���쌧
--���茧
--�啪��
--���{
--��t��
--�ΐ쌧
--�É���
--�X��
--�_�ސ쌧
--�V����
--�H�c��
--��������
--���ꌧ
--�R����
--�R����
--�R�`��
--�O�d��
--��ʌ�
--���ꌧ
--���m��
--���쌧
--�L����
--�Q�n��
--�F�{��
--���s�{
--�{�錧
--�{�茧
--�򕌌�
--��茧
--���ꌧ
--���R��
--��錧
--���Q��
--���m��
