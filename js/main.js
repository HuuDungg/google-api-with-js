  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ];

  // TODO(developer): Set to client ID and API key from the Developer Console
  const CLIENT_ID = '1079227357584-ge537is4vba6llgjh2rlgae7id7tf7mg.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyA2ADgP66DqhS1IS_vkakubzZak-ExqBPw';

  // TODO(developer): Replace with your own project number from console.developers.google.com.
  const APP_ID = '<YOUR_APP_ID>';

  let tokenClient;
  let accessToken = null;
  let pickerInited = false;
  let gisInited = false;

  document.getElementById('authorize_button').style.visibility = 'hidden';
  document.getElementById('signout_button').style.visibility = 'hidden';

  /**
   * Callback after api.js is loaded.
   */
  function gapiLoaded() {
    gapi.load('client:picker', initializePicker);
  }

  /**
   * Callback after the API client is loaded. Loads the
   * discovery doc to initialize the API.
   */
  async function initializePicker() {
    await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
    pickerInited = true;
    maybeEnableButtons();
  }

  /**
   * Callback after Google Identity Services are loaded.
   */
  function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
  }

  function maybeEnableButtons() {
    if (pickerInited && gisInited) {
      document.getElementById('authorize_button').style.visibility = 'visible';
    }
  }

  function handleAuthClick() {
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        throw (response);
      }
      accessToken = response.access_token;
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      await createPicker();
    };

    if (accessToken === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  }


  function handleSignoutClick() {
    if (accessToken) {
      accessToken = null;
      google.accounts.oauth2.revoke(accessToken);
      document.getElementById('content').innerText = '';
      document.getElementById('authorize_button').innerText = 'Authorize';
      document.getElementById('signout_button').style.visibility = 'hidden';
    }
  }

  /**
   * Create and render a Picker object for selecting Google Sheets.
   */
  function createPicker() {
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes('application/vnd.google-apps.spreadsheet');
    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setDeveloperKey(API_KEY)
        .setAppId(APP_ID)
        .setOAuthToken(accessToken)
        .addView(view)
        .addView(new google.picker.DocsUploadView())
        .setCallback(pickerCallback)
        .build();
    picker.setVisible(true);
  }

  async function pickerCallback(data) {
    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
      let text = `Picker response: \n${JSON.stringify(data, null, 2)}\n`;
      const document = data[google.picker.Response.DOCUMENTS][0];
      const fileId = document[google.picker.Document.ID];
      
      // Lấy thông tin về file từ Drive API
      const res = await gapi.client.drive.files.get({
        'fileId': fileId,
        'fields': '*',
      });
      text += `Drive API response for first document: \n${JSON.stringify(res.result, null, 2)}\n`;
      
      // Đọc dữ liệu từ Google Sheets
      const sheetId = fileId;
      const range = 'Sheet1!A1:D10'; // Thay đổi phạm vi ô theo nhu cầu của bạn
      const sheetData = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
      });
      
      text += `Google Sheets API response: \n${JSON.stringify(sheetData.result, null, 2)}\n`;
      window.document.getElementById('content').innerText = text;
    }
  }

