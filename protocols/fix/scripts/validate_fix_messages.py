from quickfix import *
import xml.etree.ElementTree as ET

class FIXValidator:
    def __init__(self, data_dict_path):
        self.data_dict = DataDictionary()
        self.data_dict.readFromURL(data_dict_path)
        
    def validate_message(self, raw_msg):
        try:
            msg = Message()
            msg.fromString(raw_msg, self.data_dict, False)
            return self._check_required_fields(msg)
        except Exception as e:
            return False, str(e)
    
    def _check_required_fields(self, msg):
        msg_type = msg.getHeader().getField(35)
        component = self.data_dict.getMessage(msg_type)
        
        required_fields = set()
        for field in component.getRequiredFields():
            required_fields.add(field.getTag())
            
        missing = []
        for tag in required_fields:
            if not msg.getHeader().isSetField(tag) and not msg.isSetField(tag):
                missing.append(str(tag))
                
        return len(missing) == 0, missing