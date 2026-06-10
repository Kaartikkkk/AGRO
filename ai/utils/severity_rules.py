def get_severity(confidence):
    """
    Maps confidence score to severity:
    * > 0.85 -> High
    * 0.60-0.85 -> Medium
    * < 0.60 -> Low (suggest re-capture)
    """
    if confidence > 0.85:
        return "High"
    elif 0.60 <= confidence <= 0.85:
        return "Medium"
    else:
        return "Low (suggest re-capture)"
