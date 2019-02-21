import cStringIO
import os, sys, traceback
import gspread
import gzip
import io
import json
from boto.s3.connection import S3Connection, OrdinaryCallingFormat
from boto.s3.key import Key
from oauth2client.client import SignedJwtAssertionCredentials

# first we need to construct `CONFIG` objects for a few things

# GOOGLE_AUTH_CONFIG: signed credentials for authenticating with Google API
#
# our plan is to use one consistent set of institutional creds from QuackBot,
# not to ask users to go through this process themselves.
# docs on creating these: https://gspread.readthedocs.io/en/latest/oauth2.html
#
# IMPORTANT: as part of the initial workflow, users will need to give
# this email address access to their spreadsheet
GOOGLE_AUTH_CONFIG = {
    'GOOGLE_API_CLIENT_EMAIL': os.environ['GOOGLE_API_CLIENT_EMAIL'],
    'GOOGLE_API_PRIVATE_KEY': os.environ['GOOGLE_API_PRIVATE_KEY'].decode('unicode_escape')
}

# GOOGLE_SHEET_CONFIG: identifies the Google Spreadsheet to pull data from
# this should be pulled from whatever storage backend we're using
GOOGLE_SHEET_CONFIG = {
    'GOOGLE_SPREADSHEET_URL': os.environ['GOOGLE_SPREADSHEET_URL']
}

# S3_AUTH_CONFIG: credentials for authenticating with S3
# we will need to create an institutional IAM user for this
S3_AUTH_CONFIG = {
    'S3_ACCESS_KEY_ID': os.environ['S3_ACCESS_KEY_ID'],
    'S3_SECRET_ACCESS_KEY': os.environ['S3_SECRET_ACCESS_KEY']
}

# S3_STORAGE_CONFIG: identifies the file we're creating/updating in S3
# our plan is to create an insitutional S3 bucket to store these files, but
# `TARGET_FILENAME` should be pulled from whatever storage backend we're using
S3_STORAGE_CONFIG = {
    'S3_TARGET_BUCKET': os.environ['S3_TARGET_BUCKET'],
    'S3_TARGET_BUCKET_DIR': '/1.0/', # allow ourselves to version storage locations
    'S3_TARGET_FILENAME': os.environ['S3_TARGET_FILENAME']
}

# TEST_MODE: optional flag for testing
# set to `True` to create local json file instead of storing in S3.
TEST_MODE = False

def authenticate_with_google():
    '''
    Creates a connection to Google Spreadsheet API with gspread library.
    '''
    credentials = SignedJwtAssertionCredentials(
        GOOGLE_AUTH_CONFIG['GOOGLE_API_CLIENT_EMAIL'],
        GOOGLE_AUTH_CONFIG['GOOGLE_API_PRIVATE_KEY'],
        scope='https://spreadsheets.google.com/feeds'
    )
    google_api_conn = gspread.authorize(credentials)
    
    return google_api_conn
    
def open_google_spreadsheet():
    '''
    Runs authentication method to connect with Google Spreadsheet API,
    then returns spreadsheet identified by `GOOGLE_SPREADSHEET_KEY`.
    '''
    google_api_conn = authenticate_with_google()
    spreadsheet = google_api_conn.open_by_url(GOOGLE_SHEET_CONFIG['GOOGLE_SPREADSHEET_URL'])
    
    return spreadsheet

def fetch_data():
    '''
    Opens the spreadsheet identified by `GOOGLE_SPREADSHEET_KEY`,
    then returns a dict object with data from the first sheet
    it contains.
    '''
    spreadsheet = open_google_spreadsheet()

    # we only get data from the first worksheet, which is something
    # to make clear in the UI and documentation.
    # it's also possible to get a sheet by name, but we probably
    # don't want to store yet another variable for that.
    worksheet = spreadsheet.get_worksheet(0)

    data = worksheet.get_all_records(empty2zero=False)

    return data

def transform_data(data):
    '''
    Transforms, filters, and/or validates spreadsheet data for JSON
    output. Each spreadsheet row passes through the transformer,
    then the method returns the whole dataset in a `dict` again.
    Currently this:
    
    * ensures that all variables going into the JSON are strings
    
    Additional filters can be added inside _transform_response_item,
    and can set `skip = True` to drop rows of data.
    '''
    def _transform_response_item(item, skip=False):
        # make sure vars are strings
        _transformed_item = {k: unicode(v) for k, v in item.iteritems() if k}
        
        # EXAMPLE: using `skip` flag to ignore rows without valid id number
        # if 'id' in _transformed_item:
        #     try:
        #         int(_transformed_item['id'])
        #     except:
        #         skip = True
        
        # if we've triggered the skip flag anywhere, drop this record
        if skip:
            _transformed_item = None
            
        return _transformed_item
    
    # pass spreadsheet rows through the transformer, dropping any empty rows
    transformed_data = filter(None, [_transform_response_item(item) for item in data])

    return transformed_data

def store_json(data, store_locally=TEST_MODE):
    data = json.dumps(data, sort_keys=True, indent=4, ensure_ascii=False)
    # if TEST_MODE is enabled, just generate local file
    if store_locally:
        filename = S3_STORAGE_CONFIG['S3_TARGET_FILENAME']
        with io.open(filename, 'w', encoding='utf8') as outfile:
            outfile.write(unicode(data))
    else:
        # authenticate with S3
        s3 = S3Connection(
            S3_AUTH_CONFIG['S3_ACCESS_KEY_ID'],
            S3_AUTH_CONFIG['S3_SECRET_ACCESS_KEY'],
            is_secure=True,
            calling_format=OrdinaryCallingFormat()
        )
    
        # access the proper S3 bucket and file
        bucket = s3.get_bucket(S3_STORAGE_CONFIG['S3_TARGET_BUCKET'])
        filename = '{0}{1}'.format(
            S3_STORAGE_CONFIG['S3_TARGET_BUCKET_DIR'],
            S3_STORAGE_CONFIG['S3_TARGET_FILENAME']
        )
        s3_key = Key(bucket, filename)

        # set file metadata
        s3_key.metadata['Content-Type'] = 'application/json'
        s3_key.metadata['Content-Encoding'] = 'gzip'

        # create gzipped version of json in memory
        memfile = cStringIO.StringIO()
        with gzip.GzipFile(filename=s3_key.key, mode='wb', fileobj=memfile) as gzip_data:
            gzip_data.write(data.encode('utf-8'))
        memfile.seek(0)

        # store static version on S3
        s3_key.set_contents_from_file(memfile)
                

def update_json_data():
    data = fetch_data()
    #print 'Fetched the data ...'

    data = transform_data(data)
    #print 'Prepped the data ...'

    store_json(data)
    #print 'Made the json and sent it to S3!'


if __name__ == "__main__":
    try:
        update_json_data()
    except Exception, e:
        sys.stderr.write('\n')
        traceback.print_exc(file=sys.stderr)
        sys.stderr.write('\n')
        sys.exit(1)
