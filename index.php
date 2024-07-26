<!DOCTYPE html>
<html>
<head>
  <title>Picker API Quickstart</title>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="/traingoogleapi/css/index.css">
</head>
<body>
  <p>Picker API Quickstart</p>
  <button id="authorize_button" onclick="handleAuthClick()">Authorize</button>
  <button id="signout_button" onclick="handleSignoutClick()">Sign Out</button>
  <div id="form-container">
    <form id="sheet-form">
      <label for="sheet-select">Select Sheet:</label>
      <select id="sheet-select"></select><br><br>
      <label for="start-cell">Start Cell:</label>
      <input type="text" id="start-cell" placeholder="e.g., A1"><br><br>
      <label for="end-cell">End Cell:</label>
      <input type="text" id="end-cell" placeholder="e.g., B10"><br><br>
      <button type="button" onclick="handleReadData()">Read Data</button>
    </form>
  </div>

  <script src="/traingoogleapi/js/main.js"></script>
  <script async defer src="https://apis.google.com/js/api.js" onload="gapiLoaded()"></script>
  <script async defer src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>
</body>
</html>
