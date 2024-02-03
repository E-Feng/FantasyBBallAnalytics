import json
import boto3
import psycopg2
import psycopg2.extras

from util import invoke_lambda
from espn_helper import get_espn_league_status
from yahoo_auth import get_yahoo_access_token
from yahoo_helper import get_all_league_ids


lambda_client = boto3.client('lambda', region_name='us-east-1')

db_pass = invoke_lambda(lambda_client, 'get_secret', {'key': 'supabase_password'})

conn = psycopg2.connect(
    host='aws-0-us-east-1.pooler.supabase.com',
    port='5432',
    database='postgres',
    user='postgres.lsygyiijbumuybwyuvrn',
    password=db_pass
)


def get_league_id_status(event, context):
    print(event)
    
    cursor = conn.cursor()

    league_id = event["queryStringParameters"]['leagueId']
    platform = event["queryStringParameters"]["platform"]
    league_auth_code = event["queryStringParameters"]["leagueAuthCode"]

    get_query = open("sql/get_league_info.sql", "r").read()
    get_params = {"league_id_re": f"(?<![0-9]){league_id}(?![0-9])"}

    cursor.execute(get_query, get_params)

    res = cursor.fetchall()

    if len(res) > 1:
        print("Yahoo and ESPN league found")
        return {"statusCode": 200, "body": json.dumps("AMBIGUOUS")}
    
    league_exists = bool(res)
    league_updated = league_exists and res[0][0]
    league_auth_code = res[0][1] if not league_auth_code and league_exists else league_auth_code
    platform = res[0][2] if league_exists else (platform or "espn")
    league_id = res[0][3] if league_exists else league_id

    print(f"League {league_id} on {platform}, exists {league_exists}, updated {league_updated}")

    if league_updated:
        print("League already updated, returning active")
        return {"statusCode": 200, "body": json.dumps(f"ACTIVE:{league_id}")}
    
    update_params = {
        "league_id": league_id,
        "platform": platform,
    }
    
    if platform == "espn":
        cookies = {"espn_s2": league_auth_code}

        status = get_espn_league_status(league_id, cookies)
        if status != "VALID":
            print(f"Invalid league, status: {status}")
            return {"statusCode": 200, "body": json.dumps(status)}

        event["queryStringParameters"]['cookieEspnS2'] = league_auth_code
        
        try:
            res = invoke_lambda(lambda_client, "process_espn_league", event)

            if not res:
                print("ERROR: Process ESPN lambda failed")
                raise Exception

            sql_file = "sql/update_espn_league_after_process.sql"
            update_query = open(sql_file, "r").read()
            update_params["cookie_espn"] = league_auth_code

            cursor.execute(update_query, update_params)
            conn.commit()            
        except Exception:
            print("Error processing ESPN league")
            return {"statusCode": 200, "body": json.dumps("ERROR")}

        print("League processed, returning active")
        return {"statusCode": 200, "body": json.dumps(f"ACTIVE:{league_id}")}        
    
    elif platform == "yahoo":
        tokens = get_yahoo_access_token(league_auth_code)
        if tokens.get("error"):
            error = tokens.get("error")
            print(f"Error auth with yahoo: {error}")
            return {"statusCode": 200, "body": json.dumps(error)}
        
        yahoo_access_token = tokens["yahoo_access_token"]
        yahoo_refresh_token = tokens["yahoo_refresh_token"]
        event["queryStringParameters"]["yahooAccessToken"] = yahoo_access_token

        all_leagues = get_all_league_ids(yahoo_access_token)
        main_league_id = all_leagues[0][0]

        # Getting full league id, 101 => 428.l.101
        full_league_id = league_id
        for id in all_leagues:
            if league_id in id[0]:
                full_league_id = id[0]

        if ".l." not in full_league_id:
            full_league_id = main_league_id
        
        sql_file = "sql/update_yahoo_league_after_process.sql"
        update_query = open(sql_file, "r").read()
        update_params["league_id"] = full_league_id
        update_params["yahoo_refresh_token"] = yahoo_refresh_token

        sql_file_linked = "sql/update_yahoo_linked_leagues.sql"
        update_query_linked = open(sql_file_linked, "r").read()
        update_data = []

        for league in all_leagues:
            event["queryStringParameters"]["leagueId"] = league[0]
            event["queryStringParameters"]["leagueYear"] = league[1]
            event["queryStringParameters"]["allLeagueKeys"] = all_leagues

            try:
                res = invoke_lambda(lambda_client, "process_yahoo_league", event)

                if not res:
                    print("ERROR: Process Yahoo lambda failed")
                    raise Exception
                else:
                    update_data.append((league[0], main_league_id))
            except Exception as e:
                print("Error processing Yahoo league:", e)

        cursor.execute(update_query, update_params)
        psycopg2.extras.execute_values(cursor, update_query_linked, update_data)
        conn.commit()
        
        print("League processed, returning active")
        return {"statusCode": 200, "body": json.dumps(f"ACTIVE:{full_league_id}")}       

    print("Uncommon process error, returning error")
    return {"statusCode": 200, "body": json.dumps("ERROR")}


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