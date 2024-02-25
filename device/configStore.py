import json

def getConfigStructureAndDefaults():
    return {
        "name": {
            "default": "cueb",
            "name": "Device Name"
        },
        "osc-sendport": {
            "default": "53000",
            "name": "OSC Send Port"
        },
        "osc-recieveport": {
            "default": "53001",
            "name": "OSC Recieve Port"
        },
        "mainlogic-autogreenoff": {
            "default": "3",
            "name": "Auto turn off green light after x seconds (0 to disable)"
        }
    }

def getConfigDict():
    try:
        returnDict = json.loads(getConfigJson())
    except:
        returnDict = {}
    return returnDict

def getConfigJson():
    try:
        f = open("config.json", "r")
        returnText = f.read()
        f.close()
    except:
        returnText = ""
    return returnText

def setConfig(key, value):
    configStructureAndDefaults = getConfigStructureAndDefaults()
    if str(key) in configStructureAndDefaults:
        configDict = getConfigDict()
        configDict[str(key)] = str(value)
        f = open("config.json", "w")
        f.write(json.dumps(configDict))
        f.close()

def getConfig(key):
    key = str(key)

    configDict = getConfigDict()
    try:
        return str(configDict[key])
    except:
        pass
    
    defaultConfigDict = getConfigStructureAndDefaults()
    return str(defaultConfigDict[key]['default'])

def deleteConfig():
    f = open("config.json", "w")
    f.write("")
    f.close()