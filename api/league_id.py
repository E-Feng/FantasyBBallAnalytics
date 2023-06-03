import json
import boto3
import requests
import psycopg2
from util import invoke_lambda


lambda_client = boto3.client('lambda', region_name='us-east-1')

db_pass = invoke_lambda(lambda_client, 'get_secret', {'key': 'supabase_password'})

conn = psycopg2.connect(
    host='db.lsygyiijbumuybwyuvrn.supabase.co',
    port='5432',
    database='postgres',
    user='postgres',
    password=db_pass
)


def get_league_id_status(event, context):
    league_id = event["queryStringParameters"]['leagueId']
    platform = event["queryStringParameters"]["platform"]
    
    cookie_swid_qsp = event["queryStringParameters"].get('cookieSwid', None)
    cookie_espns2_qsp = event["queryStringParameters"].get('cookieEspnS2', None)

    if cookie_swid_qsp == 'undefined': cookie_swid_qsp = None
    if cookie_espns2_qsp == 'undefined': cookie_espns2_qsp = None
    
    print(f"League id {league_id}")
    print("Query Cookies: ", cookie_espns2_qsp, cookie_swid_qsp)
    
    # Just in case, this sneaks through
    body_active = {
        'statusCode': 200,
        'body': json.dumps('ACTIVE')
    }
    
    if league_id == '00000001':
        return body_active
    
    league_exists = False

    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            (NOW() - lastupdated) < INTERVAL '1 day',
            cookieswid,
            cookieespns2
        FROM leagueids  
        WHERE leagueid = %s
        """
    , (league_id,))
    res = cursor.fetchone()
    
    if res:
        league_exists = True
        #event["queryStringParameters"]['league'] = cookie_espns2

        if res[0]: # League is updated
            return body_active

    cookie_swid_db = res[1] if res else None
    cookie_espns2_db = res[2] if res else None

    # Preparing cookie information
    cookie_swid = cookie_swid_qsp or cookie_swid_db
    cookie_espns2 = cookie_espns2_qsp or cookie_espns2_db
    
    cookies = {}
    if cookie_swid or cookie_espns2:
        cookies = {"espn_s2": cookie_espns2, "swid": cookie_swid}
        
        # Reset cookie info for event payload
        event["queryStringParameters"]['cookieEspnS2'] = cookie_espns2
        event["queryStringParameters"]['cookieSwid'] = cookie_swid

    if league_exists:
        event["queryStringParameters"]["leagueYear"] = 2023
        
    print("Final Cookies: ", cookie_espns2, cookie_swid)
            
    # League id is not in table, quickly verify
    url = f'https://fantasy.espn.com/apis/v3/games/fba/seasons/2023/segments/0/leagues/{league_id}?view=mSettings'
    
    r = requests.get(url, cookies=cookies)
    
    if r.status_code != 200:
        # Errors querying league id
        data = r.json()
        status = data['details'][0]['type']
        
        return {
            'statusCode': 200,
            'body': json.dumps(status)
        }
        
    # Call league analysis lambda
    res = invoke_lambda("process_espn_league", event)

    all_years = json.loads(res['Payload'].read().decode())['body']

    if res['StatusCode'] == 200:
        sql = """
            INSERT INTO leagueids(
                leagueid, created, lastupdated, lastviewed, platform, viewcount, active, allyears, cookieswid, cookieespns2)
            VALUES (%s, CURRENT_DATE, CURRENT_DATE, CURRENT_DATE, %s, 1, TRUE, %s, %s, %s)
            ON CONFLICT (leagueid) DO UPDATE SET
                lastupdated = NOW(), 
                viewCount = leagueids.viewCount + 1,
                allyears = EXCLUDED.allyears,
                cookieswid = %s,
                cookieespns2 = %s
        """
        params = (league_id, platform, all_years, cookie_swid, cookie_espns2, cookie_swid, cookie_espns2)
        
        cursor.execute(sql, params)
        conn.commit() 
    
        return body_active
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('ERROR')
        }
    


sql_last_viewed = """
    UPDATE public.leagueids
    SET lastViewed = NOW(), viewCount = viewCount + 1
    WHERE leagueid = %s
"""

sql_last_updated = """
    UPDATE public.leagueids
    SET lastUpdated = NOW()
    WHERE leagueid = %s
"""

def update_league_info(event, context):
    print(event)
    league_id = event['queryStringParameters'].get('leagueId')
    method = event['queryStringParameters'].get('method')
    
    cursor = conn.cursor()
    
    if method == 'lastViewed':
        params = (league_id,)
        
        cursor.execute(sql_last_viewed, params)
        
    elif method == 'lastUpdated':
        params = (league_id,)
        
        cursor.execute(sql_last_updated, params)
        
        
    rows_updated = cursor.rowcount
    
    if rows_updated > 0:
        conn.commit()
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('Updated failed') 
        }
            

    return {
        'statusCode': 200,
        'body': json.dumps('Updated successfully')
    }
