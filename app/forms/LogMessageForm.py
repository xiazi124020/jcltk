from django import forms
#from app.models.logmessage import LogMessage

class LogMessageForm(forms.ModelForm):
    class Meta:
        #model = LogMessage
        fields = ("message",)   # NOTE: the trailing comma is required