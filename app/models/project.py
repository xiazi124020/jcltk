from django.db import models

class Project(models.Model):
    pro_no = models.CharField(max_length=50)
    pro_name = models.CharField(max_length=20)
    pro_address = models.CharField(max_length=100)
    cust_name = models.CharField(max_length=20)
    emp_name = models.CharField(max_length=20)
    en_time = models.CharField(max_length=30)
    exit_time = models.CharField(max_length=30)
    
    class Meta:
        managed = False
        db_table = 'project'
    