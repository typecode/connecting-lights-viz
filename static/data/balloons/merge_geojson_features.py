
import json
import os

output = dict(type="FeatureCollection", features=[])

for file_name in os.listdir('./'):
    print file_name
    if os.path.isfile(file_name) and os.path.getsize(file_name) and file_name.split('.')[len(file_name.split('.')) - 1] == 'json':
        json_data = open(file_name)
        #if len(json_data) != 0:
        data = json.load(json_data)
        for feature in data["features"]:
            output["features"].append(feature)

output_json = json.dumps(output)

output_file = open('output.json', 'w')
output_file.write(output_json)
output_file.close()

print 'OK'
