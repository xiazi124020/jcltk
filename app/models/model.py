from django.db import models

class Employee(models.Model):
    emp_no = models.CharField(max_length=10)
    first_name = models.CharField(max_length=15)
    last_name = models.CharField(max_length=15)
    sex = models.CharField(max_length=1)
    birthday = models.DateTimeField()
    email = models.CharField(max_length=30)
    tel_no = models.CharField(max_length=15)
    
    class Meta:
        managed = False
        db_table = 'employee'
    