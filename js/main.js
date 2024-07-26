const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

const CLIENT_ID = '1079227357584-ge537is4vba6llgjh2rlgae7id7tf7mg.apps.googleusercontent.com';
const API_KEY = 'AIzaSyA2ADgP66DqhS1IS_vkakubzZak-ExqBPw';
const APP_ID = '<YOUR_APP_ID>';

let tokenClient;
let accessToken = null;
let pickerInited = false;
let gisInited = false;
let selectedFileId = null;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

function gapiLoaded() {
  gapi.load('client:picker', initializePicker);
}

async function initializePicker() {
  await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
  await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest');
  pickerInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES.join(' '),
    callback: '',
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
    document.getElementById('signout_button').style.visibility ='hidden';
    document.getElementById('form-container').style.display = 'none';
  }
}

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
    const document = data[google.picker.Response.DOCUMENTS][0];
    selectedFileId = document[google.picker.Document.ID];
    console.log(selectedFileId);

    const res = await gapi.client.drive.files.get({
      'fileId': selectedFileId,
      'fields': '*',
    });

    const sheetInfo = await gapi.client.sheets.spreadsheets.get({
      spreadsheetId: selectedFileId,
    });

    const sheets = sheetInfo.result.sheets.map(sheet => sheet.properties.title);
    populateSheetSelect(sheets);
  }
}

function populateSheetSelect(sheets) {
  const sheetSelect = document.getElementById('sheet-select');
  sheetSelect.innerHTML = '';
  sheets.forEach(sheet => {
    const option = document.createElement('option');
    option.value = sheet;
    option.text = sheet;
    sheetSelect.appendChild(option);
  });
}

async function handleReadData() {
  const sheetName = document.getElementById('sheet-select').value;
  const startCell = document.getElementById('start-cell').value;
  const endCell = document.getElementById('end-cell').value;
  const range = `${sheetName}!${startCell}:${endCell}`;
  await readDataSheet(selectedFileId, range);
}

async function readDataSheet(spreadsheetId, range) {
  try {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    const data = response.result.values;
    console.log(data);
    await sendData(data);
  } catch (error) {
    console.error('Error reading data from sheet:', error);
    window.document.getElementById('content').innerText = 'Error reading data from sheet.';
  }
}

function sendData(data) {
  const jsonData = JSON.stringify(data);
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'http://localhost/traingoogleapi/showData.php';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'data';
  input.value = jsonData;

  form.appendChild(input);
  document.body.appendChild(form);
  form.submit();
}

function sendArrayToServer(dataArray) {
  console.log('Sending data to server:', dataArray); // Xem dữ liệu gửi đi
  fetch('http://localhost:3000/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataArray)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Server response:', data); // Xem phản hồi từ server
    document.getElementById('message').textContent = data.message;
  })
  .catch(error => console.error('Error:', error));
}