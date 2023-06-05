import os
import json
import boto3
import psycopg2

from util import invoke_lambda
from espn_helper import get_espn_league_status


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
    cursor = conn.cursor()

    league_id = event["queryStringParameters"]['leagueId']
    platform = event["queryStringParameters"]["platform"]

    print(f"League id {league_id} on {platform}")

    get_query = open(os.path.join("./sql", "get_league_info.sql"), "r").read()
    get_params = {"league_id": league_id, "platform": platform}

    cursor.execute(get_query, get_params)

    res = cursor.fetchone()

    league_exists = bool(res)
    league_updated = league_exists and res[0]
    league_key = league_exists and res [1]

    if league_updated:
        return {"body": json.dumps("ACTIVE")}
    
    if platform == "espn":
        cookie_espn_qsp = event["queryStringParameters"].get('cookieEspnS2', None)
        cookie_espn = cookie_espn_qsp or league_key

        cookies = {"espn_s2": cookie_espn}

        status = get_espn_league_status(league_id, cookies)

        if status != "VALID":
            return {"body": json.dumps(status)}

        event["queryStringParameters"]['cookieEspnS2'] = cookie_espn
        
        # Call league analysis lambda
        all_years = invoke_lambda(lambda_client, "process_espn_league", event)

        update_query = open("sql/update_espn_league_after_process.sql", "r").read()
        update_params = {
            "league_id": league_id,
            "platform": platform,
            "all_years": all_years,
            "cookie_espn": cookie_espn
        }

        cursor.execute(update_query, update_params)
        conn.commit()
    
        return {"body": json.dumps("ACTIVE")}

    return {'body': json.dumps('ERROR')}
    

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