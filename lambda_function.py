import json
import boto3
from datetime import datetime, timedelta

# Initialize Bedrock client
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

def lambda_handler(event, context):
    print(f"Event received: {json.dumps(event)}")
    
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return cors_response(200, {})
        
        # Parse body
        body = json.loads(event.get('body', '{}'))
        
        if 'text' not in body:
            return cors_response(400, {'error': 'No text provided'})
        
        text = body['text']
        print(f"Processing text: {text}")
        
        # Parse with Bedrock
        event_data = parse_with_bedrock(text)
        print(f"Parsed event: {event_data}")
        
        return cors_response(200, {
            'success': True,
            'message': 'Event parsed with AWS Bedrock',
            'event': event_data,
            'original_text': text
        })
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return cors_response(500, {'error': str(e)})

def parse_with_bedrock(text):
    """Parse text using Bedrock Claude"""
    
    now = datetime.now()
    
    prompt = f"""Extract calendar event from this text: "{text}"

Current: {now.strftime('%A, %B %d, %Y at %I:%M %p')}

Return ONLY valid JSON:
{{
    "title": "event title",
    "description": "description",
    "start_time": "YYYY-MM-DDTHH:MM:SS",
    "end_time": "YYYY-MM-DDTHH:MM:SS",
    "location": ""
}}

Rules:
- No date mentioned = today ({now.strftime('%Y-%m-%d')})
- No time mentioned = 9 AM, 1 hour duration
- Use 24-hour format
- ISO 8601 format for times"""

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.3
    }
    
    response = bedrock_runtime.invoke_model(
        modelId='anthropic.claude-3-haiku-20240307-v1:0',
        contentType='application/json',
        accept='application/json',
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    event_json = response_body['content'][0]['text']
    event_json = event_json.replace('```json', '').replace('```', '').strip()
    
    return json.loads(event_json)

def cors_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(body)
    }
