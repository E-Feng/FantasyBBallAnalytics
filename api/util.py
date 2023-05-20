import json


def invoke_lambda(client, function_name, payload):
  if not isinstance(payload, str):
    payload = json.dumps(payload)
  
  res = client.invoke(
    FunctionName=function_name,
    InvocationType='RequestResponse',
    Payload=payload
  )

  if res['StatusCode'] != 200 or res.get('FunctionError', False):
    return []

  data = json.loads(res['Payload'].read().decode())['body']

  return data