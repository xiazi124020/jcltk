from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=50)
    zip = models.CharField(max_length=7)
    address = models.CharField(max_length=100)
    tel_no = models.CharField(max_length=15)
    partener = models.CharField(max_length=1)
    other = models.CharField(max_length=30)
    
    class Meta:
        managed = False
        db_table = 'customer'
    